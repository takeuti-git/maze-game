import type { Coordinate } from "../../../types/coordinate.js";
import type { Map } from "../../map.js";
import type { Player } from "../player/player.js";
import type { World } from "../../world.js";
import { Entity } from "../entity.js";
import { Dir, DIR_VECTOR, OPPOSITE_DIR, ALL_DIRS } from "../../../constants/dir.js";
import { calcCoordFromVector } from "../../coord.js";

function getRandomDir(): Dir {
    return ALL_DIRS[Math.floor(Math.random() * ALL_DIRS.length)] as Dir;
};

export abstract class Enemy extends Entity {
    public color: string;
    protected _target: Coordinate;

    constructor(map: Map, start: Coordinate) {
        super(map, start, Dir.UP);
        this._target = { x: 0, y: 0 };
        this.color = "#FFF";
    }

    public abstract updateTarget(world: World): void;

    public get target(): Coordinate {
        return { ...this._target };
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