import { SiteHeader } from '@renderer/components/feature/site/molecules/SiteHeader';
import { HomePage } from '@renderer/pages/HomePage';

function App(): JSX.Element {
  return (
    <div>
      <div className="h-[20dvh]">
        <SiteHeader />
      </div>
      <div className="h-[80dvh]">
        <HomePage />
      </div>
    </div>
  );
}

export default App;
