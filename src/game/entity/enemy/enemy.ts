import type { PixelCoord, TileCoord } from "../../../types/coordinate.js";
import type { StaticMap } from "../../staticMap.js";
import type { World } from "../../world.js";
import { Entity } from "../entity.js";
import { Dir, OPPOSITE_DIR, ALL_DIRS } from "../../../constants/dir.js";
import { calcTileCoordFromDir, isSameTile, tileCoordToCenterPixelCoord } from "../../coord.js";
import { EnemyBehaviorState, EnemyPhysicalState } from "../../../constants/enemyState.js";
import { TILE_SIZE } from "../../../constants/tilesize.js";
import { COLORS } from "../../../constants/colors.js";

function getRandomDir(): Dir {
    return ALL_DIRS[Math.floor(Math.random() * ALL_DIRS.length)] as Dir;
}

function getRandomNeighborTile(currentTile: TileCoord): TileCoord {
    const dir = getRandomDir();
    return calcTileCoordFromDir(currentTile, dir);
}

export abstract class Enemy extends Entity {

    protected readonly abstract scatterCoord: TileCoord;
    protected abstract _target: TileCoord;
    protected abstract calcChaseTarget(world: World): TileCoord;

    protected physicalState: EnemyPhysicalState;
    protected behaviorState: EnemyBehaviorState;

    protected releaseDelay: number;
    protected elapsedInHouse: number = 0;
    protected houseExit: TileCoord = { tx: 13, ty: 11 };

    private houseMoveDir: 1 | - 1 = 1;

    private lastDecisionTile: TileCoord | null = null;

    protected abstract _color: string;

    constructor(staticMap: StaticMap, start: TileCoord, releaseDelay: number) {
        super(staticMap, start, Dir.Up);

        this.releaseDelay = releaseDelay;
        this.physicalState = EnemyPhysicalState.InHouse;
        this.behaviorState = EnemyBehaviorState.Scatter;
    }

    public get target(): TileCoord {
        return { ...this._target };
    }

    public get color(): string {
        if (this.physicalState === EnemyPhysicalState.Returning) {
            return COLORS.EATEN;
        }
        else if (this.behaviorState === EnemyBehaviorState.Frightened) {
            return COLORS.FRIGHTENED;
        }

        return this._color;
    }

    // ====================
    // Behavior State
    // ====================

    public setBehaviorState(state: EnemyBehaviorState) {
        if (this.behaviorState === state) return;

        this.behaviorState = state;

        console.log(`${this.color} set state: ${EnemyBehaviorState[state]}`);

        // Scatter <-> Chase の切り替わり時には進行方向を必ず逆にする
        if (
            this.physicalState !== EnemyPhysicalState.Returning &&
            state === EnemyBehaviorState.Scatter ||
            state === EnemyBehaviorState.Chase
        ) {
            this.direction = OPPOSITE_DIR[this.direction];
            this.lastDecisionTile = { ...this.tilePos };
        }
    }

    public enterFrightened() {
        this.setBehaviorState(EnemyBehaviorState.Frightened);
    }

    public exitFrightened(resumeMode: EnemyBehaviorState) {
        this.setBehaviorState(resumeMode);
    }

    // ====================
    // Physical State
    // ====================

    public setPhysicalState(state: EnemyPhysicalState): void {
        if (this.physicalState === state) return;

        this.physicalState = state;
    }

    private updateInHouse(delta: number): void {
        this.elapsedInHouse += delta;

        const SPEED = 20; // house内限定の移動速度
        this.pixelPos.py += this.houseMoveDir * SPEED * delta;

        const { center } = this.getCurrentTile();

        const RANGE = TILE_SIZE / 2 - 1;
        if (Math.abs(this.pixelPos.py - center.cy) > RANGE) {
            this.houseMoveDir *= -1;
        }

        if (this.elapsedInHouse >= this.releaseDelay) {
            this.physicalState = EnemyPhysicalState.LeavingHouse;
        }
    }

    private updateLeavingHouse(delta: number): void {
        const exitPx = tileCoordToCenterPixelCoord(this.houseExit);
        const dx = exitPx.px - this.pixelPos.px;
        const dy = exitPx.py - this.pixelPos.py;
        const EPS = 1;

        if (Math.abs(dx) < EPS && Math.abs(dy) < EPS) {
            this.pixelPos.px = exitPx.px;
            this.pixelPos.py = exitPx.py;
            this.physicalState = EnemyPhysicalState.Active;
            return;
        }

        if (Math.abs(dx) > EPS) {
            this.direction = dx > 0 ? Dir.Right : Dir.Left;
        }
        else {
            this.direction = dy > 0 ? Dir.Down : Dir.Up;
        }

        this.move(delta);
    }

    // ====================
    // Target Decision
    // ====================

    public updateTarget(world: World): void {
        const { center } = this.getCurrentTile();
        const onCenter = this.isOnTileCenter(center.cx, center.cy);
        if (onCenter) {
            this._target = this.decideNextTarget(world);
        }
    }

    private decideNextTarget(world: World): TileCoord {
        // 物理状態が優先
        if (
            this.physicalState === EnemyPhysicalState.InHouse ||
            this.physicalState === EnemyPhysicalState.LeavingHouse ||
            this.physicalState === EnemyPhysicalState.Returning
        ) {
            return this.houseExit;
        }

        // Active時のみ行動AIを使う
        switch (this.behaviorState) {
            case EnemyBehaviorState.Scatter:
                return this.scatterCoord;

            case EnemyBehaviorState.Chase:
                return this.calcChaseTarget(world);

            case EnemyBehaviorState.Frightened:
                return getRandomNeighborTile(this.tilePos);

            default:
                return this.tilePos;
        }
    }

    // ====================
    // Movement (Active only)
    // ====================

    private getDirCandidates(currentTile: TileCoord): Dir[] {
        // 壁に当たらず進行方向と逆以外のDIR配列を返す
        const filtered = ALL_DIRS.filter(dir => {
            if (dir === OPPOSITE_DIR[this.direction]) return false;
            return this.canMoveToDir(currentTile, dir);
        });

        return filtered.length > 0
            ? filtered
            : [OPPOSITE_DIR[this.direction]] // 候補がない(行き止まり)なら逆走を許す
    }

    private chooseBestDir(currentTile: TileCoord): Dir {
        const candidates = this.getDirCandidates(currentTile);

        let bestDir = candidates[0] as Dir;
        let minDist = Infinity;

        for (const dir of candidates) {
            const next = calcTileCoordFromDir(currentTile, dir);
            const dx = next.tx - this.target.tx;
            const dy = next.ty - this.target.ty;
            const dist = dx * dx + dy * dy;

            if (dist < minDist) {
                minDist = dist;
                bestDir = dir;
            }
        }
        return bestDir;
    }

    public update(delta: number) {
        switch (this.physicalState) {
            case EnemyPhysicalState.InHouse:
                this.updateInHouse(delta);
                return

            case EnemyPhysicalState.LeavingHouse:
                this.updateLeavingHouse(delta);
                return;

            case EnemyPhysicalState.Returning:
            case EnemyPhysicalState.Active:
                this.updateActive(delta);
                return;
        }
    }

    private updateActive(delta: number): void {
        this.updateSpeed();

        if (this.physicalState === EnemyPhysicalState.Returning) {
            this._target = this.houseExit;
        }

        this.updateDirectionIfNeeded();
        this.move(delta);
    }

    private updateSpeed(): void {
        if (this.physicalState === EnemyPhysicalState.Returning) {
            this.speed = 100;
            return;
        }

        switch (this.behaviorState) {
            case EnemyBehaviorState.Frightened:
                this.speed = 30;
                break;
            default:
                this.speed = this.defaultSpeed;
        }
    }

    private updateDirectionIfNeeded(): void {
        const { tile, center } = this.getCurrentTile();
        const onCenter = this.isOnTileCenter(center.cx, center.cy);

        if (!onCenter) return;
        if (this.lastDecisionTile && isSameTile(tile, this.lastDecisionTile)) return;

        this.direction = this.chooseBestDir(tile);
        this.lastDecisionTile = { ...tile };
    }

    public checkReturningComplete(resumeMode: EnemyBehaviorState): void {
        if (
            this.physicalState === EnemyPhysicalState.Returning &&
            isSameTile(this.tilePos, this.houseExit)
        ) {
            this.setPhysicalState(EnemyPhysicalState.Active);
            this.setBehaviorState(resumeMode);
        }
    }

    // ====================
    // Utilities
    // ====================

    public handlePlayerCollision(playerPos: PixelCoord): boolean {
        const COLLISION_RANGE = 10; // pixel
        const isCollided = (
            Math.abs(playerPos.px - this.pixelPos.px) < COLLISION_RANGE &&
            Math.abs(playerPos.py - this.pixelPos.py) < COLLISION_RANGE
        );

        if (this.physicalState !== EnemyPhysicalState.Active) return false;
        if (this.behaviorState === EnemyBehaviorState.Frightened) {
            if (isCollided) this.setPhysicalState(EnemyPhysicalState.Returning);
            return false;
        }

        return isCollided;
    }
}