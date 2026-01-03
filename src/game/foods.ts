import { FoodType } from "../constants/tile.js";
import type { TileCoord } from "../types/coordinate";

export class Foods {
    private data: FoodType[][];
    private count: number;

    constructor(data: FoodType[][]) {
        this.data = data;
        this.count = this.data.map(row => row.filter(c => c !== FoodType.None)).flat().length;
    }

    has(tile: TileCoord): boolean {
        // @ts-expect-error
        return [FoodType.Normal, FoodType.Special].includes(this.data[tile.ty]?.[tile.tx]);
    }

    dataAt(tile: TileCoord): FoodType {
        // @ts-expect-error
        return this.data[tile.ty][tile.tx];
    }

    eat(tile: TileCoord): FoodType {
        if (!this.has(tile)) return FoodType.None;

        // @ts-expect-error
        const tempFood = this.data[tile.ty][tile.tx] as FoodType;

        // @ts-expect-error
        this.data[tile.ty][tile.tx] = FoodType.None;
        this.count--;

        return tempFood;
    }

    isEmpty(): boolean {
        return this.count <= 0;
    }

    isSpecial(tile: TileCoord): boolean {
        // @ts-expect-error
        return this.data[tile.ty][tile.tx] === FoodType.Special;
    }

    isNone(tile: TileCoord): boolean {
        // @ts-expect-error
        return this.data[tile.ty][tile.tx] === FoodType.None;
    }
}