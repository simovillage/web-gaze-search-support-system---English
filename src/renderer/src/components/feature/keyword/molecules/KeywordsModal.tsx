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
  modalId: string;
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
  modalId,
  relatedKeywordStates,
  onChange,
}: KeywordModalPresenterProps) => {
  return (
    <dialog id={modalId} className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button
            type="submit"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          >
            ✕
          </button>
        </form>
        <div className="flex items-center justify-between">
          <KeywordList
            title="Keywords related to text"
            keywordType="textRelatedKeywords"
            keywordStates={relatedKeywordStates.textRelatedKeywords}
            onChange={onChange}
          />
          <KeywordList
            title="Similar Words to the Keywords"
            keywordType="similarRelatedKeywords"
            keywordStates={relatedKeywordStates.similarRelatedKeywords}
            onChange={onChange}
          />
          <KeywordList
            title="Similar Spots"
            keywordType="spotRelatedKeywords"
            keywordStates={relatedKeywordStates.spotRelatedKeywords}
            onChange={onChange}
          />
        </div>
      </div>
    </dialog>
  );
};

type KeywordModalProps = {
  modalId: string;
};

export const KeywordModal = memo(({ modalId }: KeywordModalProps) => {
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
        modalId={modalId}
        relatedKeywordStates={relatedKeywordStates}
        onChange={updateCheckedKeywords}
      />
    </div>
  );
});
