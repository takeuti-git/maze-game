import type { StaticMap } from "../../staticMap.js";
import type { World } from "../../world.js";
import { DIR_VECTOR } from "../../../constants/dir.js";
import { Enemy } from "./enemy.js";
import { COLORS } from "../../../constants/colors.js";
import type { TileCoord } from "../../../types/coordinate.js";
import { calcTileCoordFromVector } from "../../coord.js";

export class EnemyType2 extends Enemy {
    protected readonly scatterCoord = { tx: 3, ty: -4 }; // 画面左上
    protected _target = this.scatterCoord;
    protected _color: string = COLORS.ENEMY_2; 

    constructor(staticMap: StaticMap, startTile: TileCoord) {
        super(staticMap, startTile, 0);
    }

    protected calcChaseTarget(world: World): TileCoord {
        const offset = 4;
        const player = world.player;
        const playerVec = DIR_VECTOR[player.dir];

        const targetVec = { vx: playerVec.vx * offset, vy: playerVec.vy * offset };
        
        return calcTileCoordFromVector(player.tilePos, targetVec);
    }
}