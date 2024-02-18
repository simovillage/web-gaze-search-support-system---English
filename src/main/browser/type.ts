import { GazePointNonNullable } from '@src/main/gaze/type';

// Webページの要素の座標
export type BrowserElementRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'text' | 'img';
};

// Webページの要素
export type BrowserElement = {
  rects: BrowserElementRect[];
  text: string;
  images: string[];
};

// Webページの種類
export type BrowserPageType = 'article' | 'other';

// Webページにおける停留点
export type BrowserStationaryPoint = GazePointNonNullable & {
  stationaryTime: number;
};

// Webページ
export type BrowserPage = {
  title: string;
  url: {
    raw: string;
    hash: string;
  };
  type: BrowserPageType;
  elements: {
    isLoading: boolean;
    data: BrowserElement[];
  };
  summary: {
    isLoading: boolean;
    data: string | null;
  };
  stationaryPoints: BrowserStationaryPoint[];
};

// Webブラウザの状態
export type BrowserStates = {
  pageHistory: Pick<BrowserPage, 'title' | 'url' | 'type'>[];
  pages: {
    [hashedUrl: string]: BrowserPage;
  };
};
