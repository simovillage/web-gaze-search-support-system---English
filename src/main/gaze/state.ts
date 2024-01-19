import EventEmitter from 'events';
import { gazeEventEmitter } from '@src/main/gaze/event';
import { GazeEvent, GazeStates } from '@src/main/gaze/type';

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

export { gazeStatesEmitter };
