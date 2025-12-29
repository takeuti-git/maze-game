import type { Coordinate } from "../../../types/coordinate.js";
import type { StaticMap } from "../../staticMap.js";
import type { World } from "../../world.js";
import { Entity } from "../entity.js";
import { Dir, DIR_VECTOR, OPPOSITE_DIR, ALL_DIRS } from "../../../constants/dir.js";
import { calcCoordFromVector } from "../../coord.js";
import { EnemyBehaviorState, EnemyPhysicalState  } from "../../../constants/enemyState.js";

function getRandomDir(): Dir {
    return ALL_DIRS[Math.floor(Math.random() * ALL_DIRS.length)] as Dir;
}

export abstract class Enemy extends Entity {

    protected abstract scatterCoord: Coordinate;
    protected abstract _target: Coordinate;
    protected abstract calcChaseTarget(world: World): Coordinate;

    protected physicalState: EnemyPhysicalState;
    protected behaviorState: EnemyBehaviorState;

    protected releaseDelay: number;
    protected elapsedInHouse: number = 0;
    protected houseExit: Coordinate = { x: 13, y: 11 };

    private houseMoveDir: 1 | - 1 = 1;

    constructor(staticMap: StaticMap, start: Coordinate, releaseDelay: number) {
        super(staticMap, start, Dir.Up);

        this.releaseDelay = releaseDelay;
        this.physicalState = EnemyPhysicalState.InHouse;
        this.behaviorState = EnemyBehaviorState.Scatter;
    }

    public get target(): Coordinate {
        return { ...this._target };
    }

    // ====================
    // Behavior State
    // ====================

    public setBehaviorState(state: EnemyBehaviorState) {
        if (this.behaviorState === state) return;

        this.behaviorState = state;

        console.log(`${this.color} set state: ${EnemyBehaviorState[state]}`);

        if (
            state === EnemyBehaviorState.Scatter ||
            state === EnemyBehaviorState.Chase
        ) {
            this.direction = OPPOSITE_DIR[this.direction];
        }
    }

    // ====================
    // Physical State Update
    // ====================

    protected updatePhysicalState() {
        switch (this.physicalState) {

            case EnemyPhysicalState.InHouse:
                this.updateInHouse();
                break;

            case EnemyPhysicalState.LeavingHouse:
                this.updateLeavingHouse();
                break;

            case EnemyPhysicalState.Active:
                // 何もしない
                break;

            case EnemyPhysicalState.Returning:
                this.updateReturning();
                break;
        }
    }

    private updateInHouse(): void {
        this.elapsedInHouse += 160; // same as gameTick

        this.coord.y += this.houseMoveDir;

        if (this.willHitWall(
            this.coord,
            { x: this.coord.x, y: this.coord.y + this.houseMoveDir }
        )) {
            this.houseMoveDir *= -1;
        }

        if (this.elapsedInHouse >= this.releaseDelay) {
            this.physicalState = EnemyPhysicalState.LeavingHouse;
        }
    }

    private updateLeavingHouse(): void {
        const dx = this.houseExit.x - this.coord.x;
        const dy = this.houseExit.y - this.coord.y;

        if (dx === 0 && dy === 0) {
            this.physicalState = EnemyPhysicalState.Active;
            return;
        }

        if (dx !== 0) {
            this.coord.x += Math.sign(dx);
        } else {
            this.coord.y += Math.sign(dy);
        }
    }

    private updateReturning(): void {
        const dx = this.houseExit.x - this.coord.x;
        const dy = this.houseExit.y - this.coord.y;

        if (dx === 0 && dy === 0) {
            this.elapsedInHouse = 0;
            this.physicalState = EnemyPhysicalState.InHouse;
            this.behaviorState = EnemyBehaviorState.Scatter;
            return;
        }

        if (dy !== 0) {
            this.coord.y += Math.sign(dy);
        } else {
            this.coord.x += Math.sign(dx);
        }
    }

    // ====================
    // Target Decision
    // ====================

    public updateTarget(world: World): void {
        this._target = this.decideNextTarget(world);
    }

    private decideNextTarget(world: World): Coordinate {
        // 物理状態が優先
        if (
            this.physicalState === EnemyPhysicalState.InHouse ||
            this.physicalState === EnemyPhysicalState.LeavingHouse ||
            this.physicalState === EnemyPhysicalState.Returning
        ) {
            return this.houseExit;
        }

        // Activeの時のみ行動AIを使う
        switch (this.behaviorState) {
            case EnemyBehaviorState.Scatter:
                return this.scatterCoord;

            case EnemyBehaviorState.Chase:
                return this.calcChaseTarget(world);

            case EnemyBehaviorState.Frightened:
                return this.randomNeighbor();

            default:
                return this.coord;
        }
    }

    // ====================
    // Movement (Active only)
    // ====================

    private getDirCandidates(): Dir[] {
        // 壁に当たらず進行方向と逆以外のDIR配列を返す
        const filtered = ALL_DIRS.filter(dir => {
            if (dir === OPPOSITE_DIR[this.direction]) return false;
            return !this.willHitWall(
                this.coord,
                calcCoordFromVector(this.coord, DIR_VECTOR[dir])
            );
        });

        return filtered.length > 0
            ? filtered
            : [OPPOSITE_DIR[this.direction]] // 候補がない(行き止まり)なら逆走を許す
    }

    private chooseDirection(): Dir {
        const candidates = this.getDirCandidates();

        let bestDir = candidates[0] as Dir;
        let minDist = Infinity;

        for (const dir of candidates) {
            const next = calcCoordFromVector(this.coord, DIR_VECTOR[dir]);
            const dx = next.x - this.target.x;
            const dy = next.y - this.target.y;
            const dist = dx * dx + dy * dy;

            if (dist < minDist) {
                minDist = dist;
                bestDir = dir;
            }
        }
        return bestDir;
    }

    public move() {
        if (this.physicalState !== EnemyPhysicalState.Active) {
            this.updatePhysicalState();
            return;
        }

        this.updatePhysicalState();
        this.direction = this.chooseDirection();
        this.coord = calcCoordFromVector(this.coord, DIR_VECTOR[this.direction]);
        this.wrapMovement();
    }

    // ====================
    // Utilities
    // ====================
    
    private randomNeighbor(): Coordinate {
        const dir = getRandomDir();
        return calcCoordFromVector(this.coord, DIR_VECTOR[dir]);
    }
}