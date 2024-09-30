// 記事のURLの正規表現
export const articleRegexps = [
  //日本語用観光地記事ページ
  /^https:\/\/www\.smartmagazine\.jp\/tokyo\/article.+\/[0-9]+\/$/,
  /^https:\/\/www\.smartmagazine\.jp\/tokyo\/spots\/[0-9]+\/$/,
  //英語用観光地記事ページ
  /^https:\/\/en\.japantravel\.com\/tokyo\/.*\/[0-9]+\/?$/,
  /^https:\/\/en\.japantravel\.com\/places\/tokyo\/.*\/[0-9]+\/?$/,
] as const;
export const needshowelementregexps = [
  //隠された要素があるため表示が必要
  /^https:\/\/en\.japantravel\.com\/places\/tokyo\/.*\/[0-9]+\/?$/,
] as const;
// 記事判定に含めないURLの正規表現
export const notArticleRegexps = [
  //日本語用記事除外ページ
  /https:\/\/www\.smartmagazine\.jp\/tokyo\/article.*\/page\/[0-9]+\/$/,
  //英語用記事除外ページ
] as const;
// 除外するURLの正規表現
export const ignoreRegexps = [
  /^$/,
  /^:$/,
  /^about:blank$/,
  /^https:\/\/www\.google\.com/,
  /^https:\/\/www\.japan\.travel\/en\/destinations\/kanto\/tokyo\/.*\/$/,
] as const;
