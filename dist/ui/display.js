import { COLORS } from "../constants/colors.js";
import { MAP, TILE_TYPE } from "../constants/gamemap.js";
import { Game } from "../core/game.js";
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const side = 20;
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
    drawRect(0, 0, canvas.width, canvas.height, "#111");
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
    const x = player.coord.x;
    const y = player.coord.y;
    const dir = player.direction;
    const px = x * side;
    const py = y * side;
    drawRect(px, py, side, side, "#FF0");
}
export function displayCLI(game) {
    let str = "";
    game.map.forEach((row, i) => {
        row.forEach((tile, j) => {
            if (game.player.coord.y === i && game.player.coord.x === j)
                str += "[]";
            else if (tile === 1)
                str += "■";
            else if (tile === 0)
                str += "  ";
            // str += " ";
        });
        str += "\n";
    });
    console.log(str);
}
