import { suggest } from '@src/main/keyword';

export const handleSuggestKeywords = async () => {
  const keywords = await suggest();
  console.log(keywords);
  return keywords;
};
