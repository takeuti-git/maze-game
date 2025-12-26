import type { Map } from "../../map.js";
import type { World } from "../../world.js";
import { DIR_VECTOR } from "../../../constants/dir.js";
import { calcCoordFromVector } from "../../coord.js";
import { Enemy } from "./enemy.js";
import { COLORS } from "../../../constants/colors.js";

export class EnemyType2 extends Enemy {
    protected scatterCoord = { x: 1, y: -1 };
    protected _target = this.scatterCoord;

    constructor(map: Map) {
        const start = { x: 13, y: 15 };
        super(map, start);
    }

    public get color(): string {
        return COLORS.ENEMY_2;
    }

    protected setTargetChase(world: World): void {
        const offset = 4;
        const player = world.player;
        const playerVec = DIR_VECTOR[player.dir];

        const targetVec = { vx: playerVec.vx * offset, vy: playerVec.vy * offset };
        this._target = calcCoordFromVector(player.position, targetVec);
    }
}