import type { Enemy } from "./entity/index.js";
import { Player, EnemyType1, EnemyType2, EnemyType3 } from "./entity/index.js";
import { Map } from "./map.js";
import { Foods } from "./foods.js";
import { Renderer } from "../ui/render.js";

import { isSameCoord } from "./coord.js";
import { sleep } from "../util/sleep.js";
import { getFoodMap, MAP_DATA } from "./mapData.js";
import type { Dir } from "../constants/dir";
import { World } from "./world.js";

const GAME_TICK = 150;

export class Game {
    private readonly map: Map;
    private readonly player: Player;
    private readonly enemy1: EnemyType1;
    private readonly enemy2: EnemyType2;
    private readonly enemy3: EnemyType3;
    private readonly enemies: Enemy[];
    private readonly foods: Foods;
    private readonly renderer: Renderer;
    private isRunning: boolean;
    private tickCount: number;
    private tickUntilChase: number;

    constructor(canvas: HTMLCanvasElement) {
        this.map = new Map(MAP_DATA);

        this.foods = new Foods(getFoodMap());

        this.player = new Player({ x: 9, y: 16 }, this.map, this.foods);

        this.enemy1 = new EnemyType1(this.map);
        this.enemy2 = new EnemyType2(this.map);
        this.enemy3 = new EnemyType3(this.map);
        this.enemies = [this.enemy1, this.enemy2, this.enemy3];

        this.renderer = new Renderer(canvas, this.map);

        this.isRunning = false;

        this.tickCount = 0;

        this.tickUntilChase = 20;
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

    private updateWorld(): World {
        return new World(
            this.player,
            this.enemies,
            // this.map,
            // this.foods
        )
    }

    private async gameLoop() {
        if (!this.isRunning) return;

        const world = this.updateWorld();

        this.tickCount++;
        if (this.tickCount > this.tickUntilChase) {
            this.enemies.forEach(e => e.updateTarget(world));
        }

        this.player.move();
        this.enemies.forEach(e => e.move());
        this.render();


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

        this.enemies.forEach(e => {
            this.renderer.drawEnemy(e.position, e.color);
            this.renderer.drawTargetPosition(e.target, e.color);
        });

        this.renderer.drawTargetPosition(this.enemy3.position, "#0FF");
    }
}