// 視線情報
export type GazePointNullable = {
  unixtime: number;
  x: number | null;
  y: number | null;
  nullable: true;
};
export type GazePointNonNullable = {
  unixtime: number;
  x: number;
  y: number;
  nullable: false;
};
export type GazePoint = GazePointNullable | GazePointNonNullable;

// Tobiiから視線情報が送られてきたときのイベント
export type GazePointEvent = {
  name: 'point';
  value: GazePoint;
};

// スクロールしたときのイベント
export type GazeScrollEvent = {
  name: 'scroll';
  value: Pick<GazePoint, 'unixtime'>;
};

// マウスを動かしたときのイベント
export type GazeMouseMoveEvent = {
  name: 'mouse-move';
  value: Pick<GazePoint, 'unixtime'>;
};

export type GazeEvent = GazePointEvent | GazeScrollEvent | GazeMouseMoveEvent;

// 視線の状態
export type GazeStates = {
  // 現在の停留点
  currentStationaryPoint: GazePointNonNullable | null;
  // 現在の視線の状態
  currentPoint: GazePointNonNullable | null;
};
