import type { Coordinate, Vector } from "../types/coordinate";

export function isSameCoord(a: Coordinate, b: Coordinate): boolean {
    return a.x === b.x && a.y === b.y;
}

export function isSameVector(a: Vector, b: Vector): boolean {
    return a.vx === b.vx && a.vy === b.vy;
}

export function calcCoordFromVector(coord: Coordinate, dir: Vector): Coordinate {
    return { x: coord.x + dir.vx, y: coord.y + dir.vy };
}