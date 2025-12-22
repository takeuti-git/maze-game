import { Player, Enemy, EnemyType1 } from "./entity/index.js";
import { Map } from "./map.js";
import { Foods } from "./foods.js";
import { Renderer } from "../ui/render.js";

import { isSameCoord } from "./coord.js";
import { sleep } from "../util/sleep.js";
import { getFoodMap, MAP_DATA } from "./mapData.js";
import type { Dir } from "../constants/dir";

const GAME_TICK = 150;

export class Game {
    private readonly map: Map;
    private readonly player: Player;
    private readonly enemies: Enemy[];
    private readonly foods: Foods;
    private readonly renderer: Renderer;
    private isRunning: boolean;
    private tickCount: number;
    private tickInterval: number;

    constructor(canvas: HTMLCanvasElement) {
        this.map = new Map(MAP_DATA);
        this.foods = new Foods(getFoodMap());
        this.player = new Player({ x: 10, y: 11 }, this.map, this.foods);
        const enemy1 = new EnemyType1({x: 20, y: 1}, this.map);
        const enemy2 = new EnemyType1({x: 1, y: 30}, this.map);
        this.enemies = [enemy1, enemy2];
        this.renderer = new Renderer(canvas, this.map);

        this.isRunning = false;

        this.tickCount = 0;
        this.tickInterval = 30;
    }

    public start() {
        this.isRunning = true;
        this.gameLoop();
    }

    public stop() {
        this.isRunning = false;
        console.log("stopped")
    }

    public requestPlayerTurn(dir: Dir) {
        this.player.tryChangeDirection(dir);
    }

    private async gameLoop() {
        if (!this.isRunning) return;

        this.tickCount = (this.tickCount + 1) % this.tickInterval;
        if (this.tickCount === 0) {
            const rng = 1 + Math.floor(Math.random() * 30);
            this.tickInterval = rng;
            this.enemies.forEach(e => e.setTarget(this.player.position));
            console.log("target updated")
        }

        this.player.move();
        this.enemies.forEach(e => e.move());
        this.render();

        if (this.enemies[0]) { // debug
            this.renderer.drawTargetPosition(this.enemies[0].target)
        }

        if (this.enemies.some(e => isSameCoord(this.player.position, e.position))) {
            this.player.die();
            this.stop();
        }

        if (this.foods.isEmpty()) {
            this.stop();
        }

        await sleep(GAME_TICK);
        requestAnimationFrame(() => this.gameLoop());
    }

    public render() {
        this.renderer.drawWorld(this.map, this.foods);
        this.renderer.drawPlayer(this.player.position, this.player.dir, this.player.isMoving);
        // this.renderer.drawEnemy(this.enemy.position);
        this.enemies.forEach(e => this.renderer.drawEnemy(e.position));
    }
}