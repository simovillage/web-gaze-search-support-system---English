import {
  checkedRelatedKeywordsAtom,
  similarRelatedKeywordsAtom,
  spotRelatedKeywordsAtom,
  textRelatedKeywordsAtom,
} from '@src/renderer/src/stores/keyword/atoms';
import { RelatedKeywordsMap } from '@src/renderer/src/stores/keyword/types';
import { RESET, useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';

export const useUpdateKeywords = () =>
  useAtomCallback(
    useCallback((_, set, relatedKeywords: RelatedKeywordsMap) => {
      set(checkedRelatedKeywordsAtom, RESET);
      const {
        textRelatedKeywords,
        similarRelatedKeywords,
        spotRelatedKeywords,
      } = relatedKeywords;
      set(textRelatedKeywordsAtom, textRelatedKeywords);
      set(similarRelatedKeywordsAtom, similarRelatedKeywords);
      set(spotRelatedKeywordsAtom, spotRelatedKeywords);
    }, []),
  );

export const useUpdateCheckedKeywords = () =>
  useAtomCallback(
    useCallback(
      (
        get,
        set,
        keywordType: keyof RelatedKeywordsMap,
        index: number,
        checked: boolean,
      ) => {
        const checkedRelatedKeywords = get(checkedRelatedKeywordsAtom);
        const checkedKeywords = checkedRelatedKeywords[keywordType];
        checkedKeywords[index] = checked;
        set(checkedRelatedKeywordsAtom, checkedRelatedKeywords);
      },
      [],
    ),
  );
