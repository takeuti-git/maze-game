import { Game } from "../core/game.js";

const ALLOWD_KEYS = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];

export function setupKeyEvents(game: Game) {
    document.addEventListener("keydown", (e) => handleKeyDown(e, game));
}

function handleKeyDown(e: KeyboardEvent, game: Game) {
    if (!(ALLOWD_KEYS.includes(e.code))) return;
    game.handleKey(e);
}