import type { Vector } from "../types/coordinate";

export enum Dir {
    Up,
    Right,
    Down,
    Left
}

export const DIR_VECTOR: Record<Dir, Vector> = {
    [Dir.Up]: { vx: 0, vy: -1 },
    [Dir.Right]: { vx: 1, vy: 0 },
    [Dir.Down]: { vx: 0, vy: 1 },
    [Dir.Left]: { vx: -1, vy: 0 },
};

export const OPPOSITE_DIR: Record<Dir, Dir> = {
    [Dir.Up]: Dir.Down,
    [Dir.Right]: Dir.Left,
    [Dir.Down]: Dir.Up,
    [Dir.Left]: Dir.Right,
} as const;

/** 
 * 方向決定の優先順位  
 * 上 > 左 > 下 > 右 
 */
export const ALL_DIRS: readonly Dir[] = [
    Dir.Up,
    Dir.Left,
    Dir.Down,
    Dir.Right,
] as const;