import {
  BrowserElementRect,
  BrowserStationaryPoint,
} from '@src/main/browser/type';
import { STATIONARY_DECISION_PIXEL_RANGE_RADIUS } from '@src/main/constants';
import { execPythonScript } from '@src/main/python/exec';

// 四角形の面積と停留点の面積の割合を計算する
export const calcFillRatio = async (element: {
  rect: BrowserElementRect;
  stationaryPoints: BrowserStationaryPoint[];
}) => {
  const { rect, stationaryPoints } = element;

  // 停留点の座標の配列
  const points = stationaryPoints.map(
    (stationaryPoint) => [stationaryPoint.x, stationaryPoint.y] as const,
  );

  // 四角形の座標の配列
  const rectangleBounds = [
    rect.x,
    rect.y,
    rect.x + rect.width,
    rect.y + rect.height,
  ] as const;

  // 円の半径
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

  // 割合
  const fillRatio = parseFloat(result);
  return fillRatio;
};
