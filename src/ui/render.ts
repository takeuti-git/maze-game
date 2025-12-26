import type { StaticMap } from "../game/staticMap.js";
import type { Foods } from "../game/foods.js";
import type { Coordinate } from "../types/coordinate.js";
import { COLORS } from "../constants/colors.js";
import { Dir } from "../constants/dir.js";
import { TileType } from "../constants/tile.js";

const CONFIGS = {
    TILE_SIZE: 21,
    OUTLINE_WIDTH: 1,

    FOOD_SIZE: 4,

    PLAYER_RADIUS: 12,
    PLAYER_ANIMATION_FRAME: 2,

    WALL_COORD_OFFSET: 7,
    WALL_LENGTH_OFFSET: 7 * 2,

    TARGET_BOX_SIZE: 10,
    TARGET_BORDER_WIDTH: 1,

    ONEWAY_X_OFFSET: -8,
    ONEWAY_Y_OFFSET: 8,
    ONEWAY_WIDTH_ADJUST: 15,
    ONEWAY_HEIGHT_ADJUST: -16,

};

function coordToPixel(coord: Coordinate): { x: number, y: number } {
    return {
        x: coord.x * CONFIGS.TILE_SIZE,
        y: coord.y * CONFIGS.TILE_SIZE,
    };
}

function coordToCenterPixel(coord: Coordinate): { cx: number, cy: number } {
    const base = coordToPixel(coord);
    const half = Math.floor(CONFIGS.TILE_SIZE / 2);
    return {
        cx: base.x + half,
        cy: base.y + half,
    };
}


export class Renderer {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;

    private playerFrame = 0;

    constructor(targetCanvas: HTMLCanvasElement, staticMap: StaticMap) {
        this.canvas = targetCanvas;
        const ctx = this.canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context not available");
        this.ctx = ctx;

        this.canvas.width = staticMap.width * CONFIGS.TILE_SIZE;
        this.canvas.height = staticMap.height * CONFIGS.TILE_SIZE;
    }

    public drawWorld(staticMap: StaticMap, foods: Foods) {
        this.clearCanvas();
        this.drawTiles(staticMap, foods);
    }

    public drawPlayer(coord: Coordinate, dir: Dir, isMoving: boolean) {
        const { cx, cy } = coordToCenterPixel(coord);

        const DIR_TO_SPRITE_INDEX: Record<Dir, number> = {
            [Dir.Up]: 3,
            [Dir.Right]: 0,
            [Dir.Down]: 1,
            [Dir.Left]: 2,
        };
        const dirOffset = DIR_TO_SPRITE_INDEX[dir];

        if (isMoving) {
            this.playerFrame = (this.playerFrame + 1) % CONFIGS.PLAYER_ANIMATION_FRAME;
        }
        const mouthOffset = (this.playerFrame % 2 === 0) ? -0.2 : 0;
        const baseAngle = 0.5 * dirOffset; // 0.5増えると90度回転

        const a1 = baseAngle + 0.25 + mouthOffset;
        const a2 = baseAngle + 0.75 - mouthOffset;

        this.drawCircle(cx, cy, CONFIGS.PLAYER_RADIUS, Math.PI * a1, Math.PI * (a1 + 1), COLORS.PLAYER);
        this.drawCircle(cx, cy, CONFIGS.PLAYER_RADIUS, Math.PI * a2, Math.PI * (a2 + 1), COLORS.PLAYER);
    }

    public drawEnemy(coord: Coordinate, color: string) {
        const { x, y } = coordToPixel(coord);
        this.drawRect(x, y, CONFIGS.TILE_SIZE, CONFIGS.TILE_SIZE, color);
    }

    public drawTargetPosition(coord: Coordinate, color: string) {
        const { cx, cy } = coordToCenterPixel(coord);
        const halfBox = CONFIGS.TARGET_BOX_SIZE / 2;
        const innerSize = CONFIGS.TILE_SIZE - CONFIGS.TARGET_BOX_SIZE;
        const borderWidth = CONFIGS.TARGET_BORDER_WIDTH;

        const outerSize = innerSize + borderWidth * 2;

        // 外側の枠線
        this.drawRect(
            cx - halfBox - borderWidth, cy - halfBox - borderWidth,
            outerSize, outerSize,
            "#FFF"
        );
        // 内側の正方形
        this.drawRect(cx - halfBox, cy - halfBox, innerSize, innerSize, color);
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

    private clearCanvas() {
        this.drawRect(0, 0, this.canvas.width, this.canvas.height, COLORS.BACKGROUND);
    }

    private drawTiles(staticMap: StaticMap, foods: Foods) {
        for (let y = 0; y < staticMap.height; y++) {
            for (let x = 0; x < staticMap.width; x++) {
                this.drawTile({ x, y }, staticMap, foods);
            }
        }
    }

    private drawTile(coord: Coordinate, staticMap: StaticMap, foods: Foods) {
        if (DEBUG) this.drawDebugGrid(coord);

        if (staticMap.isWall(coord)) {
            this.drawWall(coord, staticMap);
        } else if (foods.has(coord)) {
            this.drawFood(coord, foods);
        } else if (staticMap.isOneway(coord)) {
            this.drawOneWay(coord);
        }
    }

    /** Wallに対して、上下左右の壁を描く */
    private drawWall(coord: Coordinate, staticMap: StaticMap) {
        if (!staticMap.isWall(coord)) return;

        const { x, y } = coordToPixel(coord);
        const neighbors = staticMap.getAdjacentTiles(coord);

        this.drawHorizontalWallOutlines(
            x, y, neighbors,
            CONFIGS.WALL_COORD_OFFSET,
            CONFIGS.WALL_LENGTH_OFFSET
        );
        this.drawVerticalWallOutlines(
            x, y, neighbors,
            CONFIGS.WALL_COORD_OFFSET,
            CONFIGS.WALL_LENGTH_OFFSET
        );
    }

    private drawHorizontalWallOutlines(
        x: number,
        y: number,
        neighbors: Record<Dir, TileType | undefined>,
        coordOffset: number,
        lengthOffset: number
    ) {
        const configs = [
            {
                py: y + coordOffset,
                isFloor: neighbors[Dir.Up] === TileType.Floor
            },
            {
                py: y + CONFIGS.TILE_SIZE - CONFIGS.OUTLINE_WIDTH - coordOffset,
                isFloor: neighbors[Dir.Down] === TileType.Floor
            }
        ];

        for (const config of configs) {
            if (!config.isFloor) continue;

            const w = CONFIGS.TILE_SIZE;
            const h = CONFIGS.OUTLINE_WIDTH;

            if (neighbors[Dir.Left] === TileType.Wall) {
                const px = x + coordOffset - lengthOffset - 1;
                this.drawWallOutline(px, config.py, w, h);
            }
            if (neighbors[Dir.Right] === TileType.Wall) {
                const px = x + coordOffset;
                this.drawWallOutline(px, config.py, w + 1, h);
            }
        }
    }

    private drawVerticalWallOutlines(
        x: number,
        y: number,
        neighbors: Record<Dir, TileType | undefined>,
        coordOffset: number,
        lengthOffset: number
    ) {
        const configs = [
            {
                px: x + coordOffset,
                isFloor: neighbors[Dir.Left] === TileType.Floor
            },
            {
                px: x + CONFIGS.TILE_SIZE - CONFIGS.OUTLINE_WIDTH - coordOffset,
                isFloor: neighbors[Dir.Right] === TileType.Floor
            },
        ];

        for (const config of configs) {
            if (!config.isFloor) continue;

            const w = CONFIGS.OUTLINE_WIDTH;
            const h = CONFIGS.TILE_SIZE;

            if (neighbors[Dir.Up] === TileType.Wall) {
                const py = y + coordOffset - lengthOffset;
                this.drawWallOutline(config.px, py, w, h);
            }
            if (neighbors[Dir.Down] === TileType.Wall) {
                const py = y + coordOffset;
                this.drawWallOutline(config.px, py, w, h);
            }
        }
    }

    private drawWallOutline(x: number, y: number, w: number, h: number) {
        this.drawRect(x, y, w, h, COLORS.WALL_OUTLINE);
    }

    private drawFood(coord: Coordinate, foods: Foods) {
        if (!foods.has(coord)) return;

        const { cx, cy } = coordToCenterPixel(coord);
        const halfFoodSize = CONFIGS.FOOD_SIZE / 2;
        this.drawRect(
            cx - halfFoodSize, cy - halfFoodSize,
            CONFIGS.FOOD_SIZE, CONFIGS.FOOD_SIZE,
            COLORS.FOOD
        );
    }

    private drawOneWay(coord: Coordinate) {
        const { x, y } = coordToPixel(coord);
        this.drawRect(
            x + CONFIGS.ONEWAY_X_OFFSET,
            y + CONFIGS.ONEWAY_Y_OFFSET,
            CONFIGS.TILE_SIZE + CONFIGS.ONEWAY_WIDTH_ADJUST,
            CONFIGS.TILE_SIZE + CONFIGS.ONEWAY_HEIGHT_ADJUST,
            COLORS.ONEWAY
        );
    }

    private drawDebugGrid(coord: Coordinate) {
        const { x, y } = coord;
        const color = (x + y) % 2 === 0 ? "#333" : "#555";
        this.drawRect(
            x * CONFIGS.TILE_SIZE,
            y * CONFIGS.TILE_SIZE,
            CONFIGS.TILE_SIZE,
            CONFIGS.TILE_SIZE,
            color
        );
    }
}