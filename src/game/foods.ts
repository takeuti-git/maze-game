import type { Coordinate } from "../types/coordinate";

export class Foods {
    private data: boolean[][];
    private count: number;

    constructor(data: boolean[][]) {
        this.data = data;
        this.count = this.data.map(row => row.filter(Boolean)).flat().length;
    }

    has(coord: Coordinate): boolean {
        return !!this.data[coord.y]?.[coord.x];
    }

    eat(coord: Coordinate): boolean {
        if (!this.has(coord)) return false;

        this.data[coord.y]![coord.x] = false;
        this.count--;
        console.log(this.count);
        return true;
    }

    isEmpty(): boolean {
        return this.count <= 0;
    }
}