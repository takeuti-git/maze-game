import { Dir } from "../constants/dir.js";
import { TILE_TYPE } from "../constants/tile.js";
import type { Coordinate } from "../types/coordinate";
import type { StaticMapData } from "./types";

export class Map {
    public readonly data: StaticMapData;
    public readonly width: number;
    public readonly height: number;

    constructor(data: StaticMapData) {
        this.data = data;
        this.width = data[0]?.length ?? 0;
        this.height = data.length;
    }

    getTile(coord: Coordinate): TILE_TYPE | undefined {
        return this.data[coord.y]?.[coord.x];
    }

    /** 上下左右のタイルを返す */
    getAdjacentTiles(coord: Coordinate): Record<Dir, TILE_TYPE | undefined> {
        return {
            [Dir.UP]: this.getTile({ x: coord.x, y: coord.y - 1 }),
            [Dir.DOWN]: this.getTile({ x: coord.x, y: coord.y + 1 }),
            [Dir.LEFT]: this.getTile({ x: coord.x - 1, y: coord.y }),
            [Dir.RIGHT]: this.getTile({ x: coord.x + 1, y: coord.y }),
        };
    }

    isWall(coord: Coordinate): boolean {
        return this.getTile(coord) === TILE_TYPE.WALL;
    }

    canMove(from: Coordinate, to: Coordinate): boolean {
        if (this.isWall(to)) return false;

        if (this.getTile(to) === TILE_TYPE.FLOOR) return true;

        if (this.getTile(to) === TILE_TYPE.ONEWAY) {
            if (from.y < to.y) return false;
            else return true;
        }

        return true; // fallback
    }
}