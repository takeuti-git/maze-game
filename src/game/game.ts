import type { Enemy } from "./entity/index.js";
import { Player, EnemyType1, EnemyType2 } from "./entity/index.js";
import { Map } from "./map.js";
import { Foods } from "./foods.js";
import { Renderer } from "../ui/render.js";

import { isSameCoord } from "./coord.js";
import { sleep } from "../util/sleep.js";
import { getFoodMap, MAP_DATA } from "./mapData.js";
import type { Dir } from "../constants/dir";
import { COLORS } from "../constants/colors.js";

const GAME_TICK = 150;

export class Game {
    private readonly map: Map;
    private readonly player: Player;
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

        const enemy1 = new EnemyType1(this.map);
        const enemy2 = new EnemyType2(this.map);
        this.enemies = [enemy1, enemy2];

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

    private async gameLoop() {
        if (!this.isRunning) return;

        this.tickCount++;
        if (this.tickCount > this.tickUntilChase) {
            this.enemies.forEach(e => e.setTarget(this.player.position, this.player.dir));
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

        this.enemies.forEach((e, i) => {
            const color = i === 0 ? COLORS.ENEMY_1 : i === 1 ? COLORS.ENEMY_2 : "#FFF";
            this.renderer.drawEnemy(e.position, color);
            this.renderer.drawTargetPosition(e.target, color);
        });
    }
}