//スクロールを通知するためのグローバル変数を定義
//対象ページではconsole.logの出力が制限されているため必要だったのですが、普通に出力されるようでしたらこの定義は不要です

declare global {
    interface Window {
      onScrollChange: (scrollY: number) => void;
      onMouseMove?: () => void;
    }
  }
  export {}; // モジュールとして扱うためのエクスポート
  