import type { Coordinate } from "../../../types/coordinate.js";
import type { StaticMap } from "../../staticMap.js";
import type { World } from "../../world.js";
import { Enemy } from "./enemy.js";
import { COLORS } from "../../../constants/colors.js";

export class EnemyType4 extends Enemy {
    protected scatterCoord = { x: 0, y: this.staticMap.height }; // 画面左下
    protected _target = this.scatterCoord;

    constructor(staticMap: StaticMap, start: Coordinate) {
        super(staticMap, start, 10000);
    }

    public get color(): string {
        return COLORS.ENEMY_4;
    }

    protected calcChaseTarget(world: World): Coordinate {
        const radius = 8;

        const player = world.player;

        const dx = this.coord.x - player.position.x;
        const dy = this.coord.y - player.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist >= radius) {
            // プレイヤーの一定半径以上にいるとき
            return player.position;
        } else {
            // プレイヤーの一定半径未満にいるとき
            return this.scatterCoord;
        }
    }
}