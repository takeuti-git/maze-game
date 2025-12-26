import type { StaticMap } from "../../staticMap.js";
import type { World } from "../../world.js";
import { Enemy } from "./enemy.js";
import { COLORS } from "../../../constants/colors.js";

export class EnemyType4 extends Enemy {
    protected scatterCoord = { x: 1, y: this.staticMap.height - 1 };
    protected _target = this.scatterCoord;

    constructor(staticMap: StaticMap) {
        const start = { x: 13, y: 11 };
        super(staticMap, start);
    }

    public get color(): string {
        return COLORS.ENEMY_4;
    }

    protected setTargetChase(world: World): void {
        const radius = 8;

        const player = world.player;

        const dx = this.coord.x - player.position.x;
        const dy = this.coord.y - player.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist >= radius) {
            // プレイヤーの一定半径以上にいるとき
            this._target = player.position;
        } else {
            // プレイヤーの一定半径未満にいるとき
            this._target = this.scatterCoord;
        }
    }
}