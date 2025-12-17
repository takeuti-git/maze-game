import type { Coordinate } from "../../types/coordinate";
import { Entity } from "./entity.js";
import { Dir, DIR_VECTOR, OPPOSITE_DIR, ALL_DIRS } from "../../constants/dir.js";
import { nextCoordFrom } from "../coord.js";
import type { Map } from "../map";

function getRandomDir(): Dir {
    return ALL_DIRS[Math.floor(Math.random() * ALL_DIRS.length)] as Dir;
};

export class Enemy extends Entity {
    private _target: Coordinate;

    constructor(map: Map) {
        super(map, { x: 6, y: 9 }, getRandomDir());
        this._target = { x: 1, y: 1 };
    }

    get target(): Coordinate {
        return { ...this._target };
    }

    setTarget(coord: Coordinate) {
        this._target = { ...coord };
    }

    private getDirCandidates(): Dir[] {
        // 4方向のベクトルを持つDIRから、進行可能な方向だけ残す
        return ALL_DIRS.filter(dir => {
            if (dir === OPPOSITE_DIR[this.direction]) return false;
            const vec = DIR_VECTOR[dir];
            return !this.willHitWallAt(nextCoordFrom(this.coord, vec));
        }) || [OPPOSITE_DIR[this.direction]]; // 行き止まりで候補がなくなったら逆走を許す
    }

    private chooseDirection() {
        const candidates = this.getDirCandidates();

        let bestDir = candidates[0];
        let minDist = Infinity;

        for (const dir of candidates) {
            const next = nextCoordFrom(this.coord, DIR_VECTOR[dir]);
            const dx = next.x - this.target.x;
            const dy = next.y - this.target.y;
            const dist = dx * dx + dy * dy;

            if (dist < minDist) {
                minDist = dist;
                bestDir = dir;
            }
        }
        this.direction = bestDir as Dir;
    }

    move() {
        this.chooseDirection();

        this.coord = nextCoordFrom(this.coord, DIR_VECTOR[this.direction]);
        this.wrapMovement();
    }
}
