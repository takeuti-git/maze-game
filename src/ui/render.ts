import type { StaticMap } from "../game/staticMap.js";
import type { Foods } from "../game/foods.js";
import { COLORS } from "../constants/colors.js";
import { Dir } from "../constants/dir.js";
import { TileType } from "../constants/tile.js";
import { tileCoordToCenterPixelCoord, tileCoordToPixelCoord } from "../game/coord.js";
import type { PixelCoord, TileCoord } from "../types/coordinate.js";
import { TILE_SIZE } from "../constants/tilesize.js";

const CONFIGS = {
    OUTLINE_WIDTH: 1,

    FOOD_SIZE: 3,
    SPECIAL_FOOD_SIZE: 9,

    PLAYER_RADIUS: 12,
    PLAYER_ANIMATION_FRAME: 2,

    WALL_COORD_OFFSET: 7,
    WALL_LENGTH_OFFSET: 7 * 2,

    TARGET_BOX_SIZE: 11,
    TARGET_BORDER_WIDTH: 1,

    ONEWAY_X_OFFSET: -8,
    ONEWAY_Y_OFFSET: 8,
    ONEWAY_WIDTH_ADJUST: 15,
    ONEWAY_HEIGHT_ADJUST: -16,
};

export class Renderer {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;

    private mouthTime: number = 0;

    constructor(targetCanvas: HTMLCanvasElement, staticMap: StaticMap) {
        this.canvas = targetCanvas;
        const ctx = this.canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context not available");
        this.ctx = ctx;

        this.canvas.width = staticMap.width * TILE_SIZE;
        this.canvas.height = staticMap.height * TILE_SIZE;
    }

    public drawWorld(staticMap: StaticMap, foods: Foods) {
        this.clearCanvas();
        this.drawTiles(staticMap, foods);
    }

    public drawPlayer(coord: PixelCoord, dir: Dir, isMoving: boolean, delta: number) {
        if (isMoving) {
            this.mouthTime += delta;
        }
        const { cx, cy } = { cx: coord.px, cy: coord.py };
        const MAX_MOUTH = Math.PI / 2;
        const mouthSpeed = 50;
        const t = (Math.sin(this.mouthTime * mouthSpeed) + 1) / 2;

        const mouthAngle = MAX_MOUTH * t;

        const DIR_ANGLE: Record<Dir, number> = {
            [Dir.Right]: 0,
            [Dir.Down]: Math.PI / 2,
            [Dir.Left]: Math.PI,
            [Dir.Up]: Math.PI * 1.5,
        };

        const base = DIR_ANGLE[dir];

        const start = base + mouthAngle / 2;
        const end = base + Math.PI * 2 - mouthAngle / 2;

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy);
        this.ctx.arc(cx, cy, CONFIGS.PLAYER_RADIUS, start, end);
        this.ctx.closePath();
        this.ctx.fillStyle = COLORS.PLAYER;
        this.ctx.fill();
    }

    public drawEnemy(coord: PixelCoord, color: string) {
        const { cx, cy } = { cx: coord.px, cy: coord.py };
        const x = cx - TILE_SIZE / 2;
        const y = cy - TILE_SIZE / 2;
        this.drawRect(x, y, TILE_SIZE, TILE_SIZE, color);
    }

    public drawTargetPosition(tile: TileCoord, color: string) {
        const { px, py } = tileCoordToCenterPixelCoord(tile);
        const halfBox = CONFIGS.TARGET_BOX_SIZE / 2;
        const innerSize = TILE_SIZE - CONFIGS.TARGET_BOX_SIZE;
        const borderWidth = CONFIGS.TARGET_BORDER_WIDTH;

        const outerSize = innerSize + borderWidth * 2;

        // 外側の枠線
        this.drawRect(
            px - halfBox - borderWidth, py - halfBox - borderWidth,
            outerSize, outerSize,
            "#FFF"
        );
        // 内側の正方形
        this.drawRect(px - halfBox, py - halfBox, innerSize, innerSize, color);
    }

    private drawRect(x: number, y: number, w: number, h: number, color: string) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h);
    }

    // private drawCircle(cx: number, cy: number, r: number, start: number, end: number, color: string) {
    //     this.ctx.fillStyle = color;
    //     this.ctx.beginPath();
    //     this.ctx.arc(cx, cy, r, start, end);
    //     this.ctx.fill();
    //     this.ctx.closePath();
    // }

    private clearCanvas() {
        this.drawRect(0, 0, this.canvas.width, this.canvas.height, COLORS.BACKGROUND);
    }

    private drawTiles(staticMap: StaticMap, foods: Foods) {
        for (let ty = 0; ty < staticMap.height; ty++) {
            for (let tx = 0; tx < staticMap.width; tx++) {
                this.drawTile({ tx, ty }, staticMap, foods);
            }
        }
    }

    private drawTile(tile: TileCoord, staticMap: StaticMap, foods: Foods) {
        if (staticMap.isWall(tile)) {
            this.drawWall(tile, staticMap);

        } else if (foods.has(tile)) {
            this.drawFood(tile, foods);

        } else if (staticMap.isOneway(tile)) {
            this.drawOneWay(tile);
        }
    }

    /** Wallに対して、上下左右の壁を描く */
    private drawWall(tile: TileCoord, staticMap: StaticMap) {
        const { px, py } = tileCoordToPixelCoord(tile);
        const neighbors = staticMap.getAdjacentTiles(tile);

        this.drawHorizontalWallOutlines(
            px, py, neighbors,
            CONFIGS.WALL_COORD_OFFSET,
            CONFIGS.WALL_LENGTH_OFFSET
        );
        this.drawVerticalWallOutlines(
            px, py, neighbors,
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
                py: y + TILE_SIZE - CONFIGS.OUTLINE_WIDTH - coordOffset,
                isFloor: neighbors[Dir.Down] === TileType.Floor
            }
        ];

        for (const config of configs) {
            if (!config.isFloor) continue;

            const w = TILE_SIZE;
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
                px: x + TILE_SIZE - CONFIGS.OUTLINE_WIDTH - coordOffset,
                isFloor: neighbors[Dir.Right] === TileType.Floor
            },
        ];

        for (const config of configs) {
            if (!config.isFloor) continue;

            const w = CONFIGS.OUTLINE_WIDTH;
            const h = TILE_SIZE;

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

    private drawFood(tile: TileCoord, foods: Foods) {
        if (foods.isNone(tile)) return;

        const { px, py } = tileCoordToCenterPixelCoord(tile);

        if (foods.isSpecial(tile)) {
            const halfFoodSize = CONFIGS.SPECIAL_FOOD_SIZE / 2;
            const foodSize = CONFIGS.SPECIAL_FOOD_SIZE;
            this.drawRect(
                px - halfFoodSize, py - halfFoodSize,
                foodSize, foodSize,
                COLORS.SPECIAL_FOOD
            );
            return;
        }

        const halfFoodSize = CONFIGS.FOOD_SIZE / 2;
        this.drawRect(
            px - halfFoodSize, py - halfFoodSize,
            CONFIGS.FOOD_SIZE, CONFIGS.FOOD_SIZE,
            COLORS.FOOD
        );
    }

    private drawOneWay(tile: TileCoord) {
        const { px, py } = tileCoordToPixelCoord(tile);
        this.drawRect(
            px + CONFIGS.ONEWAY_X_OFFSET,
            py + CONFIGS.ONEWAY_Y_OFFSET,
            TILE_SIZE + CONFIGS.ONEWAY_WIDTH_ADJUST,
            TILE_SIZE + CONFIGS.ONEWAY_HEIGHT_ADJUST,
            COLORS.ONEWAY
        );
    }
}