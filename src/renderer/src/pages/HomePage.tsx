import { BrowserField } from '@renderer/components/feature/browser/molecules/BrowserField';
import { KeywordField } from '@renderer/components/feature/keyword/molecules/KeywordField';

export const HomePagePresenter = () => {
  return (
    <div className="h-full p-8">
      <div className="space-y-3">
        <p className="font-bold text-3xl">Browser</p>
        <BrowserField />
      </div>
      <div className="divider" />
      <div className="space-y-3">
        <p className="font-bold text-3xl">Keywords</p>
        <KeywordField />
      </div>
      <div className="divider" />
    </div>
  );
};

export const HomePage = () => {
  return <HomePagePresenter />;
};
