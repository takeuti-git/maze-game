import { Game } from "./core/game.js";
import { MAP } from "./constants/gamemap.js";
import { setupKeyEvents } from "./ui/events.js";

function main() {
    const game = new Game(MAP);
    setupKeyEvents(game);

    game.render();
}

window.addEventListener("DOMContentLoaded", main);


// function isSameCoord(a: Coordinate, b: Coordinate): boolean {
//     return a.x === b.x && a.y === b.y;
// }
