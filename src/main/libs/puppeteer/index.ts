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

    await SingletonPuppeteer._browser.close();
    SingletonPuppeteer._browser = null;
  }
}
