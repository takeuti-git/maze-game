import type { Coordinate } from "../types/coordinate";

export class Foods {
    private data: boolean[][];

    constructor(data: boolean[][]) {
        this.data = data;
    }

    has(coord: Coordinate): boolean {
        return !!this.data[coord.y]?.[coord.x];
    }

    eat(coord: Coordinate): boolean {
        if (!this.has(coord)) return false;
        this.data[coord.y]![coord.x] = false;
        return true;
    }

    isEmpty(): boolean {
        return !this.data.some(row => row.some(Boolean));
    }
}