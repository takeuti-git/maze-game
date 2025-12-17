import { Game } from "./game/game.js";
import { InputHandler } from "./ui/events.js";

function main() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    if (!canvas) {
        console.error("canvas element not found");
        return;
    }
    const game = new Game(canvas);
    const inputHandler = new InputHandler(game);

    game.start();
    inputHandler.start();

    game.render();
}

window.addEventListener("DOMContentLoaded", main);
