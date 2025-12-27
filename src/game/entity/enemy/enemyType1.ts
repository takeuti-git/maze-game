import type { StaticMap } from "../../staticMap.js";
import type { World } from "../../world.js";
import { Enemy } from "./enemy.js";
import { COLORS } from "../../../constants/colors.js";
import type { Coordinate } from "../../../types/coordinate.js";

export class EnemyType1 extends Enemy {
    protected scatterCoord = { x: this.staticMap.width - 4, y: -4 }; // 画面右上
    protected _target = this.scatterCoord;

    constructor(staticMap: StaticMap, start: Coordinate) {
        super(staticMap, start);
    }

    public get color(): string {
        return COLORS.ENEMY_1;
    }

    protected setTargetChase(world: World): void {
        this._target = world.player.position;
    }
}