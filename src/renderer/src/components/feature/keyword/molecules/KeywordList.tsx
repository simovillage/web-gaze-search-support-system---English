import { RelatedKeywordsMap } from '@src/renderer/src/stores/keyword/types';
import { memo } from 'react';

type KeywordListPresenterProps = {
  title: string;
  keywordType: keyof RelatedKeywordsMap;
  keywordStates: { keyword: string; checked: boolean }[];
  onChange: (
    keywordType: keyof RelatedKeywordsMap,
    index: number,
    checked: boolean,
  ) => void;
};

export const KeywordListPresenter = ({
  title,
  keywordType,
  keywordStates,
  onChange,
}: KeywordListPresenterProps) => {
  const handleChange =
    (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(keywordType, index, event.target.checked);
    };
  return (
    <div>
      <h2>{title}</h2>
      <div>
        {keywordStates.map(({ keyword, checked }, index) => (
          <div key={keyword} className="form-control">
            <label className="label cursor-pointer">
              <input
                type="checkbox"
                checked={checked}
                className="checkbox"
                onChange={handleChange(index)}
              />
              <span className="label-text">{keyword}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

type KeywordListProps = {
  title: string;
  keywordType: keyof RelatedKeywordsMap;
  keywordStates: { keyword: string; checked: boolean }[];
  onChange: (
    keywordType: keyof RelatedKeywordsMap,
    index: number,
    checked: boolean,
  ) => void;
};

export const KeywordList = memo(
  ({ title, keywordType, keywordStates, onChange }: KeywordListProps) => {
    return (
      <KeywordListPresenter
        title={title}
        keywordType={keywordType}
        keywordStates={keywordStates}
        onChange={onChange}
      />
    );
  },
);
