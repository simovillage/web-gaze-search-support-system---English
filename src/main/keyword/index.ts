import { RECT_INCLUDE_OFFSET } from '@src/main/constants';
import { generateCaption } from '@src/main/libs/openai';
import { store } from '@src/main/libs/store';
import { suggestKeywords } from '@src/main/python/language';

export const suggest = async () => {
  const lastArticle = store
    .get('browser')
    .pageHistory.findLast((page) => page.type === 'article');

  if (!lastArticle) {
    throw new Error('No article found');
  }

  const targetArticle = store.get('browser').pages[lastArticle.url.hash];
  if (!targetArticle) {
    throw new Error('No article found');
  }

  const stationaryPoints = targetArticle.stationaryPoints;

  const elements = targetArticle.elements.data;
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

  const elementsWithSumStationaryTime = elementsWithStationaryPoints.map(
    (element) => {
      const RectsWithSumStationaryTime = element.rects.map((rect) => {
        const sumStationaryTime = rect.stationaryPoints.reduce(
          (acc, cur) => acc + cur.stationaryTime,
          0,
        );
        return {
          rect,
          sumStationaryTime,
        };
      });

      const sumStationaryTime = RectsWithSumStationaryTime.reduce(
        (acc, cur) => acc + cur.sumStationaryTime,
        0,
      );

      const textLength = element.text.length;
      const imageLength = element.images.length;

      const normalizedSumStationaryTime =
        sumStationaryTime / (textLength * (imageLength + 1));

      return {
        ...element,
        normalizedSumStationaryTime,
      };
    },
  );

  const sortedElements = elementsWithSumStationaryTime.sort(
    (a, b) => b.normalizedSumStationaryTime - a.normalizedSumStationaryTime,
  );

  const summaries = Object.values(store.get('browser').pages)
    .map((page) => page.summary.data)
    .flatMap((summary) => (summary ? [summary] : []));

  const textRelatedKeywords: string[] = [];
  const similarRelatedKeywords: string[] = [];
  const spotRelatedKeywords: string[] = [];

  const keywordLengthThreshold = 5;

  for (const element of sortedElements) {
    const captions = (
      await Promise.all(element.images.map((image) => generateCaption(image)))
    ).flatMap((result) => (result.ok ? [result.value] : []));

    const { text_related, similar_related, spot_related } =
      await suggestKeywords(
        targetArticle.title,
        [element.text, ...captions].join(','),
        summaries,
      );
    textRelatedKeywords.push(...text_related);
    similarRelatedKeywords.push(...similar_related);
    spotRelatedKeywords.push(...spot_related);

    if (
      textRelatedKeywords.length >= keywordLengthThreshold &&
      similarRelatedKeywords.length >= keywordLengthThreshold &&
      spotRelatedKeywords.length >= keywordLengthThreshold
    ) {
      break;
    }
  }

  return {
    textRelatedKeywords: textRelatedKeywords.slice(0, keywordLengthThreshold),
    similarRelatedKeywords: similarRelatedKeywords.slice(
      0,
      keywordLengthThreshold,
    ),
    spotRelatedKeywords: spotRelatedKeywords.slice(0, keywordLengthThreshold),
  };
};
