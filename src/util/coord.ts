import type { Coordinate } from "../types/coordinate";

export function isSameCoord(a: Coordinate, b: Coordinate): boolean {
    return a.x === b.x && a.y === b.y;
}
