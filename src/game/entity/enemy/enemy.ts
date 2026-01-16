import type { TileCoord } from "../../../types/coordinate.js";
import type { StaticMap } from "../../staticMap.js";
import type { World } from "../../world.js";
import type { Player } from "../player/player.js";
import { Entity } from "../entity.js";
import { Dir, OPPOSITE_DIR, ALL_DIRS } from "../../../constants/dir.js";
import { calcTileCoordFromDir, isSameTile, tileCoordToCenterPixelCoord } from "../../coord.js";
import { BehaviorState, PhysicalState } from "../../../constants/enemyState.js";
import { COLORS } from "../../../constants/colors.js";

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

    private physicalState: PhysicalState = PhysicalState.InHouse;
    private behaviorState: BehaviorState = BehaviorState.Scatter;

    private releaseDelay: number;
    private elapsedInHouse: number = 0;
    private houseExit: TileCoord = { tx: 13, ty: 11 };

    private lastDecisionTile: TileCoord | null = null;

    constructor(staticMap: StaticMap, start: TileCoord, releaseDelay: number) {
        super(staticMap, start, Dir.Up);
        this.releaseDelay = releaseDelay;
    }

    get target(): TileCoord {
        return { ...this._target };
    }

    get color(): string {
        if (this.behaviorState === BehaviorState.Eaten) return COLORS.EATEN;
        else if (this.behaviorState === BehaviorState.Frightened) return COLORS.FRIGHTENED;
        return this._color;
    }

    /**
     * 1. 状態に応じて移動速度を変更する
     * 2. 状態に応じて内部情報を変更する
     * 3. 移動する
     * 4. ターゲットを更新する
     * 5. 帰還状態なら通常状態への切り替わりをチェックする
     */
    public update(delta: number, world: World) {
        this.updateSpeed();

        switch (this.physicalState) {
            case PhysicalState.InHouse:
                this.updateInHouse();
                this.elapsedInHouse += delta;
                break;

            case PhysicalState.LeavingHouse:
                this.updateLeavingHouse();
                break;

            case PhysicalState.Active:
                this.updateActive();
                break;
        }

        this.move(delta);
        this.updateTarget(world);
        this.checkEatenComplete(world.currentBehaviorState);
    }

    public handlePlayerCollision(player: Player): boolean {
        if (this.physicalState !== PhysicalState.Active) return false;
        if (this.behaviorState === BehaviorState.Eaten) return false;

        const isCollided = this.collideEntity(player, COLLISION_RANGE_PX)

        if (this.behaviorState === BehaviorState.Frightened) {
            if (isCollided) this.setBehaviorState(BehaviorState.Eaten);
            return false;
        }

        return isCollided;
    }

    public isBehaviorState(state: BehaviorState): boolean {
        return this.behaviorState === state;
    }

    public setBehaviorState(state: BehaviorState) {
        this.behaviorState = state;

        // Scatter <-> Chase の切り替わり時には進行方向を必ず逆にする
        if (state === BehaviorState.Scatter || state === BehaviorState.Chase) {
            this.direction = OPPOSITE_DIR[this.direction];
            this.lastDecisionTile = { ...this.tilePos };
        }
    }

    // ===========================
    // Private methods
    // ===========================

    private updateInHouse(): void {
        if (this.elapsedInHouse >= this.releaseDelay) {
            this.physicalState = PhysicalState.LeavingHouse;
            return;
        }

        if (this.pixelPos.py < HOUSE_VERTICAL_MIN_PX) this.direction = Dir.Down;
        else if (this.pixelPos.py > HOUSE_VERTICAL_MAX_PX) this.direction = Dir.Up;
    }

    private updateLeavingHouse(): void {
        const exitPx = tileCoordToCenterPixelCoord(this.houseExit);
        const dx = exitPx.px - this.pixelPos.px;
        const dy = exitPx.py - this.pixelPos.py;

        if (Math.abs(dx) < EPS_PX && Math.abs(dy) < EPS_PX) {
            this.pixelPos.px = exitPx.px;
            this.pixelPos.py = exitPx.py;
            this.physicalState = PhysicalState.Active;
            return;
        }

        if (Math.abs(dx) > EPS_PX) {
            this.direction = dx > 0 ? Dir.Right : Dir.Left;
        }
        else {
            this.direction = dy > 0 ? Dir.Down : Dir.Up;
        }
    }

    private updateActive(): void {
        if (!this.isOnTileCenter()) return;
        if (this.lastDecisionTile && isSameTile(this.tilePos, this.lastDecisionTile)) return;

        this.direction = this.chooseBestDir(this.tilePos);
        this.lastDecisionTile = { ...this.tilePos };
    }

    private updateSpeed(): void {
        if (
            this.physicalState === PhysicalState.InHouse ||
            this.physicalState === PhysicalState.LeavingHouse
        ) {
            this.speed = SPEEDS.inHouse;
            return;
        }

        switch (this.behaviorState) {
            case BehaviorState.Frightened:
                this.speed = SPEEDS.frightened;
                return;
            case BehaviorState.Eaten:
                this.speed = SPEEDS.eaten;
                return;
            default:
                this.speed = this.defaultSpeed;
                return;
        }
    }

    private updateTarget(world: World): void {
        if (!this.isOnTileCenter()) return;

        this._target = ((): TileCoord => {
            // 物理状態が優先
            if (
                this.physicalState === PhysicalState.InHouse ||
                this.physicalState === PhysicalState.LeavingHouse
            ) {
                return this.houseExit;
            }

            // Active時のみ行動AIを使う
            switch (this.behaviorState) {
                case BehaviorState.Scatter:
                    return this.scatterCoord;

                case BehaviorState.Chase:
                    return this.calcChaseTarget(world);

                case BehaviorState.Frightened:
                    return getRandomNeighborTile(this.tilePos);

                case BehaviorState.Eaten:
                    return this.houseExit;

                default:
                    return this.tilePos;
            }
        })();
    }

    private checkEatenComplete(resumeMode: BehaviorState): void {
        if (
            this.behaviorState === BehaviorState.Eaten &&
            isSameTile(this.tilePos, this.houseExit)
        ) {
            this.physicalState = PhysicalState.Active;
            this.setBehaviorState(resumeMode);
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
}