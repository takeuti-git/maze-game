import type { Coordinate, Vector } from "../types/coordinate";
import type { Foods, Map } from "../types/map";
import { DIR } from "../constants/dir.js";
import { TILE_TYPE } from "../constants/map.js";

export class Player {
    map: Map;
    foods: Foods
    mapWidth: number;
    mapHeight: number;
    coord: Coordinate;
    direction: Vector;
    isMoving: boolean;

    constructor(map: Map, foods: Foods) {
        this.map = map;
        this.foods = foods;

        this.mapWidth = this.map[0]?.length as number;
        this.mapHeight = this.map.length;

        this.coord = { x: this.mapWidth / 2 - 1, y: 23 };
        this.direction = DIR.RIGHT; // 初期は右向きに進む
        this.isMoving = false;
    }

    willHitWall(dir: Vector): boolean {
        const x = this.coord.x + dir.vx;
        const y = this.coord.y + dir.vy;

        return this.map[y]?.[x] === TILE_TYPE.WALL;
    }

    changeDirection(dir: Vector) {
        if (this.willHitWall(dir)) return;
        this.direction = dir;
    }

    turnUp() { this.changeDirection(DIR.UP); }
    turnRight() { this.changeDirection(DIR.RIGHT); }
    turnDown() { this.changeDirection(DIR.DOWN); }
    turnLeft() { this.changeDirection(DIR.LEFT); }

    move() {
        const dir = { vx: this.direction.vx, vy: this.direction.vy };
        this.isMoving = false;
        if (this.willHitWall(dir)) return;
        this.isMoving = true;

        const newX = this.coord.x + dir.vx;
        const newY = this.coord.y + dir.vy;

        // 食べ物判定
        if (this.foods[newY]?.[newX]) {
            this.foods[newY][newX] = false;
            this.eat()
        }

        // マップの端から端までの瞬間移動
        if (newX < 0) {
            this.coord.x = this.mapWidth - 1;
        }
        else if (newX > this.mapWidth - 1) {
            this.coord.x = 0;
        }
        else {
            this.coord.x = newX;
            this.coord.y = newY;
        }

    }

    eat() {
        console.log("eating")
    }

    hasEatenUp(): boolean {
        // 配列中に1つでも食べ物(true)が残っていればfalseを返す
        if (this.foods.some(row => row.some(Boolean))) return false;
        else return true;
    }

    die() {
        
    }
}