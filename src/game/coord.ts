import type { Coordinate, Vector } from "../types/coordinate";

export function isSameTile(a: Coordinate, b: Coordinate): boolean {
    return a.x === b.x && a.y === b.y;
}

export function isSameVector(a: Vector, b: Vector): boolean {
    return a.vx === b.vx && a.vy === b.vy;
}

export function calcCoordFromVector(coord: Coordinate, dir: Vector): Coordinate {
    return { x: coord.x + dir.vx, y: coord.y + dir.vy };
}

/** 座標Cを中心とした時の座標Pに対するベクトルを180度回転させた座標を返す */
export function calcOppositeCoordinate(C: Coordinate, P: Coordinate): Coordinate {
    return { x: 2 * C.x - P.x, y: 2 * C.y - P.y };
}