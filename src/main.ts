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
    direction: Vector;
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
        this.direction = DIR.RIGHT;
    }

    changeDirection(dir: Vector) {
        const x = this.coord.x + dir.vx;
        const y = this.coord.y + dir.vy;
        const xy = { x, y };

        if (this.walls.some(w => isSameCoord(w, xy))) {
            return;
        }
        this.direction = dir;
    }

    turnUp() { this.changeDirection(DIR.UP); }
    turnRight() { this.changeDirection(DIR.RIGHT); }
    turnDown() { this.changeDirection(DIR.DOWN); }
    turnLeft() { this.changeDirection(DIR.LEFT); }

    move() {
        const x = this.coord.x + this.direction.vx;
        const y = this.coord.y + this.direction.vy;
        const xy = { x, y };

        if (this.walls.some(w => isSameCoord(w, xy))) {
            console.log("wall at ", xy);
        } else {
            this.coord.x = x;
            this.coord.y = y;
        }
    }
}

const WIDTH = 28;
const HEIGHT = 31;

const walls: Coordinate[] = [
    {x: 2, y: 2}
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
    let str = "";
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const xy = { x, y };
            if (isSameCoord(player.coord, xy)) {
                str += "[]";
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
    // console.clear()
    console.log(str);
    console.log(player.coord)
}
display();


const keyCodeMap: Record<string, Function> = {
    ArrowUp: () => player.turnUp(),
    ArrowRight: () => player.turnRight(),
    ArrowDown: () => player.turnDown(),
    ArrowLeft: () => player.turnLeft(),
};

const allowdKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "KeyW", "KeyA", "KeyS", "KeyD"];

document.addEventListener("keydown", (e) => {
    // if (e.repeat) return;
    if (!(allowdKeys.includes(e.code))) return;

    keyCodeMap[e.code]?.();
    display();
    console.log(e.code);
});

setInterval(() => {
    player.move();
    display();
}, 100);