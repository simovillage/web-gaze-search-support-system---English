import {
  BrowserElementRect,
  BrowserStationaryPoint,
} from '@src/main/browser/type';
import { STATIONARY_DECISION_PIXEL_RANGE_RADIUS } from '@src/main/constants';
import { execPythonScript } from '@src/main/python/exec';

export const calcFillRatio = async (element: {
  rect: BrowserElementRect;
  stationaryPoints: BrowserStationaryPoint[];
}) => {
  const { rect, stationaryPoints } = element;

  const points = stationaryPoints.map(
    (stationaryPoint) => [stationaryPoint.x, stationaryPoint.y] as const,
  );

  const rectangleBounds = [
    rect.x,
    rect.y,
    rect.x + rect.width,
    rect.y + rect.height,
  ] as const;

  const radius = STATIONARY_DECISION_PIXEL_RANGE_RADIUS;

  const result = await execPythonScript<string>(
    'src/main/python/fillRatio/fill_ratio.py',
    [
      JSON.stringify({
        points,
        rectangle_bounds: rectangleBounds,
        radius,
      }),
    ],
  );

  const fillRatio = parseFloat(result);
  return fillRatio;
};
