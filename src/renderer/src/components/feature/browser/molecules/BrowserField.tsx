type BrowserFieldPresenterProps = {
  onClickLaunch: () => Promise<void>;
  onClickClose: () => Promise<void>;
};

export const BrowserFieldPresenter = ({
  onClickLaunch,
  onClickClose,
}: BrowserFieldPresenterProps) => {
  return (
    <div className="flex items-center justify-start space-x-4">
      <button
        type="button"
        className="btn btn-neutral btn-lg"
        onClick={onClickLaunch}
      >
        Launch
      </button>
      <button
        type="button"
        className="btn btn-neutral btn-lg"
        onClick={onClickClose}
      >
        Close
      </button>
    </div>
  );
};

export const BrowserField = () => {
  const handleClickLaunch = async () => {
    await window.api.launchBrowser();
  };
  const handleClickClose = async () => {
    await window.api.closeBrowser();
  };
  return (
    <BrowserFieldPresenter
      onClickLaunch={handleClickLaunch}
      onClickClose={handleClickClose}
    />
  );
};
