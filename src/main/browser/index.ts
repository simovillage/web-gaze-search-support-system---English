import crypto from 'crypto';
import { fetchPageElements } from '@src/main/browser/pageElement';
import {
  articleRegexps,
  ignoreRegexps,
  needshowelementregexps,
  notArticleRegexps,
} from '@src/main/browser/regexp';
import { summarizeArticleBasedOnFocusedElements } from '@src/main/browser/summary';
import { BrowserPage, BrowserStates } from '@src/main/browser/type';
import {
  STATIONARY_DECISION_THRESHOLD_MILLISECOND,
  STATIONARY_POINT_Y_OFFSET,
} from '@src/main/constants';
import { gazeStatesEmitter } from '@src/main/gaze';
import { pushMouseMoveEvent, pushScrollEvent } from '@src/main/gaze/event';
import { GazeUpdateStationaryPointData } from '@src/main/gaze/type';
import { SingletonPuppeteer } from '@src/main/libs/puppeteer';
import { store } from '@src/main/libs/store';

export const open = async () => {
  // puppeteerの起動
  const browser = await SingletonPuppeteer.getBrowser();
  const page = await browser.newPage();
  await page.goto(
    'https://en.japantravel.com/search?prefecture=tokyo&region=kanto&q=Sensoji&sort=relevance',
    { timeout: 0 }
  );

  // 特殊なイベントのための処理
  await page.evaluateOnNewDocument(() => {
    // スクロールの監視
    window.addEventListener('scroll:', () => {
      const { scrollY } = window;
      console.log(`scroll:${scrollY}`);
    });
    // マウスの移動の監視
    window.addEventListener('mousemove', () => {
      console.log('mousemove');
    });
  });

  page.on('console', (msg) => {
    if (msg.text().startsWith('scroll')) {
      const scrollY = Number(msg.text().replace('scroll:', ''));

      pushScrollEvent({
        unixtime: Date.now(),
        scrollY,
      });
      return;
    }
    if (msg.text() === 'mousemove') {
      pushMouseMoveEvent({
        unixtime: Date.now(),
      });
      return;
    }
  });

  // 記事ページに遷移したときの処理
  page.on('framenavigated', async (frame) => {
    const title = await frame.title();
    const url = frame.url();

    //隠された要素があるページであればそれを表示する
    const ShowElementRegexps = needshowelementregexps.some((regexp) =>
      regexp.test(url)
    );
    if (ShowElementRegexps) {
      try {
        await frame.waitForSelector('.spot-description__toggle', {
          timeout: 10000,
        });
        const element = await frame.$('.spot-description__toggle');
        if (element) {
          await element.click();
        }
      } catch (error) {
        console.error('Error during the element interaction:', error);
      }
    }

    // 除外ページなら何もしない
    const includeIgnores = ignoreRegexps.some((regexp) => regexp.test(url));
    if (includeIgnores) {
      return;
    }

    // 記事ページかどうかを判定
    const includeArticles = articleRegexps.some((regexp) => regexp.test(url));
    //デバッグ用
    //console.log('includeArticles:', includeArticles);
    const includeNotArticles = notArticleRegexps.some((regexp) =>
      regexp.test(url)
    );
    //デバッグ用
    //console.log('includeNotArticles:', includeNotArticles);

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

    //デバッグ用
    try {
      store.set(`browser.pages.${hashedUrl}`, pageFull);
    } catch (error) {
      console.error('Failed to set summary data:', error);
    }

    // console.log('Calling fetchPageElements with URL:', url);
    // 要素を取得して保存
    store.set(`browser.pages.${hashedUrl}.elements.isLoading`, true);
    //fetchPageElementsが終了後にelementsをconfig.jsonに保存
    fetchPageElements(url).then((elements) => {
      console.log('Fetched elements:', elements);
      store.set(`browser.pages.${hashedUrl}.elements.data`, elements);
      store.set(`browser.pages.${hashedUrl}.elements.isLoading`, false);
    });
  });

  // 記事ページから戻ってきたときの処理
  page.on('framenavigated', async (frame) => {
    const url = frame.url();

    // 除外ページなら何もしない
    const includeIgnores = ignoreRegexps.some((regexp) => regexp.test(url));
    if (includeIgnores) {
      return;
    }

    /**
    // 現在のページが記事ページかどうかを判定
    //処理を変更したため現状不要
    const includeArticlesCurrent = articleRegexps.some((regexp) =>
      regexp.test(url)
    );
    const includeNotArticlesCurrent = notArticleRegexps.some((regexp) =>
      regexp.test(url)
    );

    const isArticleCurrent =
      includeArticlesCurrent && !includeNotArticlesCurrent;
      */

    const pageHistory = store.get('browser').pageHistory;
    const lastPage = pageHistory.at(-1);
    if (!lastPage) {
      return;
    }

    // 遷移前のページが記事ページかどうかを判定
    const includeArticlesLast = articleRegexps.some((regexp) =>
      regexp.test(lastPage.url.raw)
    );
    const includeNotArticlesLast = notArticleRegexps.some((regexp) =>
      regexp.test(lastPage.url.raw)
    );
    const isArticleLast = includeArticlesLast && !includeNotArticlesLast;

    //デバッグ用
    //console.log('This Page:', isArticleLast, 'URL', url);

    // 前ページが対象の記事ページでなかった場合は以降の処理をしない
    if (!isArticleLast) {
      return;
    }

    const isFitIntention = await page.evaluate(() => {
      return window.confirm(
        'ただいま閲覧したページはタスクや興味に適していましたか？'
      );
    });

    // 検索意図に適していない場合は何もしない
    if (!isFitIntention) {
      return;
    }

    // URLをハッシュ化
    const hashedUrl = crypto
      .createHash('sha256')
      .update(lastPage.url.raw, 'utf8')
      .digest('hex');

    // 要約を取得して保存
    console.log('generating summary...');
    store.set(`browser.pages.${hashedUrl}.summary.isLoading`, true);
    const summary = await summarizeArticleBasedOnFocusedElements(hashedUrl);
    store.set(`browser.pages.${hashedUrl}.summary.data`, summary);
    store.set(`browser.pages.${hashedUrl}.summary.isLoading`, false);
    console.log('summary generated');
  });

  // ページ遷移時にスクロールをリセットする
  page.on('framenavigated', async (frame) => {
    const url = frame.url();

    // 除外ページなら何もしない
    const includeIgnores = ignoreRegexps.some((regexp) => regexp.test(url));
    if (includeIgnores) {
      return;
    }

    pushScrollEvent({
      unixtime: Date.now(),
      scrollY: 0,
    });
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
    const { currentStationaryPoint, lastStationaryPoint, scrollY } = data;

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
      unixtime: lastStationaryPoint.unixtime,
      x: lastStationaryPoint.x,
      y: lastStationaryPoint.y + scrollY - STATIONARY_POINT_Y_OFFSET,
      nullable: lastStationaryPoint.nullable,
      stationaryTime,
    });

    store.set(`browser.pages.${currentPage.url.hash}`, clonedTargetPage);
  }
);
