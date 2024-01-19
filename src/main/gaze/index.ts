import EventEmitter from 'events';
import {
  GazeEvent,
  GazePointEvent,
  GazeScrollEvent,
  GazeStates,
} from '@src/main/gaze/type';
import { tobiiEmitter } from '@src/main/libs/tobii';

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
const pushMouseMoveEvent = (value: GazeScrollEvent['value']): void => {
  gazeEvents.push({
    name: 'mouse-move',
    value,
  });
};

// Tobiiからデータを受け取ったときの処理
tobiiEmitter.on('data', (data: GazePointEvent['value']) => {
  pushPointEvent(data);
});

// gazeStatesの更新を検知するためのEventEmitter
const gazeStatesEmitter = new EventEmitter();

// 停留点の管理をするオブジェクト. Proxyを使って更新を検知する
const gazeStates = new Proxy<{ states: GazeStates }>(
  {
    states: {
      currentStationaryPoint: null,
      lastPoint: null,
    },
  },
  {
    get: (target, prop, receiver) => {
      return Reflect.get(target, prop, receiver);
    },
    set: (target, prop, value, receiver) => {
      const result = Reflect.set(target, prop, value, receiver);
      if (result && prop !== 'states') {
        const states = value as GazeStates;
        gazeStatesEmitter.emit('data', { ...states });
      }
      return result;
    },
  },
);

// gazeEventsが更新されたときの処理
gazeEventEmitter.on('data', (data: GazeEvent) => {
  switch (data.name) {
    case 'point': {
      const { value } = data;
      const states = {
        ...gazeStates.states,
        lastPoint: value,
      };
      gazeStates.states = states;
      break;
    }
    case 'scroll': {
      const states = {
        ...gazeStates.states,
        currentStationaryPoint: null,
        lastPoint: null,
      };
      gazeStates.states = states;
      break;
    }
    case 'mouse-move': {
      const states = {
        ...gazeStates.states,
        currentStationaryPoint: null,
        lastPoint: null,
      };
      gazeStates.states = states;
      break;
    }
  }
});

export { gazeStatesEmitter, pushScrollEvent, pushMouseMoveEvent };
