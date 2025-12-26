import type { Entity } from "./entity/entity.js";
import type { Enemy } from "./entity/index.js";
import type { Dir } from "../constants/dir";

import { Player, EnemyType1, EnemyType2, EnemyType3, EnemyType4 } from "./entity/index.js";
import { Map } from "./map.js";
import { Foods } from "./foods.js";
import { Renderer } from "../ui/render.js";

import { isSameCoord } from "./coord.js";
import { sleep } from "../util/sleep.js";
import { getFoodMap, STATIC_MAP_DATA } from "./mapData.js";
import { World } from "./world.js";
import { BehaviroState } from "../constants/behaviorState.js";

const GAME_TICK = 160;

let modeIndex = 0;
const secondToTick = (second: number) => second * 1000;
const MODE_RANGE_SECONDS = [7, 20, 7, 20, 5, 20, 5];

export class Game {
    private readonly map: Map;
    private readonly player: Player;
    private readonly enemies: Enemy[];
    private readonly entities: Entity[];
    private readonly foods: Foods;
    private readonly renderer: Renderer;
    private isRunning: boolean;
    private tickCount: number;

    constructor(canvas: HTMLCanvasElement) {
        this.map = new Map(STATIC_MAP_DATA);

        this.foods = new Foods(getFoodMap());

        this.player = new Player({ x: 14, y: 23 }, this.map, this.foods);

        const enemy1 = new EnemyType1(this.map, { x: 13, y: 12 });
        const enemy2 = new EnemyType2(this.map);
        const enemy3 = new EnemyType3(this.map);
        const enemy4 = new EnemyType4(this.map);
        this.enemies = [enemy1, enemy2, enemy3, enemy4];

        this.entities = [this.player, ...this.enemies];

        this.renderer = new Renderer(canvas, this.map);

        this.isRunning = false;

        this.tickCount = 0;
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
        )
    }

    private async gameLoop() {
        if (!this.isRunning) return;
        await sleep(GAME_TICK);

        const world = this.updateWorld();

        this.tickCount += GAME_TICK;
        if (this.tickCount >= secondToTick(MODE_RANGE_SECONDS[modeIndex]!)) {
            this.tickCount = 0;
            modeIndex = (modeIndex + 1) % MODE_RANGE_SECONDS.length;

            if (modeIndex % 2 === 0) {
                this.enemies.forEach(e => e.setState(BehaviroState.SCATTER));
            } else {
                this.enemies.forEach(e => e.setState(BehaviroState.CHASE));
            }
        }

        this.enemies.forEach(e => e.updateTarget(world));

        this.entities.forEach(e => e.savePrevCoord());
        this.entities.forEach(e => e.move());

        this.render();

        if (checkPlayerEnemyCollision(this.player, this.enemies)) {
            this.stop();
            this.player.die();
        }

        if (this.foods.isEmpty()) {
            this.stop();
        }

        requestAnimationFrame(() => this.gameLoop());
    }

    public render() {
        this.renderer.drawWorld(this.map, this.foods);
        this.renderer.drawPlayer(this.player.position, this.player.dir, this.player.isMoving);

        this.enemies.forEach(e => {
            this.renderer.drawEnemy(e.position, e.color);
            this.renderer.drawTargetPosition(e.target, e.color);
        });
    }
}

function isCollided(a: Entity, b: Entity): boolean {
    // 同じマス
    if (isSameCoord(a.position, b.position)) {
        return true;
    }

    // すれ違い
    if (
        a.position.x === b.prevPosition.x &&
        a.position.y === b.prevPosition.y &&
        b.position.x === a.prevPosition.x &&
        b.position.y === a.prevPosition.y 
    ) {
        return true;
    }

    return false;
}

function checkPlayerEnemyCollision(player: Player, enemies: Enemy[]): boolean {
    for (const enemy of enemies) {
        if (isCollided(player, enemy)) {
            return true;
        }
    }
    return false;
}