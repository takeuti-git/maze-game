import { clearCanvas, drawWalls, drawPlayer, drawFoods } from "../ui/display.js";
import { Player } from "./player.js";
import { sleep } from "../util/sleep.js";
import { getFoodMap, MAP } from "../constants/map.js";
const gameTick = 150;
export class Game {
    constructor() {
        this.map = MAP;
        this.foods = getFoodMap();
        this.player = new Player(MAP, this.foods);
        this.isRunning = false;
    }
    start() {
        this.isRunning = true;
        this.gameLoop();
    }
    stop() {
        this.isRunning = false;
        console.log("stopped");
    }
    async gameLoop() {
        if (!this.isRunning)
            return;
        this.player.move();
        this.render();
        if (this.player.hasEatenUp()) {
            this.stop();
        }
        await sleep(gameTick);
        requestAnimationFrame(() => this.gameLoop());
    }
    render() {
        clearCanvas();
        drawWalls();
        const player = this.player;
        drawPlayer(player.coord.x, player.coord.y, player.direction, player.isMoving);
        drawFoods(this.foods);
    }
}
