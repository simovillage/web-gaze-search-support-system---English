import * as puppeteer from 'puppeteer';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class SingletonPuppeteer {
  private static _browser: puppeteer.Browser | null = null;
  static async getBrowser(): Promise<puppeteer.Browser> {
    if (!SingletonPuppeteer._browser) {
      SingletonPuppeteer._browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: null,
      });
    }

    return SingletonPuppeteer._browser;
  }
  static async closeBrowser(): Promise<void> {
    if (!SingletonPuppeteer._browser) {
      return;
    }

    const pages = await SingletonPuppeteer._browser.pages();
    for (const page of pages) {
      page.removeAllListeners();
      await page.close();
    }

    SingletonPuppeteer._browser.removeAllListeners();

    await SingletonPuppeteer._browser.close();
    SingletonPuppeteer._browser = null;
  }
}
