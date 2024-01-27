import { KeywordList } from '@src/renderer/src/components/feature/keyword/molecules/KeywordList';
import { useUpdateCheckedKeywords } from '@src/renderer/src/stores/keyword/operations';
import {
  checkedRelatedKeywordsState,
  relatedKeywordsState,
} from '@src/renderer/src/stores/keyword/selectors';
import { RelatedKeywordsMap } from '@src/renderer/src/stores/keyword/types';
import { useAtomValue, useSetAtom } from 'jotai';
import { memo } from 'react';

type KeywordModalPresenterProps = {
  relatedKeywordStates: Record<
    keyof RelatedKeywordsMap,
    { keyword: string; checked: boolean }[]
  >;
  onChange: (
    keywordType: keyof RelatedKeywordsMap,
    index: number,
    checked: boolean,
  ) => void;
};

export const KeywordModalPresenter = ({
  relatedKeywordStates,
  onChange,
}: KeywordModalPresenterProps) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <KeywordList
          title="本文関連情報"
          keywordType="textRelatedKeywords"
          keywordStates={relatedKeywordStates.textRelatedKeywords}
          onChange={onChange}
        />
        <KeywordList
          title="共起関連情報"
          keywordType="similarRelatedKeywords"
          keywordStates={relatedKeywordStates.similarRelatedKeywords}
          onChange={onChange}
        />
        <KeywordList
          title="類似観光スポット"
          keywordType="spotRelatedKeywords"
          keywordStates={relatedKeywordStates.spotRelatedKeywords}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export const KeywordModal = memo(() => {
  const relatedKeywords = useAtomValue(relatedKeywordsState);
  const checkedRelatedKeywords = useAtomValue(checkedRelatedKeywordsState);
  const relatedKeywordStates = Object.entries(relatedKeywords).reduce(
    (acc, [keywordType, keywords], index) => {
      acc[keywordType as keyof RelatedKeywordsMap] = keywords.map(
        (keyword) => ({
          keyword,
          checked:
            checkedRelatedKeywords[keywordType as keyof RelatedKeywordsMap][
              index
            ] ?? false,
        }),
      );
      return acc;
    },
    {} as Record<
      keyof RelatedKeywordsMap,
      { keyword: string; checked: boolean }[]
    >,
  );

  const updateCheckedKeywords = useUpdateCheckedKeywords();
  return (
    <div>
      <KeywordModalPresenter
        relatedKeywordStates={relatedKeywordStates}
        onChange={updateCheckedKeywords}
      />
    </div>
  );
});
