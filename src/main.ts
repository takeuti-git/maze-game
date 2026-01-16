import { Game } from "./game/game.js";

function main() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    if (!canvas) throw new Error("canvas element not found");

    const game = new Game(canvas);

    game.start();
}

main();
