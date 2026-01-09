import type { StaticMap } from "../../staticMap.js";
import type { World } from "../../world.js";
import { Enemy } from "./enemy.js";
import { COLORS } from "../../../constants/colors.js";
import type { TileCoord } from "../../../types/coordinate.js";

export class EnemyType1 extends Enemy {
    protected scatterCoord = { tx: this.staticMap.width - 4, ty: -4 }; // 画面右上
    protected _target = this.scatterCoord;
    protected _color: string = COLORS.ENEMY_1; 

    constructor(staticMap: StaticMap, startTile: TileCoord) {
        super(staticMap, startTile, 0);
    }

    protected calcChaseTarget(world: World): TileCoord {
        return world.player.tilePosition;
    }
}