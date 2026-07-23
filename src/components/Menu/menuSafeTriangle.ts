export type Point = {
  x: number;
  y: number;
};

export type Triangle = {
  origin: Point;
  sideStart: Point;
  sideEnd: Point;
};

export type RectangleBounds = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
};

export function createMenuSafeTriangle(origin: Point, submenuBounds: RectangleBounds, expansion = 12): Triangle | null {
  if (!submenuBounds.width || !submenuBounds.height) {
    return null;
  }

  const submenuNearEdgeX =
    Math.abs(origin.x - submenuBounds.left) <= Math.abs(origin.x - submenuBounds.right)
      ? submenuBounds.left
      : submenuBounds.right;

  if (submenuNearEdgeX === submenuBounds.left && origin.x > submenuNearEdgeX) {
    return null;
  }

  if (submenuNearEdgeX === submenuBounds.right && origin.x < submenuNearEdgeX) {
    return null;
  }

  return {
    origin,
    sideStart: {
      x: submenuNearEdgeX,
      y: submenuBounds.top - expansion,
    },
    sideEnd: {
      x: submenuNearEdgeX,
      y: submenuBounds.bottom + expansion,
    },
  };
}

export function isPointInsideTriangle(point: Point, triangle: Triangle): boolean {
  const { origin, sideStart, sideEnd } = triangle;

  const denominator =
    (sideStart.y - sideEnd.y) * (origin.x - sideEnd.x) + (sideEnd.x - sideStart.x) * (origin.y - sideEnd.y);

  if (denominator === 0) {
    return false;
  }

  const first =
    ((sideStart.y - sideEnd.y) * (point.x - sideEnd.x) + (sideEnd.x - sideStart.x) * (point.y - sideEnd.y)) /
    denominator;
  const second =
    ((sideEnd.y - origin.y) * (point.x - sideEnd.x) + (origin.x - sideEnd.x) * (point.y - sideEnd.y)) / denominator;
  const third = 1 - first - second;
  const tolerance = 0.001;

  return first >= -tolerance && second >= -tolerance && third >= -tolerance;
}
