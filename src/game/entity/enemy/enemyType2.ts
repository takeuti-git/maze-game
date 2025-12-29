import type { Coordinate } from "../../../types/coordinate.js";
import type { StaticMap } from "../../staticMap.js";
import type { World } from "../../world.js";
import { DIR_VECTOR } from "../../../constants/dir.js";
import { calcCoordFromVector } from "../../coord.js";
import { Enemy } from "./enemy.js";
import { COLORS } from "../../../constants/colors.js";

export class EnemyType2 extends Enemy {
    protected scatterCoord = { x: 3, y: -4 }; // 画面左上
    protected _target = this.scatterCoord;

    constructor(staticMap: StaticMap, start: Coordinate) {
        super(staticMap, start, 0);
    }

    public get color(): string {
        return COLORS.ENEMY_2;
    }

    protected calcChaseTarget(world: World): Coordinate {
        const offset = 4;
        const player = world.player;
        const playerVec = DIR_VECTOR[player.dir];

        const targetVec = { vx: playerVec.vx * offset, vy: playerVec.vy * offset };
        
        return calcCoordFromVector(player.position, targetVec);
    }
}