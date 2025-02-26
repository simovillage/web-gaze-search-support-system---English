import EventEmitter from 'events';
import {
  GazeEvent,
  GazeMouseMoveEvent,
  GazePointEvent,
  GazeScrollEvent,
} from '@src/main/gaze/type';
import { tobiiEmitter } from '@src/main/libs/tobii';

/* 視線やブラウザ操作に関するイベントをpushするプログラム */

// gazeEventsの更新を検知するためのEventEmitter
const gazeEventEmitter = new EventEmitter();

// GazeEventの配列. Proxyを使って更新を検知する
const gazeEvents: GazeEvent[] = new Proxy([], {
  get: (target, prop, receiver) => {
    return Reflect.get(target, prop, receiver);
  },
  set: (target, prop, value, receiver) => {
    const result = Reflect.set(target, prop, value, receiver);
    // lengthの更新は無視する
    if (result && prop !== 'length') {
      const event = value as GazeEvent;
      gazeEventEmitter.emit('data', event);
    }
    return result;
  },
});

// PointEventをpushする
const pushPointEvent = (value: GazePointEvent['value']): void => {
  gazeEvents.push({
    name: 'point',
    value,
  });
};

// ScrollEventをpushする
const pushScrollEvent = (value: GazeScrollEvent['value']): void => {
  gazeEvents.push({
    name: 'scroll',
    value,
  });
};

// MouseMoveEventをpushする
const pushMouseMoveEvent = (value: GazeMouseMoveEvent['value']): void => {
  gazeEvents.push({
    name: 'mouse-move',
    value,
  });
};

// Tobiiからデータを受け取ったときの処理
tobiiEmitter.on('data', (data: GazePointEvent['value']) => {
  pushPointEvent(data);
});

export { gazeEventEmitter, pushScrollEvent, pushMouseMoveEvent };
