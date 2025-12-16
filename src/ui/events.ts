import { Game } from "../core/game.js";

const ALLOWED_KEYS = {
    UP: "ArrowUp",
    DOWN: "ArrowDown",
    RIGHT: "ArrowRight",
    LEFT: "ArrowLeft",
};

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

    // handleKeyDown(key: string) {
    //     switch (key) {
    //         case "ArrowUp":
    //             this.game.executeCommand("TURN_UP");
    //             break;
    //         case "ArrowDown":
    //             this.game.executeCommand("TURN_DOWN");
    //             break;
    //         case "ArrowRight":
    //             this.game.executeCommand("TURN_RIGHT");
    //             break;
    //         case "ArrowLeft":
    //             this.game.executeCommand("TURN_LEFT");
    //             break;
    //     }
    // }

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
        if (this.keyStates.has(ALLOWED_KEYS.UP)) {
            this.game.player.turnUp();
        }
        else if (this.keyStates.has(ALLOWED_KEYS.DOWN)) {
            this.game.player.turnDown();
        }
        else if (this.keyStates.has(ALLOWED_KEYS.RIGHT)) {
            this.game.player.turnRight();
        }
        else if (this.keyStates.has(ALLOWED_KEYS.LEFT)) {
            this.game.player.turnLeft();
        }
    }
}
