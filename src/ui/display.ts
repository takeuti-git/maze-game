import { COLORS } from "../constants/colors.js";
import { MAP, TILE_TYPE } from "../constants/gamemap.js";
import { Game } from "../core/game.js";
import type { Player } from "../core/player.js";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const side = 21;
const outlineWidth = 1;

canvas.width = side * (MAP[0] as number[]).length;
canvas.height = side * MAP.length;

function drawRect(x: number, y: number, w: number, h: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}


function drawWallOutline(px: number, py: number, w: number, h: number) {
    drawRect(px, py, w, h, COLORS.WALL_OUTLINE);
}

function drawWall(x: number, y: number) {
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

export function drawPlayer(player: Player) {
    const x = player.coord.x;
    const y = player.coord.y;
    const dir = player.direction;

    const px = x * side;
    const py = y * side;

    const cx = px + Math.floor(side / 2);
    const cy = py + Math.floor(side / 2);

    const facing = dir.vx === 1 ? 0 : dir.vy === 1 ? 1 : dir.vx === -1 ? 2 : dir.vy === -1 ? 3 : 0;

    ctx.fillStyle = COLORS.PLAYER;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const angle = (0.25 + 0.5 * facing) + i * 0.25;
        ctx.arc(cx, cy, 12, Math.PI * angle, Math.PI * (angle + 1));
        ctx.fill();
        ctx.closePath();
    }
}

export function displayCLI(game: Game) {
    let str = "";
    game.map.forEach((row, i) => {
        row.forEach((tile, j) => {
            if (game.player.coord.y === i && game.player.coord.x === j) str += "[]";
            else if (tile === 1) str += "■";
            else if (tile === 0) str += "  ";
            // str += " ";
        });
        str += "\n";
    });
    console.log(str)
}