export const SiteHeaderPresenter = () => {
  return (
    <header className="flex h-full items-center justify-between bg-base-200 p-5">
      <div>
        <h1 className="select-none text-2xl font-bold">
          Web-Search-Support-System
        </h1>
      </div>
    </header>
  );
};

export const SiteHeader = () => {
  return <SiteHeaderPresenter />;
};
