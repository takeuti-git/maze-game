import { Dir } from "../constants/dir.js";

const KEY_TO_DIR: Record<string, Dir> = {
    ArrowUp: Dir.Up,
    ArrowRight: Dir.Right,
    ArrowDown: Dir.Down,
    ArrowLeft: Dir.Left,
};


export class InputHandler {
    public currentDir: Dir | null = null;
    public currentKey: string | null = null;

    constructor() {
        this.setupListeners();
    }

    setupListeners() {
        document.addEventListener("keydown", (e) => {
            if (e.repeat) return;

            const key = e.code;
            // if (!(key in KEY_TO_DIR)) return;

            this.currentDir = KEY_TO_DIR[key] ?? null;
            this.currentKey = key;

        });

        document.addEventListener("keyup", (e) => {
            if (e.code === this.currentKey) {
                this.currentKey = null;
                this.currentDir = null;
            }
        });
    }

    getDir(): Dir | null {
        return this.currentDir;
    }
}
