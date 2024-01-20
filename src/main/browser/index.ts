import crypto from 'crypto';
import {
  articleRegexps,
  ignoreRegexps,
  notArticleRegexps,
} from '@src/main/browser/regexp';
import { BrowserPage, BrowserStates } from '@src/main/browser/type';
import { STATIONARY_DECISION_THRESHOLD_MILLISECOND } from '@src/main/constants';
import { gazeStatesEmitter } from '@src/main/gaze';
import { GazeUpdateStationaryPointData } from '@src/main/gaze/type';
import { SingletonPuppeteer } from '@src/main/libs/puppeteer';
import { store } from '@src/main/libs/store';

export const open = async () => {
  // puppeteerの起動
  const browser = await SingletonPuppeteer.getBrowser();
  const page = await browser.newPage();
  await page.goto('https://www.smartmagazine.jp/tokyo/');

  // ページが遷移したときの処理
  page.on('framenavigated', async (frame) => {
    const title = await frame.title();
    const url = frame.url();

    // 除外ページなら何もしない
    const includeIgnores = ignoreRegexps.some((regexp) => regexp.test(url));
    if (includeIgnores) {
      return;
    }

    // 記事ページかどうかを判定
    const includeArticles = articleRegexps.some((regexp) => regexp.test(url));
    const includeNotArticles = notArticleRegexps.some((regexp) =>
      regexp.test(url),
    );

    // URLをハッシュ化
    const hashedUrl = crypto
      .createHash('sha256')
      .update(url, 'utf8')
      .digest('hex');

    // 履歴に追加
    const page: BrowserStates['pageHistory'][number] = {
      title,
      url: {
        raw: url,
        hash: hashedUrl,
      },
      type: includeArticles && !includeNotArticles ? 'article' : 'other',
    };
    const pageHistory = store.get('browser').pageHistory;
    store.set('browser.pageHistory', [...pageHistory, page]);

    // 記事ページでなければ処理を終了
    if (page.type !== 'article') {
      return;
    }

    // すでにページが保存されていれば何もしない
    const storedPages = store.get('browser').pages;
    if (storedPages[hashedUrl]) {
      return;
    }

    // 記事ページの場合はページの情報を保存
    const pageFull: BrowserPage = {
      ...page,
      elements: {
        isLoading: false,
        data: [],
      },
      summary: {
        isLoading: false,
        data: null,
      },
      stationaryPoints: [],
    };

    store.set(`browser.pages.${hashedUrl}`, pageFull);
  });
};

// 停留点が更新されたときの処理
gazeStatesEmitter.on(
  'updateStationaryPoint',
  (data: GazeUpdateStationaryPointData) => {
    // 現在のページを取得し、記事ページでなければ何もしない
    const pageHistory = store.get('browser').pageHistory;
    const currentPage = pageHistory.at(-1);
    if (!currentPage) {
      return;
    }
    if (currentPage.type !== 'article') {
      return;
    }

    // 停留時間を計算し、閾値以下なら何もしない
    const { currentStationaryPoint, lastStationaryPoint } = data;

    if (lastStationaryPoint.nullable) {
      return;
    }

    const stationaryTime =
      currentStationaryPoint.unixtime - lastStationaryPoint.unixtime;
    if (stationaryTime <= STATIONARY_DECISION_THRESHOLD_MILLISECOND) {
      return;
    }

    // 現在のページの情報を取得
    const pages = store.get('browser').pages;
    const targetPage = pages[currentPage.url.hash];
    if (!targetPage) {
      return;
    }

    // 参照的に変更を加えないようにクローンを作成
    const clonedTargetPage = structuredClone(targetPage);

    // 停留点を追加
    clonedTargetPage.stationaryPoints.push({
      ...lastStationaryPoint,
      stationaryTime,
    });

    store.set(`browser.pages.${currentPage.url.hash}`, clonedTargetPage);
  },
);
