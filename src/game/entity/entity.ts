import type { PixelCoord, TileCoord } from "../../types/coordinate";
import type { StaticMap } from "../staticMap.js";
import { DIR_VECTOR, type Dir } from "../../constants/dir.js";
import { pixelCoordToTileCoord, tileCoordToCenterPixelCoord } from "../coord.js";
import { TILE_SIZE } from "../../constants/tilesize.js";
import type { World } from "../world";


export abstract class Entity {
    public abstract get color(): string;
    public abstract update(delta: number, world?: World): void;

    protected speed: number = 45;
    protected readonly defaultSpeed = this.speed;

    protected pixelPos: PixelCoord;
    protected tilePos: TileCoord;
    protected direction: Dir;

    protected readonly staticMap: StaticMap;

    constructor(staticMap: StaticMap, startTile: TileCoord, dir: Dir) {
        this.staticMap = staticMap;

        this.tilePos = startTile;
        this.pixelPos = tileCoordToCenterPixelCoord(startTile);
        this.direction = dir;
    }

    public get pixelPosition(): PixelCoord {
        return { ...this.pixelPos };
    }

    public get tilePosition(): TileCoord {
        return { ...this.tilePos };
    }

    public get dir(): Dir {
        return this.direction;
    }

    protected collideEntity(other: Entity, range: number): boolean {
        return (
            Math.abs(this.pixelPos.px - other.pixelPos.px) < range &&
            Math.abs(this.pixelPos.py - other.pixelPos.py) < range
        );
    }

    protected getCurrentTile() {
        const tile = pixelCoordToTileCoord(this.pixelPos);
        const center = {
            cx: tile.tx * TILE_SIZE + TILE_SIZE / 2,
            cy: tile.ty * TILE_SIZE + TILE_SIZE / 2,
        };
        return { tile, center };
    }

    protected isOnTileCenter(): boolean {
        const { center } = this.getCurrentTile();
        const centerX = center.cx;
        const centerY = center.cy;

        const EPS = 1;
        return (
            Math.abs(this.pixelPos.px - centerX) < EPS &&
            Math.abs(this.pixelPos.py - centerY) < EPS
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
        this.pixelPos.px += vec.vx * this.speed * delta;
        this.pixelPos.py += vec.vy * this.speed * delta;

        this.tilePos = this.getCurrentTile().tile;
        this.wrapMovement();
    }

    private wrapMovement(): void {
        // マップの端から端までの瞬間移動
        const min = 0;
        const maxX = (this.staticMap.width - 1) * TILE_SIZE;
        const maxY = (this.staticMap.height - 1) * TILE_SIZE;
        if (this.pixelPos.px < min) this.pixelPos.px = maxX;
        else if (this.pixelPos.px > maxX) this.pixelPos.px = min;
        else if (this.pixelPos.py < min) this.pixelPos.py = maxY;
        else if (this.pixelPos.py > maxY) this.pixelPos.py = min;
    }
}