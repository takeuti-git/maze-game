import type { Map } from "../../map.js";
import { Enemy } from "./enemy.js";
import { COLORS } from "../../../constants/colors.js";
import type { World } from "../../world.js";

export class EnemyType1 extends Enemy {
    constructor(map: Map) {
        const start = { x: 13, y: 14 };
        super(map, start);
        this._target = { x: map.width - 1, y: -1 };
        this.color = COLORS.ENEMY_1;
    }

    public updateTarget(world: World): void {
        this._target = world.player.position;
    }
}