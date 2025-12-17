import type { Foods } from "./foods";
import type { Map } from "./map";
import { Entity } from "./entity.js";
import { Dir, DIR_VECTOR } from "../constants/dir.js";
import { nextCoordFrom } from "./coord.js";

export class Player extends Entity {
    foods: Foods
    isMoving: boolean;

    constructor(map: Map, foods: Foods) {
        super(map);
        this.map = map;
        this.foods = foods;

        this.coord = { x: 8, y: 13 };
        this.direction = Dir.RIGHT; // 初期は右向きに進む
        this.isMoving = false;
    }

    tryChangeDirection(dir: Dir) {
        const next = nextCoordFrom(this.coord, DIR_VECTOR[dir]);
        if (this.willHitWallAt(next)) return;
        this.direction = dir;
    }

    turnUp() { this.tryChangeDirection(Dir.UP); }
    turnRight() { this.tryChangeDirection(Dir.RIGHT); }
    turnDown() { this.tryChangeDirection(Dir.DOWN); }
    turnLeft() { this.tryChangeDirection(Dir.LEFT); }

    move() {
        this.isMoving = false;
        const vec = DIR_VECTOR[this.direction];
        const next = nextCoordFrom(this.coord, vec);
        if (this.willHitWallAt(next)) return;
        this.isMoving = true;

        // 食べ物判定
        if (this.foods.eat(next)) {
            this.eat();
        }

        this.coord = next;
        this.wrapCoord();
    }

    eat() {
        console.log("eating");
    }

    die() {

    }
}