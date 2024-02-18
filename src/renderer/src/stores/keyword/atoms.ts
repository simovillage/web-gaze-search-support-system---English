import { RelatedKeywordsMap } from '@src/renderer/src/stores/keyword/types';
import { atom } from 'jotai';
import { atomWithReset } from 'jotai/utils';

export const textRelatedKeywordsAtom = atom(['', '', '', '', '']);

export const similarRelatedKeywordsAtom = atom(['', '', '', '', '']);

export const spotRelatedKeywordsAtom = atom(['', '', '', '', '']);

export const checkedRelatedKeywordsAtom = atomWithReset({
  textRelatedKeywords: [false, false, false, false, false] as boolean[],
  similarRelatedKeywords: [false, false, false, false, false] as boolean[],
  spotRelatedKeywords: [false, false, false, false, false] as boolean[],
} satisfies Record<keyof RelatedKeywordsMap, boolean[]>);
