import {
  checkedRelatedKeywordsAtom,
  similarRelatedKeywordsAtom,
  spotRelatedKeywordsAtom,
  textRelatedKeywordsAtom,
} from '@src/renderer/src/stores/keyword/atoms';
import { atom } from 'jotai';

export const relatedKeywordsState = atom((get) => {
  const textRelatedKeywords = get(textRelatedKeywordsAtom);
  const similarRelatedKeywords = get(similarRelatedKeywordsAtom);
  const spotRelatedKeywords = get(spotRelatedKeywordsAtom);

  return {
    textRelatedKeywords,
    similarRelatedKeywords,
    spotRelatedKeywords,
  };
});

export const checkedRelatedKeywordsState = atom((get) => {
  const checkedRelatedKeywords = get(checkedRelatedKeywordsAtom);
  return checkedRelatedKeywords;
});
