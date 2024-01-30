import { KeywordModal } from '@src/renderer/src/components/feature/keyword/molecules/KeywordsModal';
import { useUpdateKeywords } from '@src/renderer/src/stores/keyword/operations';

type KeywordFieldPresenterProps = {
  modalId: string;
  onClickOpen: () => Promise<void>;
  onClickSuggest: () => Promise<void>;
};

export const KeywordFieldPresenter = ({
  modalId,
  onClickOpen,
  onClickSuggest,
}: KeywordFieldPresenterProps) => {
  return (
    <div>
      <div className="flex items-center justify-start space-x-4">
        <button
          type="button"
          className="btn btn-neutral btn-lg"
          onClick={onClickOpen}
        >
          Open
        </button>
        <button
          type="button"
          className="btn btn-neutral btn-lg"
          onClick={onClickSuggest}
        >
          Suggest
        </button>
      </div>
      <KeywordModal modalId={modalId} />
    </div>
  );
};

export const KeywordField = () => {
  const modalId = 'keyword-modal';
  const handleClickOpen = async () => {
    (document.getElementById(modalId) as HTMLDialogElement).showModal();
  };

  const updateRelatedKeywords = useUpdateKeywords();
  const handleClickSuggest = async () => {
    console.log('suggest');
    const relatedKeywords = await window.api.suggestKeywords();
    updateRelatedKeywords(relatedKeywords);
  };

  return (
    <div>
      <KeywordFieldPresenter
        modalId={modalId}
        onClickOpen={handleClickOpen}
        onClickSuggest={handleClickSuggest}
      />
    </div>
  );
};
