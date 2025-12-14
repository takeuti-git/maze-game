import { COLORS } from "../constants/colors.js";
import { MAP, TILE_TYPE } from "../constants/gamemap.js";
import { Game } from "../core/game.js";
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const side = 21;
const outlineWidth = 1;
canvas.width = side * MAP[0].length;
canvas.height = side * MAP.length;
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}
function drawWallOutline(px, py, w, h) {
    drawRect(px, py, w, h, COLORS.WALL_OUTLINE);
}
function drawWall(x, y) {
    const px = x * side;
    const py = y * side;
    const w = side;
    const h = side;
    drawRect(px, py, w, h, COLORS.WALL);
    const isTopEmpty = MAP[y - 1]?.[x] !== TILE_TYPE.WALL;
    const isBottomEmpty = MAP[y + 1]?.[x] !== TILE_TYPE.WALL;
    const isRightEmpty = MAP[y]?.[x + 1] !== TILE_TYPE.WALL;
    const isLeftEmpty = MAP[y]?.[x - 1] !== TILE_TYPE.WALL;
    if (isTopEmpty) {
        drawWallOutline(px, py, w, outlineWidth);
    }
    if (isBottomEmpty) {
        drawWallOutline(px, py + side - outlineWidth, w, outlineWidth);
    }
    if (isLeftEmpty) {
        drawWallOutline(px, py, outlineWidth, h);
    }
    if (isRightEmpty) {
        drawWallOutline(px + side - outlineWidth, py, outlineWidth, h);
    }
}
export function clearCanvas() {
    drawRect(0, 0, canvas.width, canvas.height, COLORS.BACKGROUND);
}
export function drawWalls() {
    MAP.forEach((row, i) => {
        row.forEach((_, j) => {
            if (MAP[i]?.[j] === TILE_TYPE.WALL) {
                const x = j;
                const y = i;
                drawWall(x, y);
            }
        });
    });
}
export function drawPlayer(player) {
    const px = player.coord.x * side;
    const py = player.coord.y * side;
    const cx = px + Math.floor(side / 2);
    const cy = py + Math.floor(side / 2);
    const dir = player.direction;
    const dirOffset = dir.vx === 1 ? 0 : dir.vy === 1 ? 1 : dir.vx === -1 ? 2 : dir.vy === -1 ? 3 : 0;
    ctx.fillStyle = COLORS.PLAYER;
    for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        const startAngle = (0.25 + 0.5 * dirOffset) + i * 0.5;
        ctx.arc(cx, cy, 12, Math.PI * startAngle, Math.PI * (startAngle + 1)); // 開始角度から180度進んだ地点が終了角度になる
        ctx.fill();
        ctx.closePath();
    }
}
