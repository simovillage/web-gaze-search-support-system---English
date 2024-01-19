import { spawn } from 'child_process';
import EventEmitter from 'events';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@src/main/constants';

// Tobiiからのデータを受け取るためのEventEmitter
export const tobiiEmitter = new EventEmitter();

const childProcess = spawn('.venv/Scripts/python.exe', [
  'src/main/libs/tobii/subscribe.py',
]);

childProcess.stdout.on('data', (chunk: Buffer) => {
  const raw = chunk.toString();
  const [unixtime, x_ratio, y_ratio] = raw.split('/').map((v) => parseFloat(v));

  // Tobiiの座標系は左上が(0, 0)、右下が(1, 1)のため、画面の座標系に変換する
  const x_p = Number.isNaN(x_ratio) ? null : Math.round(x_ratio * SCREEN_WIDTH);
  const x = (() => {
    if (x_p === null) {
      return null;
    }
    if (x_p < 0) {
      return 0;
    }
    if (x_p > SCREEN_WIDTH) {
      return SCREEN_WIDTH;
    }
    return x_p;
  })();

  const y_p = Number.isNaN(y_ratio)
    ? null
    : Math.round(y_ratio * SCREEN_HEIGHT);
  const y = (() => {
    if (y_p === null) {
      return null;
    }
    if (y_p < 0) {
      return 0;
    }
    if (y_p > SCREEN_HEIGHT) {
      return SCREEN_HEIGHT;
    }
    return y_p;
  })();

  tobiiEmitter.emit('data', { unixtime, x, y });
});
