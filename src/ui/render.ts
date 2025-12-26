import { COLORS } from "../constants/colors.js";
import { Dir } from "../constants/dir.js";
import { TileType } from "../constants/tile.js";
import type { StaticMap } from "../game/staticMap.js";
import type { Foods } from "../game/foods.js";
import type { Coordinate } from "../types/coordinate.js";

export class Renderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private tileSize: number;
    private outlineWidth: number;

    private readonly FRAME_COUNT = 2;
    private playerFrame = 0;

    constructor(targetCanvas: HTMLCanvasElement, staticMap: StaticMap) {
        this.canvas = targetCanvas;
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.tileSize = 21;
        this.outlineWidth = 1;
        this.playerFrame = 0;

        this.canvas.width = staticMap.width * this.tileSize;
        this.canvas.height = staticMap.height * this.tileSize;
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

    /** Wallに対して、上下左右の壁を描く */
    private drawWall(coord: Coordinate, staticMap: StaticMap) {
        if (staticMap.getTile(coord) !== TileType.Wall) return;

        const { x, y } = this.coordToPixel(coord);
        // this.drawRect(x, y, this.tileSize, this.tileSize, COLORS.WALL);

        const neighbors = staticMap.getAdjacentTiles(coord);

        const coordOffset = 7;
        const lengthOffset = coordOffset * 2;

        if (neighbors[Dir.Up] === TileType.Floor) {
            const px = x + coordOffset;
            const py = y + coordOffset;
            const w = this.tileSize;
            const h = this.outlineWidth;

            if (neighbors[Dir.Left] === TileType.Wall) {
                this.drawWallOutline(px - lengthOffset - 1, py, w, h);
            }
            if (neighbors[Dir.Right] === TileType.Wall) {
                this.drawWallOutline(px, py, w + 1, h);
            }
        }
        if (neighbors[Dir.Down] === TileType.Floor) {
            const px = x + coordOffset;
            const py = y + this.tileSize - this.outlineWidth - coordOffset;
            const w = this.tileSize;
            const h = this.outlineWidth;

            if (neighbors[Dir.Left] === TileType.Wall) {
                this.drawWallOutline(px - lengthOffset - 1, py, w, h);
            }
            if (neighbors[Dir.Right] === TileType.Wall) {
                this.drawWallOutline(px, py, w + 1, h);
            }
        }
        if (neighbors[Dir.Left] === TileType.Floor) {
            const px = x + coordOffset;
            const py = y + coordOffset;
            const w = this.outlineWidth;
            const h = this.tileSize;

            if (neighbors[Dir.Up] === TileType.Wall) {
                this.drawWallOutline(px, py - lengthOffset, w, h);
            }
            if (neighbors[Dir.Down] === TileType.Wall) {
                this.drawWallOutline(px, py, w, h);
            }
        }
        if (neighbors[Dir.Right] === TileType.Floor) {
            const px = x + this.tileSize - this.outlineWidth - coordOffset;
            const py = y + coordOffset;
            const w = this.outlineWidth;
            const h = this.tileSize;

            if (neighbors[Dir.Up] === TileType.Wall) {
                this.drawWallOutline(px, py - lengthOffset, w, h);
            }
            if (neighbors[Dir.Down] === TileType.Wall) {
                this.drawWallOutline(px, py, w, h);
            }
        }
    }

    private drawWallOutline(x: number, y: number, w: number, h: number) {
        this.drawRect(x, y, w, h, COLORS.WALL_OUTLINE);
    }

    private drawFood(coord: Coordinate, foods: Foods) {
        if (!foods.has(coord)) return;

        const { cx, cy } = this.coordToCenterPixel(coord);
        const foodSize = 4; // 偶数なら中央揃えで表示される
        this.drawRect(cx - (foodSize / 2), cy - (foodSize / 2), foodSize, foodSize, COLORS.FOOD);
    }

    private drawOneWay(coord: Coordinate) {
        const { x, y } = this.coordToPixel(coord);
        this.drawRect(x - 8, y + 8, this.tileSize + 15, this.tileSize - 16, COLORS.ONEWAY);
    }

    public drawWorld(staticMap: StaticMap, foods: Foods) {
        this.drawRect(0, 0, this.canvas.width, this.canvas.height, COLORS.BACKGROUND);

        for (let y = 0; y < staticMap.height; y++) {
            for (let x = 0; x < staticMap.width; x++) {
                const coord = { x, y };
                const tileType = staticMap.getTile(coord);
                if (DEBUG) {
                    // this.ctx.strokeText(`${x},${y}`, x * this.tileSize, y * this.tileSize + 10);
                    this.drawRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize, (x + y) % 2 === 0 ? "#333" : "#555");
                }


                if (staticMap.isWall(coord)) this.drawWall(coord, staticMap);
                else if (foods.has(coord)) this.drawFood(coord, foods);
                else if (tileType === TileType.Oneway) this.drawOneWay(coord);
            }
        }
    }

    public drawPlayer(coord: Coordinate, dir: Dir, isMoving: boolean) {
        const { cx, cy } = this.coordToCenterPixel(coord);

        const DIR_TO_SPRITE_INDEX: Record<Dir, number> = {
            [Dir.Up]: 3,
            [Dir.Right]: 0,
            [Dir.Down]: 1,
            [Dir.Left]: 2,
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
        const boxSize = 10;
        const wh = this.tileSize - boxSize;
        this.drawRect(cx - (boxSize / 2) - 1, cy - (boxSize / 2) - 1, wh + 2, wh + 2, "#FFF");
        this.drawRect(cx - (boxSize / 2), cy - (boxSize / 2), wh, wh, color);
    }
}