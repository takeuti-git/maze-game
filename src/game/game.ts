import { Player } from "./player.js";
import { Enemy } from "./enemy.js";
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
    private readonly enemy: Enemy;
    private readonly foods: Foods;
    private readonly renderer: Renderer;
    private isRunning: boolean;
    private tickCount: number;
    private tickInterval: number;

    constructor(canvas: HTMLCanvasElement) {
        this.map = new Map(MAP_DATA);
        this.foods = new Foods(getFoodMap());
        this.player = new Player(this.map, this.foods);
        this.enemy = new Enemy(this.map);
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
            this.enemy.setTarget(this.player.position);
            console.log("target updated")
        }

        this.player.move();
        this.enemy.move();
        this.render();

        this.renderer.drawTargetPosition(this.enemy.target); // debug

        if (isSameCoord(this.player.position, this.enemy.position)) {
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
        this.renderer.drawEnemy(this.enemy.position);
    }
}