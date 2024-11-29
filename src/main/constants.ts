// 必要なPythonのバージョン
export const REQUIRED_PYTHON_VERSION = '3.10.0';

// ブラウザに使用するディスプレイの横幅
export const SCREEN_WIDTH = 1920;
// export const SCREEN_WIDTH = 2550;
// ブラウザに使用するディスプレイの縦幅
export const SCREEN_HEIGHT = 1080;
//export const SCREEN_HEIGHT = 1440;
// ブラウザに使用するディスプレイの縦幅のオフセット
export const SCREEN_HEIGHT_OFFSET = 180;

// Tobiiのサンプリングレート
export const TOBII_SAMPLE_RATE = 60;

// PageElementのコンテンツの位置とサイズを計算する際に使用するオフセット
export const HEAD_TEXT_HEIGHT_OFFSET = 20;
export const BLOCK_BOTTOM_OFFSET = 16;
export const BLOCK_BOTTOM_HILIGHT_OFFSET = 10;

// 停留点のyがやや下になるのを調整するためのオフセット
export const STATIONARY_POINT_Y_OFFSET = 80;

// Rect内に含める停留点のオフセット
export const RECT_INCLUDE_OFFSET = 50;

// 停留判定のピクセル範囲の半径
// export const STATIONARY_DECISION_PIXEL_RANGE_RADIUS = 60; // //日本語用半径
export const STATIONARY_DECISION_PIXEL_RANGE_RADIUS = 60;

// 停留判定に必要な最低ミリ秒数
export const STATIONARY_DECISION_THRESHOLD_MILLISECOND = 300;
//export const STATIONARY_DECISION_THRESHOLD_MILLISECOND = 100;

// 注視判定に必要な停留点の面積の割合の閾値
// export const FOCUS_DECISION_FILL_RATIO_THRESHOLD = 0.5; // //日本語用注視割合
export const FOCUS_DECISION_FILL_RATIO_THRESHOLD = 0.5;
