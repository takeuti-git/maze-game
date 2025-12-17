import type { Game } from "../game/game.js";
import { KEY_TO_DIR } from "../constants/keymap.js";

export class InputHandler {
    game: Game;
    keyStates: Set<string>;
    isRunning: boolean;

    constructor(game: Game) {
        this.game = game;
        this.keyStates = new Set();
        this.isRunning = false;

        this.setupListeners();
    }

    setupListeners() {
        document.addEventListener("keydown", (e) => {
            if (e.repeat) return;
            const key = e.code;

            // リピート防止
            if (this.keyStates.has(key)) return;

            this.keyStates.add(key);
        });

        document.addEventListener("keyup", (e) => {
            const key = e.code;
            this.keyStates.delete(key);
        });
    }

    start() {
        this.isRunning = true;
        this.inputLoop();
    }

    stop() {
        this.isRunning = false;
    }

    inputLoop() {
        if (!this.isRunning) return;
        this.updateGameActions();
        requestAnimationFrame(() => this.inputLoop());
    }

    updateGameActions() {
        for (const key of this.keyStates) {
            const dir = KEY_TO_DIR[key];
            if (dir !== undefined) {
                this.game.requestPlayerTurn(dir);
                break;
            }
        }
    }
}
