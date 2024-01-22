import { BrowserElement, BrowserStationaryPoint } from '@src/main/browser/type';
import { RECT_INCLUDE_OFFSET } from '@src/main/constants';
import { generateCaption, summarize } from '@src/main/libs/openai';
import { store } from '@src/main/libs/store';
import { calcFillRatio } from '@src/main/python';
import { Result } from '@src/types/result';

const extractFocusedElements = async (
  elements: BrowserElement[],
  stationaryPoints: BrowserStationaryPoint[],
) => {
  const elementsWithStationaryPoints = elements.map((element) => ({
    ...element,
    rects: element.rects.map((rect) => {
      const stationaryPointsInRect = stationaryPoints.filter(
        (stationaryPoint) =>
          stationaryPoint.x >= rect.x - RECT_INCLUDE_OFFSET &&
          stationaryPoint.x <= rect.x + rect.width + RECT_INCLUDE_OFFSET &&
          stationaryPoint.y >= rect.y - RECT_INCLUDE_OFFSET &&
          stationaryPoint.y <= rect.y + rect.height + RECT_INCLUDE_OFFSET,
      );
      return {
        rect,
        stationaryPoints: stationaryPointsInRect,
      };
    }),
  }));

  const elementsWithFillRatio = await Promise.all(
    elementsWithStationaryPoints.map(async (element) => {
      const fillRatios = await Promise.all(
        element.rects
          .filter(({ rect }) => rect.type === 'text')
          .map(async (rect) => {
            const fillRatio = await calcFillRatio(rect);
            return fillRatio;
          }),
      );

      const products = fillRatios.reduce((acc, cur) => acc * cur, 1);

      return {
        ...element,
        fillRatio: products,
      };
    }),
  );

  console.log({
    elementsWithFillRatio,
  });

  const focusedElements = elementsWithFillRatio.filter(
    (element) => element.fillRatio > 0.05, //FOCUS_DECISION_FILL_RATIO_THRESHOLD,
  );

  return focusedElements;
};

export const summarizeArticleBasedOnFocusedElements = async (
  hashedUrl: string,
) => {
  const targetPage = store.get('browser').pages[hashedUrl];
  if (!targetPage) {
    return;
  }

  const elements = targetPage.elements;
  const stationaryPoints = targetPage.stationaryPoints;

  const waitForElementsResult = await new Promise<Result<void, Error>>(
    (resolve) => {
      const id = setTimeout(() => {
        resolve({
          ok: false,
          error: new Error('timeout'),
        });
      }, 10000);

      const interval = setInterval(() => {
        if (elements.isLoading) {
          return;
        }

        clearTimeout(id);
        clearInterval(interval);
        resolve({
          ok: true,
          value: undefined,
        });
      }, 100);
    },
  );

  if (!waitForElementsResult.ok) {
    return;
  }

  const focusedElements = await extractFocusedElements(
    elements.data,
    stationaryPoints,
  );

  const focusedTexts = focusedElements.map((element) => element.text);
  const focusedImages = focusedElements.flatMap((element) => element.images);

  const captions = (
    await Promise.all(
      focusedImages.map(async (image) => {
        const captionResult = await generateCaption(image);
        if (!captionResult.ok) {
          return;
        }
        return captionResult.value;
      }),
    )
  ).flatMap((caption) => (caption ? [caption] : []));

  console.log({
    focusedTexts,
    captions,
  });

  const summary = await summarize([...focusedTexts, ...captions].join('\n'));

  console.log({
    summary,
  });

  if (!summary.ok) {
    throw summary.error;
  }

  return summary.value;
};
