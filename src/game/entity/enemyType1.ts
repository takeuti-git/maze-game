import { DIR_VECTOR } from "../../constants/dir.js";
import type { Coordinate } from "../../types/coordinate.js";
import { nextCoordFrom } from "../coord.js";
import type { Map } from "../map.js";
import { Enemy } from "./enemy.js";

export class EnemyType1 extends Enemy {
    constructor(start: Coordinate, map: Map) {
        super(start, map);
    }

    protected chooseDirection() {
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

        if (bestDir) this.direction = bestDir;
    } 
}