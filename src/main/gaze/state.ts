import EventEmitter from 'events';
import { STATIONARY_DECISION_PIXEL_RANGE_RADIUS } from '@src/main/constants';
import { gazeEventEmitter } from '@src/main/gaze/event';
import {
  GazeEvent,
  GazePointNonNullable,
  GazeStates,
  GazeUpdateStationaryPointData,
} from '@src/main/gaze/type';
import equal from 'fast-deep-equal';

// gazeStatesの更新を検知するためのEventEmitter
const gazeStatesEmitter = new EventEmitter();

// 停留点の管理をするオブジェクト. Proxyを使って更新を検知する
const gazeStates = new Proxy<{ states: GazeStates }>(
  {
    states: {
      currentStationaryPoint: {
        unixtime: 0,
        x: null,
        y: null,
        nullable: true,
      },
      currentPoint: {
        unixtime: 0,
        x: null,
        y: null,
        nullable: true,
      },
      currentScrollY: 0,
    },
  },
  {
    get: (target, prop, receiver) => {
      return Reflect.get(target, prop, receiver);
    },
    set: (target, prop, value, receiver) => {
      const before = { ...target.states };
      const result = Reflect.set(target, prop, value, receiver);
      const after = { ...target.states };

      if (result && prop === 'states') {
        const states = value as GazeStates;
        gazeStatesEmitter.emit('data', { ...states });
      }
      if (
        result &&
        !equal(before.currentStationaryPoint, after.currentStationaryPoint)
      ) {
        gazeStatesEmitter.emit('updateStationaryPoint', {
          currentStationaryPoint: after.currentStationaryPoint,
          lastStationaryPoint: before.currentStationaryPoint,
          scrollY: before.currentScrollY,
        } satisfies GazeUpdateStationaryPointData);
      }
      return result;
    },
  },
);

// 2点間のユークリッド距離を計算する
const calculateEuclideanDistance = (
  a: Pick<GazePointNonNullable, 'x' | 'y'>,
  b: Pick<GazePointNonNullable, 'x' | 'y'>,
) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

// gazeEventsが更新されたときの処理
gazeEventEmitter.on('data', (data: GazeEvent) => {
  switch (data.name) {
    case 'point': {
      // 現在の停留点
      const currentStationaryPoint = gazeStates.states.currentStationaryPoint;
      // 最新の視線情報
      const currentPoint = data.value;

      // 最新の視線情報がnullの場合は停留点をnullにする
      if (currentPoint.nullable) {
        const states = {
          ...gazeStates.states,
          currentStationaryPoint: {
            ...currentPoint,
            x: null,
            y: null,
          },
          currentPoint: {
            ...currentPoint,
            x: null,
            y: null,
          },
        };
        gazeStates.states = states;
        break;
      }

      // 直前の視線情報がnullの場合は停留点の更新
      if (currentStationaryPoint.nullable) {
        const states = {
          ...gazeStates.states,
          currentStationaryPoint: currentPoint,
          currentPoint: currentPoint,
        };
        gazeStates.states = states;
        break;
      }

      // 最新の視線情報と現在の停留点とのユークリッド距離を計算
      const distance = calculateEuclideanDistance(
        currentPoint,
        currentStationaryPoint,
      );

      // 移動距離が閾値を超えていたら停留点の更新
      if (distance > STATIONARY_DECISION_PIXEL_RANGE_RADIUS) {
        const states = {
          ...gazeStates.states,
          currentStationaryPoint: currentPoint,
          currentPoint: currentPoint,
        };
        gazeStates.states = states;
        break;
      }

      // 閾値を超えていなかったら停留点の更新はしない
      const states = {
        ...gazeStates.states,
        currentPoint: currentPoint,
      };
      gazeStates.states = states;
      break;
    }
    case 'scroll': {
      const { unixtime, scrollY } = data.value;
      const states = {
        currentStationaryPoint: {
          unixtime,
          x: null,
          y: null,
          nullable: true,
        } as const,
        currentPoint: {
          unixtime,
          x: null,
          y: null,
          nullable: true,
        } as const,
        currentScrollY: scrollY,
      };
      gazeStates.states = states;
      break;
    }
    case 'mouse-move': {
      const { unixtime } = data.value;
      const states = {
        ...gazeStates.states,
        currentStationaryPoint: {
          unixtime,
          x: null,
          y: null,
          nullable: true,
        } as const,
        currentPoint: {
          unixtime,
          x: null,
          y: null,
          nullable: true,
        } as const,
      };
      gazeStates.states = states;
      break;
    }
  }
});

export { gazeStatesEmitter };
