import { clearCanvas, displayCLI, drawWalls, drawPlayer } from "../ui/display.js";
import { Player } from "./player.js";
export class Game {
    constructor(map) {
        this.map = map;
        this.player = new Player(map);
        this.tick();
    }
    handleKey(e) {
        const keyCodeMap = {
            ArrowUp: () => this.player.turnUp(),
            ArrowRight: () => this.player.turnRight(),
            ArrowDown: () => this.player.turnDown(),
            ArrowLeft: () => this.player.turnLeft(),
        };
        keyCodeMap[e.code]?.();
    }
    render() {
        // displayCLI(this);
        clearCanvas();
        drawWalls();
        drawPlayer(this.player);
    }
    tick() {
        setInterval(() => {
            this.player.move();
            this.render();
        }, 200);
    }
}
