import type { Vector } from "../types/coordinate";

export enum Dir {
    UP,
    RIGHT,
    DOWN,
    LEFT
}

export const DIR_VECTOR: Record<Dir, Vector> = {
    [Dir.UP]: { vx: 0, vy: -1 },
    [Dir.RIGHT]: { vx: 1, vy: 0 },
    [Dir.DOWN]: { vx: 0, vy: 1 },
    [Dir.LEFT]: { vx: -1, vy: 0 },
};

export const OPPOSITE_DIR: Record<Dir, Dir> = {
    [Dir.UP]: Dir.DOWN,
    [Dir.RIGHT]: Dir.LEFT,
    [Dir.DOWN]: Dir.UP,
    [Dir.LEFT]: Dir.RIGHT,
}

export const ALL_DIRS: readonly Dir[] = [
    Dir.UP,
    Dir.RIGHT,
    Dir.DOWN,
    Dir.LEFT,
] as const;