import { BrowserElement, BrowserElementRect } from '@src/main/browser/type';
import {
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

  /**
  // Img要素のlazy loadingを無効化する
  await page.evaluate(() => {
    const images = document.querySelectorAll('img[loading="lazy"]');
    for (const img of images) {
      img.removeAttribute('loading');
    }
  });
  */
  await new Promise((resolve) => setTimeout(resolve, 2000));

  //デバッグ用
  console.log('以下よりコンテンツの分析を開始します');
  const elements: BrowserElement[] = await page.evaluate(
    (
      BLOCK_BOTTOM_OFFSET: number,
      //HEAD_TEXT_HEIGHT_OFFSET: number,
      SCREEN_HEIGHT_OFFSET: number
    ) => {
      // 段落ごとのまとまりをBlockと呼ぶ
      const contentsBlocks = Array.from<HTMLParagraphElement>(
        document.querySelectorAll('.spot-description p')
      );

      return contentsBlocks.map((block) => {
        // テキストと画像、それぞれの要素の位置とサイズを計算する
        const blockBoundingRect = block.getBoundingClientRect();
        // xとwidthは共通なのでここで定義する
        const x = blockBoundingRect.left;
        const width = blockBoundingRect.width;
        // Blockの上端
        const blockTop = blockBoundingRect.top;
        // Blockの下端(余分が出るので調整する)
        const blockBottom = blockBoundingRect.bottom - BLOCK_BOTTOM_OFFSET;
        //高さを計算
        const height = blockBottom - blockTop;

        // 要素の位置とサイズを入れる配列
        const boundingRects: BrowserElementRect[] = [];

        boundingRects.push({
          x,
          y: blockTop + SCREEN_HEIGHT_OFFSET,
          width,
          height: height,
          type: 'text',
        });

        const text = block.textContent || '';
        const images = Array.from(block.querySelectorAll('img')).map(
          (img) => img.src
        );

        return {
          rects: boundingRects,
          text: text.replace(/\s+/g, ''),
          images,
        };
      });
    },
    BLOCK_BOTTOM_OFFSET,
    //HEAD_TEXT_HEIGHT_OFFSET,
    SCREEN_HEIGHT_OFFSET
  );

  //デバッグ用
  console.log('分析が終了しました。');
  console.log('elements here:', elements);
  return elements;
};
