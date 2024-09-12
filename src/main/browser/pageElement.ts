import { BrowserElement, BrowserElementRect } from "@src/main/browser/type";
import {
  BLOCK_BOTTOM_OFFSET,
  HEAD_TEXT_HEIGHT_OFFSET,
  SCREEN_HEIGHT,
  SCREEN_HEIGHT_OFFSET,
  SCREEN_WIDTH,
} from "@src/main/constants";
import puppeteer from "puppeteer";

//サイトの作りによって少々書き換える必要あり
//対象のサイトの作りとタグを要確認！

// ページ内の要素の位置とサイズを取得する
export const fetchPageElements = async (url: string) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    },
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });
  await new Promise((resolve) => setTimeout(resolve, 2000));

  /**
  // Img要素のlazy loadingを無効化する
  //多分エラーが出ます
  await page.evaluate(() => {
    const images = document.querySelectorAll("img.lazyloaded");
    for (const img of images) {
      img.classList.remove("lazyloaded");
      img.removeAttribute("loading");
    }
  });
  */

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const elements: BrowserElement[] = (
    await page.evaluate(
      (
        BLOCK_BOTTOM_OFFSET: number,
        HEAD_TEXT_HEIGHT_OFFSET: number,
        SCREEN_HEIGHT_OFFSET: number
      ) => {
        // 段落ごとのまとまりをBlockと呼ぶ
        const contentsBlocks = Array.from<HTMLParagraphElement>(
          //説明部のテキスト抜き出し
          document.querySelectorAll(".spot-overview-section > p")
        );
        // 各要素のテキストを出力
        contentsBlocks.forEach((block, index) => {
          console.log(`Block ${index + 1}:`, block.textContent);
        });

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

          // Block内の要素
          const children = Array.from(block.children);
          // Block内の要素のタグ名(先頭と末尾にはダミーのタグを入れる)
          const tags = [
            "HEAD",
            ...children.map((child) => child.tagName),
            "TAIL",
          ];
          // Block内の要素(先頭と末尾にはダミーの要素を入れる)
          const elements = [null, ...children, null];

          // 要素の位置とサイズを入れる配列
          const boundingRects: BrowserElementRect[] = [];

          // 以下、要素の位置とサイズの計算
          // iは処理中の要素のインデックス
          let i = 0;
          while (true) {
            // 要素のタグ名
            const tag = tags[i];
            if (!tag) {
              throw new Error("Unexpected Error");
            }

            // 末尾に到達したら終了
            if (tag === "TAIL") {
              break;
            }

            // 画像の場合は画像のelementから位置とサイズを取得する
            if (tag === "IMG") {
              const element = elements[i];
              if (!element) {
                throw new Error("Unexpected Error");
              }
              const imgBoundingRect = element.getBoundingClientRect();
              const y = imgBoundingRect.top + SCREEN_HEIGHT_OFFSET;
              const height = imgBoundingRect.height;
              boundingRects.push({
                x,
                y,
                width,
                height,
                type: "img",
              });

              // 次の要素へ
              i++;
              continue;
            }

            // テキストの場合はbrタグから位置とサイズを計算する
            let j = 0;
            // 末尾か画像が現れるまでjを増やす
            while (true) {
              const targetTag = tags[i + j + 1];
              // BRタグが連続する場合は複数のテキストが存在する
              if (targetTag === "BR") {
                j++;
                continue;
              }
              // BRタグの次が画像の場合はテキストが存在しない
              if (targetTag === "IMG") {
                break;
              }
              // 末尾に到達した場合はひとつのテキストが存在する
              if (targetTag === "TAIL") {
                j++;
                break;
              }
            }

            // 次の要素が画像の場合
            if (j === 0) {
              i++;
              continue;
            }

            // テキストのtopとbottomを計算する
            const startY =
              tag === "HEAD"
                ? blockTop
                : elements[i]?.getBoundingClientRect().top ?? -1;
            const endY =
              tags[i + j] === "TAIL"
                ? blockBottom
                : elements[i + j]?.getBoundingClientRect().top ?? -1;
            if (startY === -1 || endY === -1) {
              throw new Error("Unexpected Error");
            }

            // テキストの高さを計算する
            const height = endY - startY;
            // 先頭のテキストは高さの調整をする必要がある
            const offset = i === 0 ? HEAD_TEXT_HEIGHT_OFFSET : 0;
            boundingRects.push({
              x,
              y: startY + SCREEN_HEIGHT_OFFSET,
              width,
              height: height + offset,
              type: "text",
            });

            i += j;
          }

          const text = (block.textContent ?? "").replace(/\s+/g, "");
          const images = Array.from(block.querySelectorAll("img")).map(
            (img) => img.src
          );

          return {
            rects: boundingRects,
            text,
            images,
          };
        });
      },
      BLOCK_BOTTOM_OFFSET,
      HEAD_TEXT_HEIGHT_OFFSET,
      SCREEN_HEIGHT_OFFSET
    )
  ).filter((element) => {
    const ignoreTextRegexps = [/公開日/, /更新日/];

    const includeIgnoreText = ignoreTextRegexps.some((regexp) =>
      regexp.test(element.text)
    );

    return !includeIgnoreText;
  });

  return elements;
};
