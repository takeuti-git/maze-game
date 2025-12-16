import { COLORS } from "../constants/colors.js";
import { MAP, TILE_TYPE } from "../constants/map.js";
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const side = 21;
const outlineWidth = 1;
let playerFrame = 0;
const FRAME_COUNT = 2;
canvas.width = side * MAP[0].length;
canvas.height = side * MAP.length;
function getCenterPixelByCoord(n) {
    return n * side + Math.floor(side / 2);
}
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}
function drawCircle(cx, cy, r, start, end) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, end);
    ctx.fill();
    ctx.closePath();
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
function drawWallOutline(px, py, w, h) {
    drawRect(px, py, w, h, COLORS.WALL_OUTLINE);
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
export async function drawPlayer(x, y, dir, isMoving) {
    const cx = (x * side) + Math.floor(side / 2);
    const cy = (y * side) + Math.floor(side / 2);
    const dirOffset = dir.vx === 1 ? 0 :
        dir.vy === 1 ? 1 :
            dir.vx === -1 ? 2 :
                dir.vy === -1 ? 3 : 0;
    const r = 12;
    ctx.fillStyle = COLORS.PLAYER;
    function draw() {
        const mouthOffset = (playerFrame % 2 === 0) ? -0.2 : 0;
        const baseAngle = 0.5 * dirOffset; // 0.5増やす=90度回転する
        const a1 = baseAngle + 0.25 + mouthOffset;
        const a2 = baseAngle + 0.75 - mouthOffset;
        drawCircle(cx, cy, r, Math.PI * a1, Math.PI * (a1 + 1));
        drawCircle(cx, cy, r, Math.PI * a2, Math.PI * (a2 + 1));
    }
    if (isMoving) {
        // 移動中だけフレームを動かし、止まっている間は最後のフレームを維持したまま描写
        playerFrame = (playerFrame + 1) % FRAME_COUNT;
    }
    draw();
}
export function drawFoods(foods) {
    ctx.fillStyle = COLORS.FOOD;
    const height = foods.length;
    const width = foods[0]?.length;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (!foods[y]?.[x])
                continue;
            const cx = getCenterPixelByCoord(x);
            const cy = getCenterPixelByCoord(y);
            const r = 3;
            drawCircle(cx, cy, r, 0, Math.PI * 2);
        }
    }
}
