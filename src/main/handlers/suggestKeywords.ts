import { suggest } from '@src/main/keyword';

export const handleSuggestKeywords = async () => {
  console.log('start suggest keywords');
  const keywords = await suggest();
  const { textRelatedKeywords, similarRelatedKeywords, spotRelatedKeywords } =
    keywords;
  console.log('--------本文関連情報--------');
  console.log(textRelatedKeywords.map((keyword, i) => `${i + 1}: ${keyword}`));
  console.log('---------------------------');
  console.log('--------共起関連情報--------');
  console.log(
    similarRelatedKeywords.map((keyword, i) => `${i + 1}: ${keyword}`),
  );
  console.log('---------------------------');
  console.log('------類似観光スポット------');
  console.log(spotRelatedKeywords.map((keyword, i) => `${i + 1}: ${keyword}`));
  console.log('---------------------------');
  return keywords;
};
