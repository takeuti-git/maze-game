import { Game } from "./core/game.js";
import { InputHandler } from "./ui/events.js";
function main() {
    const game = new Game();
    const inputHandler = new InputHandler(game);
    game.start();
    inputHandler.start();
    game.render();
}
window.addEventListener("DOMContentLoaded", main);
