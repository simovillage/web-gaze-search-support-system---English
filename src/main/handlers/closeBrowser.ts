import { SingletonPuppeteer } from '@src/main/libs/puppeteer';

export const handleCloseBrowser = async () => {
  await SingletonPuppeteer.closeBrowser();
};
