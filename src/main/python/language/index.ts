import { execPythonScript } from '@src/main/python/exec';

export const suggestKeywords = async (
  articleTitle: string,
  targetText: string,
  summaries: string[],
) => {
  const sentenceBert = await execPythonScript<
    { sentence: string; similarity: number }[]
  >('src/main/python/language/sentence_bert.py', [
    JSON.stringify({
      target: targetText,
      summaries,
    }),
  ]);

  const similarityTexts = sentenceBert
    .filter((sb) => sb.similarity <= 0.4)
    .map((sb) => sb.sentence);

  const relatedKeywords = await execPythonScript<{
    text_related: string[];
    similar_related: string[];
    spot_related: string[];
  }>('src/main/python/language/important_words.py', [
    JSON.stringify({
      article_title: articleTitle,
      texts: [targetText, ...similarityTexts],
    }),
  ]);

  return relatedKeywords;
};
