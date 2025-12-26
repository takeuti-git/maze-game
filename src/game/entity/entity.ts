import type { Coordinate } from "../../types/coordinate";
import type { StaticMap } from "../staticMap.js";
import type { Dir } from "../../constants/dir.js";


export abstract class Entity {
    public abstract get color(): string;

    protected readonly staticMap: StaticMap;
    protected coord: Coordinate;
    protected prevCoord: Coordinate;
    protected direction: Dir;

    constructor(staticMap: StaticMap, start: Coordinate, dir: Dir) {
        this.staticMap = staticMap;
        this.coord = staticMap.getTile(start) !== undefined ? start : { x: 1, y: 1 };
        this.prevCoord = this.coord;
        this.direction = dir;
    }

    public get position(): Coordinate {
        return { ...this.coord };
    }

    public get prevPosition(): Coordinate {
        return { ...this.prevCoord };
    }
    public set prevPosition(coord: Coordinate) {
        this.prevCoord = { ...coord };
    }

    public get dir(): Dir {
        return this.direction;
    }

    protected willHitWall(current: Coordinate, next: Coordinate): boolean {
        return !this.staticMap.canMove(current, next);
    }

    public savePrevCoord(): void {
        this.prevCoord = this.position;
    }

    public abstract move(): void;

    protected wrapMovement(): void {
        // マップの端から端までの瞬間移動
        const minXY = 0
        const maxX = this.staticMap.width - 1;
        const maxY = this.staticMap.height - 1;
        if (this.coord.x < minXY) this.coord.x = maxX;
        else if (this.coord.x > maxX) this.coord.x = minXY;
        else if (this.coord.y < minXY) this.coord.y = maxY;
        else if (this.coord.y > maxY) this.coord.y = minXY;
    }
}