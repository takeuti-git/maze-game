import type { BehaviorState } from "../constants/enemyState";
import type { TileCoord } from "../types/coordinate";
import type { Enemy, Player } from "./entity/index";

export class World {
    constructor(
        public readonly player: Player,
        public readonly enemies: readonly Enemy[],
        public readonly currentBehaviorState: BehaviorState,
        // public readonly staticMap: StaticMap,
        // public readonly foods: Foods,
    ) { }

    get enemy1Position(): TileCoord {
        if (this.enemies[0]) {
            return this.enemies[0].tilePosition;
        }

        throw new Error("couldn't find enemy Type1");
    }
}
