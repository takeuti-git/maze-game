import type { Coordinate } from "../../types/coordinate";
import type { Map } from "../map.js";
import type { Dir } from "../../constants/dir.js";


export abstract class Entity {
    public abstract get color(): string;

    protected readonly map: Map;
    protected coord: Coordinate;
    protected direction: Dir;

    constructor(map: Map, start: Coordinate, dir: Dir) {
        this.map = map;
        this.coord = map.getTile(start) !== undefined ? start : { x: 1, y: 1 };
        this.direction = dir;
    }

    public get position(): Coordinate {
        return { ...this.coord };
    }

    public get dir(): Dir {
        return this.direction;
    }

    protected willHitWall(current: Coordinate, next: Coordinate): boolean {
        return !this.map.canMove(current, next);
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