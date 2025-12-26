import { Dir } from "../constants/dir.js";
import { TileType } from "../constants/tile.js";
import type { Coordinate } from "../types/coordinate.js";

export class StaticMap {
    public readonly data: TileType[][];
    public readonly width: number;
    public readonly height: number;

    constructor(data: TileType[][]) {
        this.data = data;
        this.width = data[0]?.length ?? 0;
        this.height = data.length;
    }

    getTile(coord: Coordinate): TileType | undefined {
        return this.data[coord.y]?.[coord.x];
    }

    /** 上下左右のタイルを返す */
    getAdjacentTiles(coord: Coordinate): Record<Dir, TileType | undefined> {
        return {
            [Dir.Up]: this.getTile({ x: coord.x, y: coord.y - 1 }),
            [Dir.Down]: this.getTile({ x: coord.x, y: coord.y + 1 }),
            [Dir.Left]: this.getTile({ x: coord.x - 1, y: coord.y }),
            [Dir.Right]: this.getTile({ x: coord.x + 1, y: coord.y }),
        };
    }

    isWall(coord: Coordinate): boolean {
        return this.getTile(coord) === TileType.Wall;
    }

    isOneway(coord: Coordinate): boolean {
        return this.getTile(coord) === TileType.Oneway;
    }

    canMove(from: Coordinate, to: Coordinate): boolean {
        if (this.isWall(to)) return false;

        if (this.getTile(to) === TileType.Floor) return true;

        if (this.getTile(to) === TileType.Oneway) {
            if (from.y < to.y) return false;
            else return true;
        }

        return true; // fallback
    }
}