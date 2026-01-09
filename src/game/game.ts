import type { Enemy } from "./entity/index.js";

import { Player, EnemyType1, EnemyType2, EnemyType3, EnemyType4 } from "./entity/index.js";
import { StaticMap } from "./staticMap.js";
import { Foods } from "./foods.js";
import { Renderer } from "../ui/render.js";
import { World } from "./world.js";
import { EnemyBehaviorState } from "../constants/enemyState.js";

import { tileCoordFrom } from "./coord.js";
import { getFoodMap, staticMapData } from "./mapData.js";
import { InputHandler } from "../ui/events.js";

let modeIndex = 0;
let tickCount = 0;
const MODE_RANGE_SECONDS = [7, 20, 7, 20, 5, 20, 5, Infinity];

const getCurrentMode = () => {
    return modeIndex % 2 === 0 ? EnemyBehaviorState.Scatter : EnemyBehaviorState.Chase;
};

export class Game {
    private readonly map: StaticMap;
    private readonly input: InputHandler = new InputHandler()
    private readonly player: Player;
    private readonly enemies: Enemy[];
    private readonly foods: Foods;
    private readonly renderer: Renderer;
    private isRunning: boolean = false;

    private readonly deltaTime: number = 1 / 60;

    private powerUpTimer = 0;
    private isPowerUpActive = false;

    constructor(canvas: HTMLCanvasElement) {
        this.map = new StaticMap(staticMapData);

        this.foods = new Foods(getFoodMap());

        this.player = new Player(tileCoordFrom(14, 23), this.map, this.foods);

        const enemy1 = new EnemyType1(this.map, tileCoordFrom(13, 11));
        const enemy2 = new EnemyType2(this.map, tileCoordFrom(13, 14));
        const enemy3 = new EnemyType3(this.map, tileCoordFrom(12, 14));
        const enemy4 = new EnemyType4(this.map, tileCoordFrom(15, 14));
        this.enemies = [enemy1, enemy2, enemy3, enemy4];


        this.renderer = new Renderer(canvas, this.map);
    }

    public start() {
        this.isRunning = true;
        this.gameLoop();
    }

    public stop() {
        this.isRunning = false;
        console.log("stopped")
    }

    private gameLoop() {
        if (!this.isRunning) return;

        this.tick(this.deltaTime);
        this.render();

        requestAnimationFrame(() => this.gameLoop());
    }

    private getWorldInstance(): World {
        return new World(
            this.player,
            this.enemies,
        );
    }

    private tick(delta: number) {
        const world = this.getWorldInstance();

        if (this.isPowerUpActive) {
            this.powerUpTimer -= delta;

            if (this.powerUpTimer <= 0) {
                // 通常に復帰
                this.isPowerUpActive = false;
                this.powerUpTimer = 0;

                const mode = getCurrentMode();
                this.enemies.forEach(e => e.exitFrightened(mode));
            }
        }

        if (!this.isPowerUpActive) {
            tickCount += delta;
            if (tickCount >= MODE_RANGE_SECONDS[modeIndex]! * 2.5) {
                modeIndex++;
                tickCount = 0;

                const mode = getCurrentMode();
                this.enemies.forEach(e => e.setBehaviorState(mode));
            }
        }

        this.enemies.forEach(e => {
            e.checkReturningComplete(getCurrentMode());
        });

        const inputDir = this.input.getDir();
        if (inputDir !== null) {
            this.player.setDir(inputDir);
        }

        this.enemies.forEach(e => e.updateTarget(world));

        const event = this.player.update(delta);

        if (event?.type === "PLAYER_POWER_UP") {
            this.isPowerUpActive = true;
            this.powerUpTimer = 14.0;

            this.enemies.forEach(e => e.enterFrightened());
        }

        this.enemies.forEach(e => e.update(delta));

        if (this.enemies.some(e => e.handlePlayerCollision(this.player.pixelPosition))) {
            this.stop();
        }

        if (this.foods.isEmpty()) {
            this.stop();
        }
    }

    public render() {
        this.renderer.drawWorld(this.map, this.foods);
        this.renderer.drawPlayer(this.player.pixelPosition, this.player.dir, this.player.isMoving, this.deltaTime);

        this.enemies.forEach(e => {
            this.renderer.drawEnemy(e.pixelPosition, e.color);
            this.renderer.drawTargetPosition(e.target, e.color);
        });
    }
}