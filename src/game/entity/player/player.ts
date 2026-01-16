import type { Foods } from "../../foods";
import type { StaticMap } from "../../staticMap";
import type { TileCoord } from "../../../types/coordinate";
import { Entity } from "../entity.js";
import { Dir, DIR_VECTOR } from "../../../constants/dir.js";
import { COLORS } from "../../../constants/colors.js";
import { FoodType } from "../../../constants/tile.js";


type PlayerEvent =
    | { type: "PLAYER_POWER_UP" }
    | { type: "PLAYER_POWER_UP_END" }
    | null;

export class Player extends Entity {
    private moving = false;
    private readonly foods: Foods;

    private inputDir: Dir | null = this.dir;

    public isPowerUpActive = false;
    private readonly POWER_UP_TIME = 10;
    private powerUpTimer = 0;

    constructor(startTile: TileCoord, staticMap: StaticMap, foods: Foods) {
        super(staticMap, startTile, Dir.Left);
        this.foods = foods;
    }

    public get isMoving(): boolean {
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
        if (this.isPowerUpActive) this.powerUpTimer -= delta;

        const { tile, center } = this.getCurrentTile();

        if (this.tryChangeDirection(tile)) {
            this.snapToCenter(center.cx, center.cy);
        }

        const onCenter = this.isOnTileCenter();
        if (onCenter && !this.canMoveToDir(tile, this.dir)) {
            return null;
        }

        this.moving = true;
        this.move(delta);

        if (this.isPowerUpActive && this.powerUpTimer <= 0) {
            this.disablePowerUp();
            return { type: "PLAYER_POWER_UP_END" };
        }

        return this.handleFood(this.tilePos);
    }

    private tryChangeDirection(tile: TileCoord): boolean {
        if (this.inputDir === null) return false;

        if (this.canMoveToDir(tile, this.inputDir)) {
            this.direction = this.inputDir;
            return true;
        }

        this.inputDir = null;
        return false;
    }

    private snapToCenter(cx: number, cy: number) {
        const vec = DIR_VECTOR[this.dir];
        if (vec.vx !== 0) this.pixelPos.py = cy;
        if (vec.vy !== 0) this.pixelPos.px = cx;
    }

    private handleFood(tile: TileCoord): PlayerEvent {
        const food = this.foods.eat(tile);

        switch (food) {
            case FoodType.None:
                this.speed = this.defaultSpeed;
                return null;
            case FoodType.Special:
                this.enablePowerUp();
                // fall through
            case FoodType.Normal:
                this.speed = 0; // 食べたフレームだけ停止
                return food === FoodType.Special
                    ? { type: "PLAYER_POWER_UP" }
                    : null;
        }
    }

    private enablePowerUp(): void {
        this.isPowerUpActive = true;
        this.powerUpTimer = this.POWER_UP_TIME;
    }

    private disablePowerUp(): void {
        this.isPowerUpActive = false;
        this.powerUpTimer = 0;
    }
}