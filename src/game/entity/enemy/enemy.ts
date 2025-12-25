import type { Coordinate } from "../../../types/coordinate.js";
import type { Map } from "../../map.js";
import { Entity } from "../entity.js";
import { Dir, DIR_VECTOR, OPPOSITE_DIR, ALL_DIRS } from "../../../constants/dir.js";
import { nextCoordFrom } from "../../coord.js";

function getRandomDir(): Dir {
    return ALL_DIRS[Math.floor(Math.random() * ALL_DIRS.length)] as Dir;
};

export abstract class Enemy extends Entity {
    protected _target: Coordinate;

    constructor(map: Map, start: Coordinate) {
        super(map, start, getRandomDir());
        this._target = { x: 0, y: 0 };
    }

    get target() {
        return { ...this._target };
    }

    setTarget(coord: Coordinate) {
        this._target = { ...coord };
    }

    protected getDirCandidates(): Dir[] {
        // 壁に当たらず進行方向と逆以外のDIR配列を返す
        const filtered = ALL_DIRS.filter(dir => {
            if (dir === OPPOSITE_DIR[this.direction]) return false;
            return !this.willHitWallAt(nextCoordFrom(this.coord, DIR_VECTOR[dir]));
        });

        if (filtered.length > 0) {
            return filtered;
        }
        else {
            return [OPPOSITE_DIR[this.direction]]; // 行き止まりなら逆走を許す
        } 
    }

    protected abstract chooseDirection(): Dir;

    public move() {
        this.direction = this.chooseDirection();
        this.coord = nextCoordFrom(this.coord, DIR_VECTOR[this.direction]);
        this.wrapMovement();
    }
}