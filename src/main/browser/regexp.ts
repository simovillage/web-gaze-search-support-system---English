// 記事のURLの正規表現
export const articleRegexps = [
  /^https:\/\/www\.smartmagazine\.jp\/tokyo\/article.+\/[0-9]+\/$/,
  /^https:\/\/www\.smartmagazine\.jp\/tokyo\/spots\/[0-9]+\/$/,
] as const;
// 記事判定に含めないURLの正規表現
export const notArticleRegexps = [
  /https:\/\/www\.smartmagazine\.jp\/tokyo\/article.*\/page\/[0-9]+\/$/,
] as const;
// 除外するURLの正規表現
export const ignoreRegexps = [
  /^$/,
  /^:$/,
  /^about:blank$/,
  /^https:\/\/www\.google\.com/,
] as const;
