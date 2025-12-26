import type { Coordinate } from "../types/coordinate";
import type { Enemy, Player } from "./entity/index";
import type { Foods } from "./foods";
import type { StaticMap } from "./staticMap";

export class World {
    constructor(
        public readonly player: Player,
        public readonly enemies: readonly Enemy[],
        // public readonly staticMap: StaticMap,
        // public readonly foods: Foods,
    ) { }

    get enemy1Position(): Coordinate {
        if (this.enemies[0]) {
            return this.enemies[0].position;
        }
        return { x: 0, y: 0 };
    }
}
