import type { Coordinate } from "../../../types/coordinate.js";
import type { StaticMap } from "../../staticMap.js";
import type { World } from "../../world.js";
import { Entity } from "../entity.js";
import { Dir, DIR_VECTOR, OPPOSITE_DIR, ALL_DIRS } from "../../../constants/dir.js";
import { calcCoordFromVector } from "../../coord.js";
import { BehaviorState } from "../../../constants/behaviorState.js";

function getRandomDir(): Dir {
    return ALL_DIRS[Math.floor(Math.random() * ALL_DIRS.length)] as Dir;
}

export abstract class Enemy extends Entity {

    protected abstract scatterCoord: Coordinate;
    protected abstract _target: Coordinate;
    protected abstract setTargetChase(world: World): void;

    protected state: BehaviorState;

    constructor(staticMap: StaticMap, start: Coordinate) {
        super(staticMap, start, Dir.Up);
        this.state = BehaviorState.Scatter;
    }

    public get target(): Coordinate {
        return { ...this._target };
    }

    public setTargetScatter(): void {
        this._target = this.scatterCoord;
    }

    private turnAround(): void {
        this.direction = OPPOSITE_DIR[this.dir];
    }

    public setState(state: BehaviorState) {
        // scatter <-> chase: 切り替わったとき移動方向を180度変更する
        switch (state) {
            case BehaviorState.Scatter:
            case BehaviorState.Chase:
                this.turnAround();
            // case BehaviorState.Frightened:
            // case BehaviorState.Eaten:
        }
        this.state = state;
        console.log(`set state: ${BehaviorState[state]}`)
    }

    public updateTarget(world: World): void {
        switch (this.state) {
            case BehaviorState.Scatter:
                this.setTargetScatter();
                break;
            case BehaviorState.Chase:
                this.setTargetChase(world);
                break;
            case BehaviorState.Frightened:
                break; // TODO
            case BehaviorState.Eaten:
                break; // TODO
            default:
                break; // fallback / unnecessary
        }
    }

    protected getDirCandidates(): Dir[] {
        // 壁に当たらず進行方向と逆以外のDIR配列を返す
        const filtered = ALL_DIRS.filter(dir => {
            if (dir === OPPOSITE_DIR[this.direction]) return false;
            return !this.willHitWall(this.coord, calcCoordFromVector(this.coord, DIR_VECTOR[dir]));
        });

        if (filtered.length > 0) {
            return filtered;
        }
        else {
            return [OPPOSITE_DIR[this.direction]]; // 候補がない(行き止まり)なら逆走を許す
        }
    }

    protected chooseDirection(): Dir {
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
        this.direction = this.chooseDirection();
        this.coord = calcCoordFromVector(this.coord, DIR_VECTOR[this.direction]);
        this.wrapMovement();
    }
}