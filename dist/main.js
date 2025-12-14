import { Game } from "./core/game.js";
import { MAP } from "./constants/gamemap.js";
import { InputHandler } from "./ui/events.js";
function main() {
    const game = new Game(MAP);
    const inputHandler = new InputHandler(game);
    game.start();
    inputHandler.start();
    game.render();
}
window.addEventListener("DOMContentLoaded", main);
