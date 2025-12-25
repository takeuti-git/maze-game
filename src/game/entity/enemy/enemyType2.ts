import type { Coordinate } from "../../../types/coordinate.js";
import type { Map } from "../../map.js";
import { Dir, DIR_VECTOR } from "../../../constants/dir.js";
import { nextCoordFrom } from "../../coord.js";
import { Enemy } from "./enemy.js";

export class EnemyType2 extends Enemy {
    constructor(map: Map) {
        const start = { x: 13, y: 15 };
        super(map, start);
        this._target = { x: 1, y: -1 };
    }

    public setTarget(coord: Coordinate, dir: Dir) {
        const vec = DIR_VECTOR[dir];
        const offsetX = vec.vx * 4;
        const offsetY = vec.vy * 4;
        this._target = { x: coord.x + offsetX, y: coord.y + offsetY };
    }

    protected chooseDirection(): Dir {
        const candidates = this.getDirCandidates();

        let bestDir = candidates[0] as Dir;
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
        return bestDir;
    }
}