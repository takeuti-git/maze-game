import type { Map } from "../../map.js";
import type { World } from "../../world.js";
import { Enemy } from "./enemy.js";
import { COLORS } from "../../../constants/colors.js";
import { DIR_VECTOR } from "../../../constants/dir.js";
import { calcCoordFromVector, calcOppositeCoordinate } from "../../coord.js";

export class EnemyType3 extends Enemy {
    protected scatterCoord = { x: this.map.width - 1, y: this.map.height - 1 };
    protected _target = this.scatterCoord;

    constructor(map: Map) {
        const start = { x: 13, y: 11 };
        super(map, start);
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