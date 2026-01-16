import { Dir } from "../constants/dir.js";
import { TileType } from "../constants/tile.js";
import type { TileCoord } from "../types/coordinate.js";

export class StaticMap {
    private readonly data: TileType[][];
    private readonly _width: number;
    private readonly _height: number;

    constructor(data: TileType[][]) {
        this.data = data;
        if (!data[0]) throw new Error("invalid data for static map");

        this._width = data[0]?.length;
        this._height = data.length;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    getTile(tile: TileCoord): TileType | undefined {
        return this.data[tile.ty]?.[tile.tx];
    }

    /** 上下左右のタイルを返す */
    getAdjacentTiles(tile: TileCoord): Record<Dir, TileType | undefined> {
        return {
            [Dir.Up]: this.getTile({ tx: tile.tx, ty: tile.ty - 1 }),
            [Dir.Down]: this.getTile({ tx: tile.tx, ty: tile.ty + 1 }),
            [Dir.Left]: this.getTile({ tx: tile.tx - 1, ty: tile.ty }),
            [Dir.Right]: this.getTile({ tx: tile.tx + 1, ty: tile.ty }),
        };
    }

    isWall(coord: TileCoord): boolean {
        return this.getTile(coord) === TileType.Wall;
    }

    isOneway(coord: TileCoord): boolean {
        return this.getTile(coord) === TileType.Oneway;
    }

    canMove(from: TileCoord, to: TileCoord): boolean {
        if (this.isWall(to)) return false;

        if (this.getTile(to) === TileType.Floor) return true;

        if (this.isOneway(to)) {
            if (from.ty < to.ty) return false;
            else return true;
        }

        return true; // fallback
    }
}