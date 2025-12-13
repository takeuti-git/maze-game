// /src/main.ts

interface Coordinate {
    x: number;
    y: number;
}

interface Vector {
    vx: number;
    vy: number;
}

interface Player {
    walls: Coordinate[];
    coord: Coordinate;
}

const DIR = {
    UP: { vx: 0, vy: -1 },
    DOWN: { vx: 0, vy: 1 },
    RIGHT: { vx: 1, vy: 0 },
    LEFT: { vx: -1, vy: 0 },
} as const;

class Player {
    constructor(width: number, height: number, walls: Coordinate[]) {
        this.walls = walls;
        // 初期位置はマップの中央
        const x = Math.floor(width / 2);
        const y = Math.floor(height / 2);
        this.coord = { x, y };
    }

    move(dir: Vector) {
        const x = this.coord.x + dir.vx;
        const y = this.coord.y + dir.vy;
        const xy = { x, y };

        if (this.walls.some(w => isSameCoord(w, xy))) {
            console.log("wall at ", xy);
        } else {
            this.coord.x = x;
            this.coord.y = y;
        }

    }

    moveRight() { this.move(DIR.RIGHT); }
    moveLeft() { this.move(DIR.LEFT); }
    moveUp() { this.move(DIR.UP); }
    moveDown() { this.move(DIR.DOWN); }
}

const WIDTH = 9;
const HEIGHT = 9;

const walls: Coordinate[] = [
    { x: 3, y: 2 },
    { x: 4, y: 2 },
    { x: 5, y: 2 },

    { x: 2, y: 3 },
    { x: 2, y: 4 },
    { x: 2, y: 5 },

    { x: 6, y: 3 },
    // { x: 6, y: 4 },
    { x: 6, y: 5 },

    { x: 3, y: 6 },
    { x: 4, y: 6 },
    { x: 5, y: 6 },
];

// 外枠の壁を生成
for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
        if (
            x === 0 || x === WIDTH - 1 ||
            y === 0 || y === HEIGHT - 1
        ) {
            walls.push({ x, y });
        }
    }
}

const player = new Player(WIDTH, HEIGHT, walls);

function isSameCoord(a: Coordinate, b: Coordinate): boolean {
    return a.x === b.x && a.y === b.y;
}

function display() {
    console.clear()

    let str = "";
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const xy = { x, y };
            if (isSameCoord(player.coord, xy)) {
                str += "〇";
            }
            else if (walls.some(wall => isSameCoord(wall, xy))) {
                str += "■";
            }
            else {
                str += "  ";
            }
            str += " ";
        }
        str += "\n";
    }
    console.log(str);
    console.log(player.coord)
}
display();


const keyCodeMap: Record<string, Function> = {
    ArrowRight: () => player.moveRight(),
    ArrowLeft: () => player.moveLeft(),
    ArrowUp: () => player.moveUp(),
    ArrowDown: () => player.moveDown(),
};

const allowdKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];

document.addEventListener("keydown", (e) => {
    if (!(allowdKeys.includes(e.code))) return;

    keyCodeMap[e.code]?.();
    display();
    console.log(e.code)
});