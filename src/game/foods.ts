import { FoodType } from "../constants/tile.js";
import type { TileCoord } from "../types/coordinate";

export class Foods {
    private data: FoodType[][];
    private remaining: number;

    constructor(data: FoodType[][]) {
        this.data = data;

        // Noneではない配列要素数を計算
        this.remaining = this.data.map(row => row.filter(c => c !== FoodType.None)).flat().length;
    }

    private get(tile: TileCoord): FoodType {
        return this.data[tile.ty]?.[tile.tx] ?? FoodType.None;
    }

    public has(tile: TileCoord): boolean {
        const food = this.get(tile);
        return food === FoodType.Normal || food === FoodType.Special;
    }

    public isEmpty(): boolean {
        return this.remaining === 0;
    }

    public isSpecial(tile: TileCoord): boolean {
        return this.get(tile) === FoodType.Special;
    }

    public isNone(tile: TileCoord): boolean {
        return this.get(tile) === FoodType.None;
    }

    public eat(tile: TileCoord): FoodType {
        const food = this.get(tile);
        if (food === FoodType.None) return FoodType.None;

        this.data[tile.ty]![tile.tx] = FoodType.None;
        this.remaining--;

        return food;
    }
}