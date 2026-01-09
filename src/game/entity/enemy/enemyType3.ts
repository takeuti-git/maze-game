import type { StaticMap } from "../../staticMap.js";
import type { World } from "../../world.js";
import { Enemy } from "./enemy.js";
import { COLORS } from "../../../constants/colors.js";
import { DIR_VECTOR } from "../../../constants/dir.js";
import type { TileCoord } from "../../../types/coordinate.js";
import { calcOppositeTileCoord, calcTileCoordFromVector } from "../../coord.js";

export class EnemyType3 extends Enemy {
    protected readonly scatterCoord = { tx: this.staticMap.width - 1, ty: this.staticMap.height }; // 画面右下
    protected _target = this.scatterCoord;
    protected _color: string = COLORS.ENEMY_3;

    constructor(staticMap: StaticMap, startTile: TileCoord) {
        super(staticMap, startTile, 10);
    }

    protected calcChaseTarget(world: World): TileCoord {
        const offset = 2;
        const player = world.player;
        const playerVec = DIR_VECTOR[player.dir];
        const enemy1Position = world.enemy1Position;

        const offsetVec = { vx: playerVec.vx * offset, vy: playerVec.vy * offset };
        const offsetCoord = calcTileCoordFromVector(player.tilePosition, offsetVec);

        return calcOppositeTileCoord(offsetCoord, enemy1Position);
    }
}