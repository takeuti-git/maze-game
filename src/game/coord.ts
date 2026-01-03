import type { PixelCoord, TileCoord, Vector } from "../types/coordinate";
import { Dir, DIR_VECTOR } from "../constants/dir.js";
import { TILE_SIZE } from "../constants/tilesize.js";


export function tileCoordFrom(tx: number, ty: number): TileCoord {
    return { tx, ty };
}

export function isSameTile(a: TileCoord, b: TileCoord): boolean {
    return a.tx === b.tx && a.ty === b.ty;
}

// export function isSameVector(a: Vector, b: Vector): boolean {
//     return a.vx === b.vx && a.vy === b.vy;
// }

export function calcTileCoordFromVector(tile: TileCoord, vec: Vector): TileCoord {
    return { tx: tile.tx + vec.vx, ty: tile.ty + vec.vy };
}

/** 座標Cを中心とした時の座標Pに対するベクトルを180度回転させた座標を返す */
export function calcOppositeTileCoord(C: TileCoord, P: TileCoord): TileCoord {
    return { tx: 2 * C.tx - P.tx, ty: 2 * C.ty - P.ty };
}

export function pixelCoordToTileCoord(pixelCoord: PixelCoord): TileCoord {
    return {
        tx: Math.floor(pixelCoord.px / TILE_SIZE),
        ty: Math.floor(pixelCoord.py / TILE_SIZE),
    }
}

export function tileCoordToPixelCoord(tile: TileCoord): PixelCoord {
    return {
        px: tile.tx * TILE_SIZE,
        py: tile.ty * TILE_SIZE,
    };
}

export function tileCoordToCenterPixelCoord(tileCoord: TileCoord): PixelCoord {
    const { px, py } = tileCoordToPixelCoord(tileCoord);
    return {
        px: px + TILE_SIZE / 2,
        py: py + TILE_SIZE / 2,
    };
}

export function calcTileCoordFromDir(tile: TileCoord, dir: Dir): TileCoord {
    const vec = DIR_VECTOR[dir];
    const tx = tile.tx + vec.vx;
    const ty = tile.ty + vec.vy;

    return { tx, ty };
}
