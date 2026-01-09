import type { Foods } from "../../foods";
import type { StaticMap } from "../../staticMap";
import type { TileCoord } from "../../../types/coordinate";
import { Entity } from "../entity.js";
import { Dir, DIR_VECTOR } from "../../../constants/dir.js";
import { COLORS } from "../../../constants/colors.js";
import { FoodType } from "../../../constants/tile.js";

export class Player extends Entity {
    private moving = false;
    private readonly foods: Foods;

    private inputDir: Dir | null = this.dir;

    constructor(startTile: TileCoord, staticMap: StaticMap, foods: Foods) {
        super(staticMap, startTile, Dir.Up)
        this.foods = foods;
    }

    public get isMoving() {
        return this.moving;
    }

    public get color(): string {
        return COLORS.PLAYER;
    }

    public setDir(dir: Dir) {
        this.inputDir = dir;
    }

    public update(delta: number): { type: string } | null {
        this.moving = false;

        const { tile, center } = this.getCurrentTile();

        if (this.tryChangeDirection(tile)) {
            this.snapToCenter(center.cx, center.cy);
        }

        const onCenter = this.isOnTileCenter(center.cx, center.cy);
        if (onCenter && !this.canMoveToDir(tile, this.dir)) {
            return null;
        }

        this.moving = true;
        this.move(delta);

        const food = this.handleFood(this.getCurrentTile().tile);
        if (food === FoodType.Special) {
            return { type: "PLAYER_POWER_UP" };
        }

        return null;
    }

    private tryChangeDirection(tile: TileCoord): boolean {
        if (this.inputDir === null) return false;

        if (this.canMoveToDir(tile, this.inputDir)) {
            this.direction = this.inputDir;
            return true;

        } else {
            this.inputDir = null;
            return false;
        }
    }

    protected snapToCenter(cx: number, cy: number) {
        const v = DIR_VECTOR[this.dir];
        if (v.vx !== 0) this.pos.py = cy;
        if (v.vy !== 0) this.pos.px = cx;
    }

    private handleFood(tile: TileCoord): FoodType {
        const food = this.foods.eat(tile);

        if (food === FoodType.None) {
            this.speed = this.defaultSpeed;
        } else {
            this.speed = 0; // 食べた1フレームだけ動きが止まる(原作要素)
        }

        return food;
    }

}