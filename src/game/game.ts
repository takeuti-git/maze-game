import { drawEnemy, drawPlayer, drawStaticObjects, drawTarget, initRenderer } from "../ui/render.js";
import { sleep } from "../util/sleep.js";
import { getFoodMap, MAP_DATA } from "./mapData.js";

import { Enemy } from "./enemy.js";
import { Player } from "./player.js";
import { isSameCoord } from "./coord.js";
import { Map } from "./map.js";
import { Foods } from "./foods.js";

const gameTick = 150;

export class Game {
    map: Map
    player: Player
    enemy: Enemy
    isRunning: boolean
    foods: Foods

    tickCount: number;
    tickInterval: number;
    constructor(canvas: HTMLCanvasElement) {
        this.map = new Map(MAP_DATA);
        this.foods = new Foods(getFoodMap());
        this.player = new Player(this.map, this.foods);
        this.enemy = new Enemy(this.map);

        this.isRunning = false;

        this.tickCount = 0;
        this.tickInterval = 30;

        initRenderer(canvas, this.map);
    }

    start() {
        this.isRunning = true;
        this.gameLoop();
    }

    stop() {
        this.isRunning = false;
        console.log("stopped")
    }

    async gameLoop() {
        if (!this.isRunning) return;

        this.tickCount = (this.tickCount + 1) % this.tickInterval;
        if (this.tickCount === 0) {
            const rng = 1 + Math.floor(Math.random() * 30);
            this.tickInterval = rng;
            this.enemy.newTarget = this.player.coord;
            console.log("target updated")
        }

        // if (isSameCoord(this.enemy.coord, this.enemy.target)) {
        //     this.enemy.newTarget = this.player.coord;
        // }

        this.player.move();
        this.enemy.move();
        this.render();

        drawTarget(this.enemy.target); // debug

        if (isSameCoord(this.player.coord, this.enemy.coord)) {
            this.player.die();
            this.stop();
        }

        if (this.foods.isEmpty()) {
            this.stop();
        }

        await sleep(gameTick);
        requestAnimationFrame(() => this.gameLoop());
    }

    render() {
        drawStaticObjects(this.map, this.foods);

        const player = this.player;
        const enemy = this.enemy;
        drawPlayer(player.coord.x, player.coord.y, player.direction, player.isMoving);
        drawEnemy(enemy.coord.x, enemy.coord.y, enemy.direction);
    }
}