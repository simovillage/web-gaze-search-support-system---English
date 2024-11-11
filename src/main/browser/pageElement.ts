import { BrowserElement, BrowserElementRect } from '@src/main/browser/type';
import {
  BLOCK_BOTTOM_HILIGHT_OFFSET,
  BLOCK_BOTTOM_OFFSET,
  HEAD_TEXT_HEIGHT_OFFSET,
  SCREEN_HEIGHT,
  SCREEN_HEIGHT_OFFSET,
  SCREEN_WIDTH,
} from '@src/main/constants';
import puppeteer from 'puppeteer';

// ページ内の要素の位置とサイズを取得する
export const fetchPageElements = async (url: string) => {
  //デバッグ用
  console.log('呼ばれました！！！要素の取得を開始します。');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    },
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  await new Promise((resolve) => setTimeout(resolve, 2000));

  //隠された要素を表示してから要素を取得する
  // ターゲット要素が存在するか確認
  try {
    console.log('要素を確認し、あれば表示します');
    const elementExists = await page.$('.spot-description__full-text');
    if (elementExists) {
      // スタイルを変更して要素を表示
      await page.evaluate(() => {
        const targetDiv = document.querySelector(
          '.spot-description__full-text'
        ) as HTMLElement;
        if (targetDiv) {
          targetDiv.style.display = 'block'; // 要素を表示
          targetDiv.style.visibility = 'visible'; // 要素を見える状態に
          targetDiv.style.height = 'auto'; // 高さを自動調整
        }
      });
    }
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
  await page.evaluate(() => {
    //　拡大率変更
    document.body.style.zoom = '125%';
  });
  //デバッグ用
  console.log('以下よりコンテンツの分析を開始します');
  const elements: BrowserElement[] = await page.evaluate(
    (
      BLOCK_BOTTOM_OFFSET: number,
      BLOCK_BOTTOM_HILIGHT_OFFSET: number,
      SCREEN_HEIGHT_OFFSET: number
    ) => {
      // それぞれのdivタグから段落を取得し、Blockと呼ぶ
      const contentsBlocks = Array.from<HTMLElement>(
        /**
        //画像も取得できる方
        document.querySelectorAll(
          '.spot-description p, .spot-highlight p, .spot-page-image img, .spot-highlights-section img,'
        )
          */
        document.querySelectorAll(
          '.spot-description p, .spot-highlight p, .article__content p'
        )
      );

      // pタグをフィルタリング
      const paragraphBlocks = contentsBlocks.filter(
        (block) => block.tagName && block.tagName.toUpperCase() === 'P'
      );

      // imgタグをフィルタリング
      const imageBlocks = contentsBlocks.filter(
        (block) => block.tagName === 'IMG'
      );

      // テキスト要素のdivにタグ付ける
      const spotDescriptionParagraphs = contentsBlocks.filter(
        (p) => p.closest('.spot-description') !== null
      );
      const spotHighlightParagraphs = contentsBlocks.filter(
        (p) => p.closest('.spot-highlight') !== null
      );

      return contentsBlocks.map((block) => {
        // 要素の位置とサイズを入れる配列
        const boundingRects: BrowserElementRect[] = [];

        // テキスト要素の位置とサイズを計算する
        const blockBoundingRect = block.getBoundingClientRect();
        // xとwidthは共通なのでここで定義する
        const x = blockBoundingRect.left;
        const width = blockBoundingRect.width;
        // Blockの上端
        const blockTop = blockBoundingRect.top;

        let blockBottom = blockBoundingRect.bottom;

        if (paragraphBlocks.includes(block)) {
          if (spotDescriptionParagraphs.includes(block)) {
            blockBottom = blockBoundingRect.bottom - BLOCK_BOTTOM_OFFSET;
          } else if (spotHighlightParagraphs.includes(block)) {
            blockBottom =
              blockBoundingRect.bottom - BLOCK_BOTTOM_HILIGHT_OFFSET;
          }

          const height = blockBottom - blockTop;
          boundingRects.push({
            x,
            y: blockTop + SCREEN_HEIGHT_OFFSET,
            width,
            height,
            type: 'text',
          });
        } else if (imageBlocks.includes(block)) {
          const imgBoundingRect = block.getBoundingClientRect();
          const y = imgBoundingRect.top + SCREEN_HEIGHT_OFFSET;
          const height = blockBoundingRect.height;

          boundingRects.push({
            x,
            y,
            width,
            height,
            type: 'img',
          });
        }

        //テキスト要素を代入
        const text = paragraphBlocks ? block.textContent || '' : '';
        //画像要素を代入
        const images = imageBlocks ? [block.getAttribute('src') || ''] : [];

        return {
          rects: boundingRects,
          text: text,
          images,
        };
      });
    },
    BLOCK_BOTTOM_OFFSET,
    BLOCK_BOTTOM_HILIGHT_OFFSET,
    SCREEN_HEIGHT_OFFSET
  );

  //デバッグ用
  console.log('分析が終了しました。');
  console.log('elements here:', elements);
  return elements;
};
