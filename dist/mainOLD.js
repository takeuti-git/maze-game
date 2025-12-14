// /src/main.ts
const DIR = {
    UP: { vx: 0, vy: -1 },
    DOWN: { vx: 0, vy: 1 },
    RIGHT: { vx: 1, vy: 0 },
    LEFT: { vx: -1, vy: 0 },
};
class Player {
    constructor(width, height, walls) {
        this.walls = walls;
        // 初期位置はマップの中央
        const x = Math.floor(width / 2);
        const y = Math.floor(height / 2);
        this.coord = { x, y };
        this.direction = DIR.RIGHT;
    }
    willHitWall(dir) {
        const x = this.coord.x + dir.vx;
        const y = this.coord.y + dir.vy;
        const xy = { x, y };
        return this.walls.some(w => isSameCoord(w, xy));
    }
    changeDirection(dir) {
        if (this.willHitWall(dir))
            return;
        this.direction = dir;
    }
    turnUp() { this.changeDirection(DIR.UP); }
    turnRight() { this.changeDirection(DIR.RIGHT); }
    turnDown() { this.changeDirection(DIR.DOWN); }
    turnLeft() { this.changeDirection(DIR.LEFT); }
    move() {
        const dir = { vx: this.direction.vx, vy: this.direction.vy };
        if (this.willHitWall(dir))
            return;
        this.coord.x = this.coord.x + dir.vx;
        this.coord.y = this.coord.y + dir.vy;
    }
}
const WIDTH = 28;
const HEIGHT = 31;
const walls = [
    { x: 13, y: 1 },
    { x: 14, y: 1 },
    { x: 2, y: 2 },
    { x: 3, y: 2 },
    { x: 4, y: 2 },
    { x: 5, y: 2 },
    { x: 7, y: 2 },
    { x: 8, y: 2 },
    { x: 9, y: 2 },
    { x: 10, y: 2 },
    { x: 11, y: 2 },
    { x: 13, y: 2 },
    { x: 14, y: 2 },
    { x: 16, y: 2 },
    { x: 17, y: 2 },
    { x: 18, y: 2 },
    { x: 19, y: 2 },
    { x: 20, y: 2 },
    { x: 22, y: 2 },
    { x: 23, y: 2 },
    { x: 24, y: 2 },
    { x: 25, y: 2 },
    { x: 2, y: 3 },
    { x: 3, y: 3 },
    { x: 4, y: 3 },
    { x: 5, y: 3 },
    { x: 7, y: 3 },
    { x: 8, y: 3 },
    { x: 9, y: 3 },
    { x: 10, y: 3 },
    { x: 11, y: 3 },
    { x: 13, y: 3 },
    { x: 14, y: 3 },
    { x: 16, y: 3 },
    { x: 17, y: 3 },
    { x: 18, y: 3 },
    { x: 19, y: 3 },
    { x: 20, y: 3 },
    { x: 22, y: 3 },
    { x: 23, y: 3 },
    { x: 24, y: 3 },
    { x: 25, y: 3 },
];
// 外枠の壁を生成
for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
        if (x === 0 || x === WIDTH - 1 ||
            y === 0 || y === HEIGHT - 1) {
            walls.push({ x, y });
        }
    }
}
const player = new Player(WIDTH, HEIGHT, walls);
function isSameCoord(a, b) {
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
    console.log(player.coord);
}
display();
const keyCodeMap = {
    ArrowUp: () => player.turnUp(),
    ArrowRight: () => player.turnRight(),
    ArrowDown: () => player.turnDown(),
    ArrowLeft: () => player.turnLeft(),
};
const allowdKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "KeyW", "KeyA", "KeyS", "KeyD"];
document.addEventListener("keydown", (e) => {
    // if (e.repeat) return;
    if (!(allowdKeys.includes(e.code)))
        return;
    keyCodeMap[e.code]?.();
});
setInterval(() => {
    player.move();
    display();
}, 100);
export {};
