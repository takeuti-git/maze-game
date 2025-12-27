import type { Coordinate } from "../../../types/coordinate.js";
import type { StaticMap } from "../../staticMap.js";
import type { World } from "../../world.js";
import { Enemy } from "./enemy.js";
import { COLORS } from "../../../constants/colors.js";
import { DIR_VECTOR } from "../../../constants/dir.js";
import { calcCoordFromVector, calcOppositeCoordinate } from "../../coord.js";

export class EnemyType3 extends Enemy {
    protected scatterCoord = { x: this.staticMap.width - 1, y: this.staticMap.height }; // 画面右下
    protected _target = this.scatterCoord;

    constructor(staticMap: StaticMap, start: Coordinate) {
        super(staticMap, start);
    }

    public get color(): string {
        return COLORS.ENEMY_3;
    }

    protected setTargetChase(world: World) {
        const offset = 2;
        const player = world.player;
        const playerVec = DIR_VECTOR[player.dir];
        const enemy1Position = world.enemy1Position;

        const offsetVec = { vx: playerVec.vx * offset, vy: playerVec.vy * offset };
        const offsetCoord = calcCoordFromVector(player.position, offsetVec);

        this._target = calcOppositeCoordinate(offsetCoord, enemy1Position);
    }
}