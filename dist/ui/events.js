import { Game } from "../core/game.js";
const ALLOWD_KEYS = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];
export function setupKeyEvents(game) {
    document.addEventListener("keydown", (e) => handleKeyDown(e, game));
}
function handleKeyDown(e, game) {
    if (!(ALLOWD_KEYS.includes(e.code)))
        return;
    game.handleKey(e);
}
