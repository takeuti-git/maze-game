import { clearCanvas, drawWalls, drawPlayer } from "../ui/display.js";
import { Player } from "./player.js";
import { sleep } from "../util/sleep.js";
const gameTick = 150;
export class Game {
    constructor(map) {
        this.map = map;
        this.player = new Player(map);
        this.isRunning = false;
    }
    start() {
        this.isRunning = true;
        this.gameLoop();
    }
    stop() {
        this.isRunning = false;
    }
    async gameLoop() {
        if (!this.isRunning)
            return;
        this.player.move();
        this.render();
        await sleep(gameTick);
        requestAnimationFrame(() => this.gameLoop());
    }
    render() {
        clearCanvas();
        drawWalls();
        drawPlayer(this.player);
    }
}
