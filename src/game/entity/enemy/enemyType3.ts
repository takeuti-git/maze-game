import type { Map } from "../../map.js";
import type { World } from "../../world.js";
import { Enemy } from "./enemy.js";
import { COLORS } from "../../../constants/colors.js";
import { DIR_VECTOR } from "../../../constants/dir.js";
import { calcCoordFromVector } from "../../coord.js";
import type { Coordinate } from "../../../types/coordinate.js";

export class EnemyType3 extends Enemy {
    constructor(map: Map) {
        const start = { x: 16, y: 12 };
        super(map, start);
        this._target = { x: map.width - 1, y: map.height - 1 };
        this.color = COLORS.ENEMY_3;
    }

    public updateTarget(world: World): void {
        const offset = 2;
        const player = world.player;
        const playerVec = DIR_VECTOR[player.dir];
        const enemy1Position = world.enemy1Position;

        const offsetVec = { vx: playerVec.vx * offset, vy: playerVec.vy * offset };
        const offsetCoord = calcCoordFromVector(player.position, offsetVec);

        this._target = calcOppositeCoordinate(offsetCoord, enemy1Position);
    }

}

function calcOppositeCoordinate(C: Coordinate, P: Coordinate): Coordinate {
    return { x: 2 * C.x - P.x, y: 2 * C.y - P.y };
}