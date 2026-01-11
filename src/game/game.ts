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

export class Game {
    private readonly map: StaticMap;
    private readonly input: InputHandler = new InputHandler()
    private readonly player: Player;
    private readonly enemies: Enemy[];
    private readonly foods: Foods;
    private readonly renderer: Renderer;
    private isRunning: boolean = false;

    private readonly deltaTime: number = 1 / 60;

    private stateIndex = 0;
    private tickCount = 0;
    private readonly STATE_RANGE = [7, 20, 7, 20, 5, 20, 5, Infinity];

    private getCurrentState() {
        return this.stateIndex % 2 === 0 ?
            EnemyBehaviorState.Scatter :
            EnemyBehaviorState.Chase;
    }

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
            this.getCurrentState(),
        );
    }

    private tick(delta: number) {
        const world = this.getWorldInstance();

        if (!this.player.isPowerUpActive) {
            this.tickCount += delta;
            if (this.tickCount >= this.STATE_RANGE[this.stateIndex]! * 2.5) {
                this.stateIndex++;
                this.tickCount = 0;

                const mode = this.getCurrentState();
                this.enemies.forEach(e => e.setBehaviorState(mode));
            }
        }

        const inputDir = this.input.getDir();
        if (inputDir !== null) {
            this.player.setDir(inputDir);
        }

        const event = this.player.update(delta);

        switch (event?.type) {
            case "PLAYER_POWER_UP":
                this.enemies.forEach(e => e.setBehaviorState(EnemyBehaviorState.Frightened));
                break;
            
            case "PLAYER_POWER_UP_END":
                const mode = this.getCurrentState();
                this.enemies.forEach(e => {
                    // 帰還状態では状態を上書きしない
                    if (e.behaviorState === EnemyBehaviorState.Eaten) return;
                    e.setBehaviorState(mode);
                });
                break;
        }

        this.enemies.forEach(e => {
            e.update(delta, world);

            if (e.handlePlayerCollision(this.player)) {
                this.stop();
            }
        });

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