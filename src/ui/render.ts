import { COLORS } from "../constants/colors.js";
import { Dir } from "../constants/dir.js";
import { TILE_TYPE } from "../constants/tile.js";
import type { Map } from "../game/map.js";
import type { Foods } from "../game/foods.js";
import type { Coordinate } from "../types/coordinate.js";

const side = 21;
const outlineWidth = 1;

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

let playerFrame = 0;
const FRAME_COUNT = 2;

export function initRenderer(targetCanvas: HTMLCanvasElement, map: Map) {
    canvas = targetCanvas;
    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    canvas.width = side * map.width;
    canvas.height = side * map.height;
}

function coordToCenterPixel(coord: number): number {
    return coord * side + Math.floor(side / 2);
}

function drawRect(x: number, y: number, w: number, h: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(cx: number, cy: number, r: number, start: number, end: number) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, end);
    ctx.fill();
    ctx.closePath();
}

function drawWall(coord: Coordinate, map: Map) {
    const tile = map.getTile(coord);
    if (tile !== TILE_TYPE.WALL) return;

    const px = coord.x * side;
    const py = coord.y * side;

    drawRect(px, py, side, side, COLORS.WALL);

    const neighbors = map.getAdjacentTiles(coord);

    if (neighbors[Dir.UP] === TILE_TYPE.FLOOR) {
        drawWallOutline(px, py, side, outlineWidth);
    }
    if (neighbors[Dir.DOWN] === TILE_TYPE.FLOOR) {
        drawWallOutline(px, py + side - outlineWidth, side, outlineWidth);
    }
    if (neighbors[Dir.LEFT] === TILE_TYPE.FLOOR) {
        drawWallOutline(px, py, outlineWidth, side);
    }
    if (neighbors[Dir.RIGHT] === TILE_TYPE.FLOOR) {
        drawWallOutline(px + side - outlineWidth, py, outlineWidth, side);
    }
}

function drawWallOutline(px: number, py: number, w: number, h: number) {
    drawRect(px, py, w, h, COLORS.WALL_OUTLINE);
}

function drawFood(coord: Coordinate, foods: Foods) {
    if (!foods.has(coord)) return;

    ctx.fillStyle = COLORS.FOOD;
    const cx = coordToCenterPixel(coord.x);
    const cy = coordToCenterPixel(coord.y);
    // const r = 3;
    // drawCircle(cx, cy, r, 0, Math.PI * 2);
    const size = 4;
    drawRect(cx - (size / 2), cy - (size / 2), size, size, COLORS.FOOD);
}

export function drawStaticObjects(map: Map, foods: Foods) {
    drawRect(0, 0, canvas.width, canvas.height, COLORS.BACKGROUND);

    for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
            const coord = { x, y };
            drawWall(coord, map);
            drawFood(coord, foods);
        }
    }
}

export function drawPlayer(x: number, y: number, dir: Dir, isMoving: boolean) {
    const cx = coordToCenterPixel(x);
    const cy = coordToCenterPixel(y);

    const DIR_TO_SPRITE_INDEX: Record<Dir, number> = {
        [Dir.UP]: 3,
        [Dir.RIGHT]: 0,
        [Dir.DOWN]: 1,
        [Dir.LEFT]: 2,
    };

    const dirOffset = DIR_TO_SPRITE_INDEX[dir];

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

export function drawEnemy(x: number, y: number, dir: Dir) {
    // ctx.fillStyle = "#F00";
    // const cx = coordToCenterPixel(x);
    // const cy = coordToCenterPixel(y);
    // drawCircle(cx, cy, 10, 0, Math.PI * 2);

    drawRect(x * side, y * side, side, side, "#F00");
}

export function drawTarget(coord: Coordinate) {
    const cx = coordToCenterPixel(coord.x);
    const cy = coordToCenterPixel(coord.y);
    const offset = 10;
    const wh = side - offset;
    drawRect(cx - offset / 2, cy - offset / 2, wh, wh, "#FAA");
}