import type { Map } from "../../map.js";
import type { World } from "../../world.js";
import {  DIR_VECTOR } from "../../../constants/dir.js";
import { calcCoordFromVector } from "../../coord.js";
import { Enemy } from "./enemy.js";
import { COLORS } from "../../../constants/colors.js";

export class EnemyType2 extends Enemy {
    constructor(map: Map) {
        const start = { x: 13, y: 15 };
        super(map, start);
        this._target = { x: 1, y: -1 };
        this.color = COLORS.ENEMY_2;
    }

    public updateTarget(world: World): void {
        const offset = 4;
        const player = world.player;
        const playerVec = DIR_VECTOR[player.dir];

        const target = { vx: playerVec.vx * offset, vy: playerVec.vy * offset };
        this._target = calcCoordFromVector(player.position, target);
    }
}