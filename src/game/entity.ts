import type { Coordinate, Vector } from "../types/coordinate";

import type { Map } from "./map.js";
import { Dir, DIR_VECTOR } from "../constants/dir.js";

export abstract class Entity {
    protected map: Map;
    coord: Coordinate;
    direction: Dir;

    constructor(map: Map) {
        this.map = map;
        this.coord = { x: 0, y: 0 };
        this.direction = Dir.UP; // 初期方向は上
    }

    get directionVector(): Vector {
        return DIR_VECTOR[this.direction];
    }

    willHitWallAt(next: Coordinate): boolean {
        return this.map.isWall(next);
    }

    move(): void { }

    wrapCoord(): void {
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