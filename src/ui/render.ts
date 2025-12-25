import { COLORS } from "../constants/colors.js";
import { Dir } from "../constants/dir.js";
import { TILE_TYPE } from "../constants/tile.js";
import type { Map } from "../game/map.js";
import type { Foods } from "../game/foods.js";
import type { Coordinate } from "../types/coordinate.js";

export class Renderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private tileSize: number;
    private outlineWidth: number;

    private readonly FRAME_COUNT = 2;
    private playerFrame = 0;

    constructor(targetCanvas: HTMLCanvasElement, map: Map) {
        this.canvas = targetCanvas;
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.tileSize = 21;
        this.outlineWidth = 1;
        this.playerFrame = 0;

        this.canvas.width = map.width * this.tileSize;
        this.canvas.height = map.height * this.tileSize;
    }

    private coordToPixel(coord: Coordinate): { x: number, y: number } {
        return {
            x: coord.x * this.tileSize,
            y: coord.y * this.tileSize,
        };
    }

    private coordToCenterPixel(coord: Coordinate): { cx: number, cy: number } {
        const base = this.coordToPixel(coord);
        const half = Math.floor(this.tileSize / 2);
        return {
            cx: base.x + half,
            cy: base.y + half,
        };
    }

    private drawRect(x: number, y: number, w: number, h: number, color: string) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h);
    }

    private drawCircle(cx: number, cy: number, r: number, start: number, end: number, color: string) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, r, start, end);
        this.ctx.fill();
        this.ctx.closePath();
    }

    private drawWall(coord: Coordinate, map: Map) {
        const tile = map.getTile(coord);
        if (tile !== TILE_TYPE.WALL) return;

        const { x, y } = this.coordToPixel(coord);
        this.drawRect(x, y, this.tileSize, this.tileSize, COLORS.WALL);

        const neighbors = map.getAdjacentTiles(coord);

        if (neighbors[Dir.UP] === TILE_TYPE.FLOOR) {
            this.drawWallOutline(x, y, this.tileSize, this.outlineWidth);
        }
        if (neighbors[Dir.DOWN] === TILE_TYPE.FLOOR) {
            this.drawWallOutline(x, y + this.tileSize - this.outlineWidth, this.tileSize, this.outlineWidth);
        }
        if (neighbors[Dir.LEFT] === TILE_TYPE.FLOOR) {
            this.drawWallOutline(x, y, this.outlineWidth, this.tileSize);
        }
        if (neighbors[Dir.RIGHT] === TILE_TYPE.FLOOR) {
            this.drawWallOutline(x + this.tileSize - this.outlineWidth, y, this.outlineWidth, this.tileSize);
        }
    }

    private drawWallOutline(x: number, y: number, w: number, h: number) {
        this.drawRect(x, y, w, h, COLORS.WALL_OUTLINE);
    }


    private drawFood(coord: Coordinate, foods: Foods) {
        if (!foods.has(coord)) return;

        const { cx, cy } = this.coordToCenterPixel(coord);
        const size = 4;
        this.drawRect(cx - (size / 2), cy - (size / 2), size, size, COLORS.FOOD);
    }

    private drawOneWay(coord: Coordinate) {
        const { x, y } = this.coordToPixel(coord);
        this.drawRect(x, y + this.tileSize - this.outlineWidth, this.tileSize, this.outlineWidth, COLORS.ONEWAY);
    }

    public drawWorld(map: Map, foods: Foods) {
        this.drawRect(0, 0, this.canvas.width, this.canvas.height, COLORS.BACKGROUND);

        this.ctx.strokeStyle = "#ccc";
        this.ctx.font = "normal 8px system-ui";
        this.ctx.textAlign = "left";

        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                const coord = { x, y };
                const tileType = map.getTile(coord);
                // this.ctx.strokeText(`${x},${y}`, x * this.tileSize, y * this.tileSize + 10);

                if (map.isWall(coord)) this.drawWall(coord, map);
                else if (foods.has(coord)) this.drawFood(coord, foods);
                else if (tileType === TILE_TYPE.ONEWAY) this.drawOneWay(coord);
            }
        }
    }

    public drawPlayer(coord: Coordinate, dir: Dir, isMoving: boolean) {
        const { cx, cy } = this.coordToCenterPixel(coord);

        const DIR_TO_SPRITE_INDEX: Record<Dir, number> = {
            [Dir.UP]: 3,
            [Dir.RIGHT]: 0,
            [Dir.DOWN]: 1,
            [Dir.LEFT]: 2,
        };
        const dirOffset = DIR_TO_SPRITE_INDEX[dir];

        const r = 12;

        if (isMoving) {
            this.playerFrame = (this.playerFrame + 1) % this.FRAME_COUNT;
        }
        const mouthOffset = (this.playerFrame % 2 === 0) ? -0.2 : 0;
        const baseAngle = 0.5 * dirOffset; // 0.5増えると90度回転

        const a1 = baseAngle + 0.25 + mouthOffset;
        const a2 = baseAngle + 0.75 - mouthOffset;

        this.drawCircle(cx, cy, r, Math.PI * a1, Math.PI * (a1 + 1), COLORS.PLAYER);
        this.drawCircle(cx, cy, r, Math.PI * a2, Math.PI * (a2 + 1), COLORS.PLAYER);

    }

    public drawEnemy(coord: Coordinate, color: string) {
        const { x, y } = this.coordToPixel(coord);
        this.drawRect(x, y, this.tileSize, this.tileSize, color);
    }

    public drawTargetPosition(coord: Coordinate, color: string) {
        const { cx, cy } = this.coordToCenterPixel(coord);
        const offset = 10;
        const wh = this.tileSize - offset;
        this.drawRect(cx - (offset / 2), cy - (offset / 2), wh, wh, color);
    }
}