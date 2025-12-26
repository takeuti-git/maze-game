import type { Map } from "../../map.js";
import { Enemy } from "./enemy.js";
import { COLORS } from "../../../constants/colors.js";
import type { World } from "../../world.js";

export class EnemyType1 extends Enemy {
    protected scatterCoord = { x: this.map.width - 1, y: -1 }; // 画面右上
    protected _target = this.scatterCoord;

    constructor(map: Map) {
        const start = { x: 13, y: 14 };
        super(map, start);
        this.color = COLORS.ENEMY_1;
    }

    protected setTargetChase(world: World): void {
        this._target = world.player.position;
    }
}