import type { StaticMap } from "../../staticMap.js";
import type { World } from "../../world.js";
import { Enemy } from "./enemy.js";
import { COLORS } from "../../../constants/colors.js";
import type { TileCoord } from "../../../types/coordinate.js";

export class EnemyType4 extends Enemy {
    protected scatterCoord = { tx: 0, ty: this.staticMap.height }; // 画面左下
    protected _target = this.scatterCoord;
    protected _color: string = COLORS.ENEMY_4;

    constructor(staticMap: StaticMap, startTile: TileCoord) {
        super(staticMap, startTile, 30);
    }

    protected calcChaseTarget(world: World): TileCoord {
        const radius = 8;

        const player = world.player;

        const dx = this.tilePos.tx - player.tilePos.tx;
        const dy = this.tilePos.ty - player.tilePos.ty;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist >= radius) {
            // プレイヤーの一定半径以上にいるとき
            return player.tilePos;
        } else {
            // プレイヤーの一定半径未満にいるとき
            return this.scatterCoord;
        }
    }
}