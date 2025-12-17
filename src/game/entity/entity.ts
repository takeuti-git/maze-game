import type { Coordinate } from "../../types/coordinate";
import type { Map } from "../map.js";
import { Dir } from "../../constants/dir.js";

export abstract class Entity {
    protected readonly map: Map;
    protected coord: Coordinate;
    protected direction: Dir;

    constructor(map: Map, start: Coordinate, dir: Dir) {
        this.map = map;
        this.coord = start;
        this.direction = dir;
    }

    get position(): Coordinate {
        return { ...this.coord };
    }

    get dir(): Dir {
        return this.direction;
    }

    protected willHitWallAt(next: Coordinate): boolean {
        return this.map.isWall(next);
    }

    protected abstract move(): void;

    protected wrapMovement(): void {
        // マップの端から端までの瞬間移動
        const minXY = 0
        const maxX = this.map.width - 1;
        const maxY = this.map.height - 1;
        if (this.coord.x < minXY) this.coord.x = maxX;
        else if (this.coord.x > maxX) this.coord.x = minXY;
        else if (this.coord.y < minXY) this.coord.y = maxY;
        else if (this.coord.y > maxY) this.coord.y = minXY;
    }
}