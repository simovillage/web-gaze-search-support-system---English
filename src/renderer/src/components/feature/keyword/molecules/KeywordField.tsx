type KeywordFieldPresenterProps = {
  onClickOpen: () => Promise<void>;
};

export const KeywordFieldPresenter = ({
  onClickOpen,
}: KeywordFieldPresenterProps) => {
  const handleClickSuggest = async () => {
    await window.api.suggestKeywords();
  };
  return (
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
        onClick={handleClickSuggest}
      >
        Suggest
      </button>
    </div>
  );
};

export const KeywordField = () => {
  const handleClickOpen = async () => {
    console.log('open');
  };

  return (
    <div>
      <KeywordFieldPresenter onClickOpen={handleClickOpen} />
    </div>
  );
};
