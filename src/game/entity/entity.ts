import type { PixelCoord, TileCoord } from "../../types/coordinate";
import type { StaticMap } from "../staticMap.js";
import { DIR_VECTOR, type Dir } from "../../constants/dir.js";
import { pixelCoordToTileCoord, tileCoordToCenterPixelCoord } from "../coord.js";
import { TILE_SIZE } from "../../constants/tilesize.js";


export abstract class Entity {
    public abstract get color(): string;

    protected speed: number = 45;
    protected readonly defaultSpeed = this.speed;

    protected pos: PixelCoord;
    protected tilePos: TileCoord;
    protected direction: Dir;

    protected readonly staticMap: StaticMap;

    constructor(staticMap: StaticMap, startTile: TileCoord, dir: Dir) {
        this.staticMap = staticMap;

        this.tilePos = startTile;
        this.pos = tileCoordToCenterPixelCoord(startTile);
        this.direction = dir;
    }

    public get position(): PixelCoord {
        return { ...this.pos };
    }

    public get tilePosition(): TileCoord {
        return { ...this.tilePos}
    }

    public get dir(): Dir {
        return this.direction;
    }

    protected getCurrentTile() {
        const tile = pixelCoordToTileCoord(this.pos);
        const center = {
            cx: tile.tx * TILE_SIZE + TILE_SIZE / 2,
            cy: tile.ty * TILE_SIZE + TILE_SIZE / 2,
        };
        return { tile, center };
    }

    protected isOnTileCenter(centerX: number, centerY: number): boolean {
        const EPS = 1;
        return (
            Math.abs(this.pos.px - centerX) < EPS &&
            Math.abs(this.pos.py - centerY) < EPS
        );
    }

    protected canMoveToDir(currentTile: TileCoord, dir: Dir): boolean {
        const vec = DIR_VECTOR[dir];
        const nextTile = {
            tx: currentTile.tx + vec.vx,
            ty: currentTile.ty + vec.vy
        };
        return this.staticMap.canMove(currentTile, nextTile);
    }

    protected move(delta: number): void {
        const vec = DIR_VECTOR[this.dir];
        this.pos.px += vec.vx * this.speed * delta;
        this.pos.py += vec.vy * this.speed * delta;

        this.tilePos = this.getCurrentTile().tile;
        this.wrapMovement();
    }

    abstract update(delta: number): void;

    private wrapMovement(): void {
        // マップの端から端までの瞬間移動
        const minXY = 0
        const maxX = (this.staticMap.width - 1) * TILE_SIZE;
        const maxY = (this.staticMap.height - 1) * TILE_SIZE;
        if (this.pos.px < minXY) this.pos.px = maxX;
        else if (this.pos.px > maxX) this.pos.px = minXY;
        else if (this.pos.py < minXY) this.pos.py = maxY;
        else if (this.pos.py > maxY) this.pos.py = minXY;
    }
}