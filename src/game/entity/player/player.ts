import type { Foods } from "../../foods";
import type { Map } from "../../map";
import type { Coordinate } from "../../../types/coordinate";
import { Entity } from "../entity.js";
import { Dir, DIR_VECTOR } from "../../../constants/dir.js";
import { nextCoordFrom } from "../../coord.js";

export class Player extends Entity {
    private moving = false;
    private readonly foods: Foods;

    constructor(start: Coordinate, map: Map, foods: Foods) {
        super(map, start, Dir.UP)
        this.foods = foods;
    }

    get isMoving() {
        return this.moving;
    }

    tryChangeDirection(dir: Dir) {
        const next = nextCoordFrom(this.coord, DIR_VECTOR[dir]);
        if (this.willHitWall(this.coord, next)) return;
        this.direction = dir;
    }

    // turnUp() { this.tryChangeDirection(Dir.UP); }
    // turnRight() { this.tryChangeDirection(Dir.RIGHT); }
    // turnDown() { this.tryChangeDirection(Dir.DOWN); }
    // turnLeft() { this.tryChangeDirection(Dir.LEFT); }

    move() {
        const vec = DIR_VECTOR[this.direction];
        const next = nextCoordFrom(this.coord, vec);
        if (this.willHitWall(this.coord, next)) {
            this.moving = false;
            return;
        }

        this.moving = true;
        if (this.foods.eat(next)) {
            this.onEat();
        }

        this.coord = next;
        this.wrapMovement();
    }

    private onEat() {
        // console.log("eating");
    }

    die() {

    }
}