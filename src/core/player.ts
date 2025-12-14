import type { Coordinate, Vector } from "../types/coordinate";
import type { Map } from "../types/gamemap";
import { DIR } from "../constants/dir.js";
import { TILE_TYPE } from "../constants/gamemap.js";

export class Player {
    map: Map;
    mapWidth: number;
    mapHeight: number;
    coord: Coordinate;
    direction: Vector;

    constructor(map: Map) {
        this.map = map;
        this.mapWidth = this.map[0]?.length as number;
        this.mapHeight = this.map.length;
        // 初期位置はマップの中央
        // const x = Math.floor(width / 2);
        // const y = Math.floor(height / 2);
        this.coord = { x: 1, y: 1 };
        this.direction = DIR.RIGHT;

        console.log()
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
        if (this.willHitWall(dir)) return;

        const newX = this.coord.x + dir.vx;
        const newY = this.coord.y + dir.vy;

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
}