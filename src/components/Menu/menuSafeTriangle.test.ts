import { describe, expect, it } from 'vitest';
import { createMenuSafeTriangle, isPointInsideTriangle, type RectangleBounds } from './menuSafeTriangle';

const submenuBounds: RectangleBounds = {
  top: 48,
  right: 280,
  bottom: 176,
  left: 160,
  width: 120,
  height: 128,
};

describe('menu safe triangle geometry', () => {
  it('builds a triangle toward a submenu on the right', () => {
    expect(createMenuSafeTriangle({ x: 120, y: 112 }, submenuBounds)).toEqual({
      origin: { x: 120, y: 112 },
      sideStart: { x: 160, y: 36 },
      sideEnd: { x: 160, y: 188 },
    });
  });

  it('builds a triangle toward a submenu on the left', () => {
    expect(createMenuSafeTriangle({ x: 320, y: 112 }, submenuBounds)).toEqual({
      origin: { x: 320, y: 112 },
      sideStart: { x: 280, y: 36 },
      sideEnd: { x: 280, y: 188 },
    });
  });

  it('rejects unavailable geometry and origins already beyond the near edge', () => {
    expect(createMenuSafeTriangle({ x: 120, y: 112 }, { ...submenuBounds, width: 0 })).toBeNull();
    expect(createMenuSafeTriangle({ x: 180, y: 112 }, submenuBounds)).toBeNull();
  });

  it('classifies points inside and outside the pointer corridor', () => {
    const triangle = createMenuSafeTriangle({ x: 120, y: 112 }, submenuBounds);

    expect(triangle).not.toBeNull();
    expect(isPointInsideTriangle({ x: 144, y: 112 }, triangle!)).toBe(true);
    expect(isPointInsideTriangle({ x: 144, y: 220 }, triangle!)).toBe(false);
  });

  it('rejects degenerate triangles', () => {
    const point = { x: 1, y: 1 };
    const degenerateTriangle = {
      origin: { x: 0, y: 0 },
      sideStart: { x: 0, y: 0 },
      sideEnd: { x: 0, y: 0 },
    };

    expect(isPointInsideTriangle(point, degenerateTriangle)).toBe(false);
  });
});
