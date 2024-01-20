import { GazePointNonNullable } from '@src/main/gaze/type';

export type BrowserElementRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'text' | 'img';
};

export type BrowserElement = {
  rects: BrowserElementRect[];
  text: string;
  images: string[];
};

export type BrowserPageType = 'article' | 'other';

export type BrowserStationaryPoint = GazePointNonNullable & {
  stationaryTime: number;
};

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

export type BrowserStates = {
  pageHistory: Pick<BrowserPage, 'title' | 'url' | 'type'>[];
  pages: {
    [hashedUrl: string]: BrowserPage;
  };
};
