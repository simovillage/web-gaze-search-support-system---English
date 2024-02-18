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
  value: Pick<GazePoint, 'unixtime'> & {
    // スクロール量
    scrollY: number;
  };
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
  currentStationaryPoint: GazePoint;
  // 現在の視線の状態
  currentPoint: GazePoint;
  // 現在のスクロール量
  currentScrollY: number;
};

// 停留点が更新されたときに送られるイベントのデータ
export type GazeUpdateStationaryPointData = {
  currentStationaryPoint: GazePoint;
  lastStationaryPoint: GazePoint;
  scrollY: number;
};
