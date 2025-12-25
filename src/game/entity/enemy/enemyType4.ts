import type { Map } from "../../map.js";
import type { World } from "../../world.js";
import { Enemy } from "./enemy.js";
import { COLORS } from "../../../constants/colors.js";

export class EnemyType4 extends Enemy {
    constructor(map: Map) {
        const start = { x: 13, y: 11 };
        super(map, start);
        this._target = { x: 1, y: map.height - 1 };
        this.color = COLORS.ENEMY_4;
    }

    public updateTarget(world: World): void {
        const radius = 8;

        const player = world.player;

        const dx = this.coord.x - player.position.x;
        const dy = this.coord.y - player.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        console.log(dist)

        if (dist > radius) {
            // プレイヤーの半径range外にいるとき
            this._target = player.position;
        } else {
            // プレイヤーの近くにいるとき
            this._target = { x: 1, y: this.map.height - 1 };
        }

    }

}