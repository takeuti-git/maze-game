import type { TileCoord } from "../../../types/coordinate.js";
import type { StaticMap } from "../../staticMap.js";
import type { World } from "../../world.js";
import { Entity } from "../entity.js";
import { Dir, OPPOSITE_DIR, ALL_DIRS } from "../../../constants/dir.js";
import { calcTileCoordFromDir, isSameTile, tileCoordToCenterPixelCoord } from "../../coord.js";
import { EnemyBehaviorState, EnemyPhysicalState } from "../../../constants/enemyState.js";
import { COLORS } from "../../../constants/colors.js";
import type { Player } from "../player/player.js";

const COLLISION_RANGE_PX = 10;
const HOUSE_VERTICAL_MIN_PX = 280;
const HOUSE_VERTICAL_MAX_PX = 330;
const EPS_PX = 1;

const SPEEDS = {
    inHouse: 60,
    frightened: 90,
    eaten: 300,
} as const;


function getRandomDir(): Dir {
    return ALL_DIRS[Math.floor(Math.random() * ALL_DIRS.length)] as Dir;
}

function getRandomNeighborTile(currentTile: TileCoord): TileCoord {
    return calcTileCoordFromDir(currentTile, getRandomDir());
}

export abstract class Enemy extends Entity {
    protected readonly abstract scatterCoord: TileCoord;
    protected abstract readonly _color: string;
    protected abstract _target: TileCoord;
    protected abstract calcChaseTarget(world: World): TileCoord;

    protected physicalState: EnemyPhysicalState = EnemyPhysicalState.InHouse;
    public behaviorState: EnemyBehaviorState = EnemyBehaviorState.Scatter;

    protected releaseDelay: number;
    protected elapsedInHouse: number = 0;
    protected houseExit: TileCoord = { tx: 13, ty: 11 };

    private houseMoveDir: 1 | - 1 = 1;
    private lastDecisionTile: TileCoord | null = null;

    constructor(staticMap: StaticMap, start: TileCoord, releaseDelay: number) {
        super(staticMap, start, Dir.Up);
        this.releaseDelay = releaseDelay;
    }

    public get target(): TileCoord {
        return { ...this._target };
    }

    public get color(): string {
        if (this.behaviorState === EnemyBehaviorState.Eaten) return COLORS.EATEN;
        else if (this.behaviorState === EnemyBehaviorState.Frightened) return COLORS.FRIGHTENED;
        return this._color;
    }

    /**
     * 1. 状態に応じて移動速度を変更する
     * 2. 移動する
     * 3. ターゲットを更新する
     * 4. 帰還状態なら通常状態への切り替わりをチェックする
     */
    public update(delta: number, world: World) {
        this.updateSpeed();

        switch (this.physicalState) {
            case EnemyPhysicalState.InHouse:
                this.updateInHouse(delta);
                break;

            case EnemyPhysicalState.LeavingHouse:
                this.updateLeavingHouse(delta);
                break;

            case EnemyPhysicalState.Active:
                this.updateActive(delta);
                break;
        }

        this.updateTarget(world);
        this.checkEatenComplete(world.currentBehaviorState);
    }

    public handlePlayerCollision(player: Player): boolean {
        if (this.physicalState !== EnemyPhysicalState.Active) return false;
        if (this.behaviorState === EnemyBehaviorState.Eaten) return false;

        const isCollided = this.collideEntity(player, COLLISION_RANGE_PX)

        if (this.behaviorState === EnemyBehaviorState.Frightened) {
            if (isCollided) this.setBehaviorState(EnemyBehaviorState.Eaten);
            return false;
        }

        return isCollided;
    }
    // ====================
    // Behavior State
    // ====================

    public setBehaviorState(state: EnemyBehaviorState) {
        this.behaviorState = state;

        // Scatter <-> Chase の切り替わり時には進行方向を必ず逆にする
        if (state === EnemyBehaviorState.Scatter || state === EnemyBehaviorState.Chase) {
            this.direction = OPPOSITE_DIR[this.direction];
            this.lastDecisionTile = { ...this.tilePos };
        }

        console.debug(`${this.color} set state: ${EnemyBehaviorState[state]}`);
    }

    // ====================
    // Physical State
    // ====================

    private updateInHouse(delta: number): void {
        if (this.elapsedInHouse >= this.releaseDelay) {
            this.physicalState = EnemyPhysicalState.LeavingHouse;
            return;
        }

        if (this.pixelPos.py < HOUSE_VERTICAL_MIN_PX) this.houseMoveDir = 1;
        else if (this.pixelPos.py > HOUSE_VERTICAL_MAX_PX) this.houseMoveDir = -1;

        this.elapsedInHouse += delta;
        this.pixelPos.py += this.houseMoveDir * this.speed * delta;
    }

    private updateLeavingHouse(delta: number): void {
        const exitPx = tileCoordToCenterPixelCoord(this.houseExit);
        const dx = exitPx.px - this.pixelPos.px;
        const dy = exitPx.py - this.pixelPos.py;

        if (Math.abs(dx) < EPS_PX && Math.abs(dy) < EPS_PX) {
            this.pixelPos.px = exitPx.px;
            this.pixelPos.py = exitPx.py;
            this.physicalState = EnemyPhysicalState.Active;
            return;
        }

        if (Math.abs(dx) > EPS_PX) {
            this.direction = dx > 0 ? Dir.Right : Dir.Left;
        }
        else {
            this.direction = dy > 0 ? Dir.Down : Dir.Up;
        }

        this.move(delta);
    }

    private updateActive(delta: number): void {
        const onCenter = this.isOnTileCenter();

        if (onCenter) this.updateDirection();

        this.move(delta);
    }

    // ====================
    // Target Decision
    // ====================

    private updateTarget(world: World): void {
        if (this.isOnTileCenter()) return;
        this._target = this.decideNextTarget(world);
    }

    private decideNextTarget(world: World): TileCoord {
        // 物理状態が優先
        if (
            this.physicalState === EnemyPhysicalState.InHouse ||
            this.physicalState === EnemyPhysicalState.LeavingHouse
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

            case EnemyBehaviorState.Eaten:
                return this.houseExit;

            default:
                return this.tilePos;
        }
    }

    // ====================
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

    private updateSpeed(): void {
        if (
            this.physicalState === EnemyPhysicalState.InHouse ||
            this.physicalState === EnemyPhysicalState.LeavingHouse
        ) {
            this.speed = SPEEDS.inHouse;
            return;
        }

        switch (this.behaviorState) {
            case EnemyBehaviorState.Frightened:
                this.speed = SPEEDS.frightened;
                return;
            case EnemyBehaviorState.Eaten:
                this.speed = SPEEDS.eaten;
                return;
            default:
                this.speed = this.defaultSpeed;
        }
    }

    private updateDirection(): void {
        if (this.lastDecisionTile && isSameTile(this.tilePos, this.lastDecisionTile)) return;

        this.direction = this.chooseBestDir(this.tilePos);
        this.lastDecisionTile = { ...this.tilePos };
    }

    private checkEatenComplete(resumeMode: EnemyBehaviorState): void {
        if (
            this.behaviorState === EnemyBehaviorState.Eaten &&
            isSameTile(this.tilePos, this.houseExit)
        ) {
            this.physicalState = EnemyPhysicalState.Active;
            this.setBehaviorState(resumeMode);
        }
    }
}