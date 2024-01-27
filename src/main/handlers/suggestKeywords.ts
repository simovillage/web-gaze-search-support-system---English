import { suggest } from '@src/main/keyword';

export const handleSuggestKeywords = async () => {
  console.log("start suggest keywords")
  const keywords = await suggest();
  const { textRelated, similarRelated, spotRelated} = keywords
  console.log("--------本文関連情報--------")
  console.log(textRelated.map((keyword, i) => `${i + 1}: ${keyword}` ))
  console.log("---------------------------")
  console.log("--------共起関連情報--------")
  console.log(similarRelated.map((keyword, i) => `${i + 1}: ${keyword}` ))
  console.log("---------------------------")
  console.log("------類似観光スポット------")
  console.log(spotRelated.map((keyword, i) => `${i + 1}: ${keyword}` ))
  console.log("---------------------------")
  return keywords;
};
