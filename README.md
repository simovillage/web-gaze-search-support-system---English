# web-gaze-search-support-system

視線情報を活用した Web 検索支援システム

## Requirement

- Windows 10 or 11 (64bit)
- Node.js v18.18.2 or later
- Python v3.10.10

## Setup

### 1. Node.js のインストール

[Node.js](https://nodejs.org/en)の公式サイトからインストーラをダウンロードし、インストールしてください。もしくは、その他の方法で Node.js をインストールしてください。

### 2. Python のインストール

[Python](https://www.python.org)の公式サイトからインストーラをダウンロードし、インストールしてください。もしくは、その他の方法で Python をインストールしてください。

### 3. リポジトリのクローン

このディレクトリを丸々あなたの PC にコピーしてください。もしくは、<https://github.com/airRnot1106/web-gaze-search-support-system.git>をクローンしてください。

### 4. pnpm のインストール

<https://pnpm.io/ja/installation>を参照し、pnpm をインストールしてください。

### 5. ライブラリのインストール

PowerShell やコマンドプロンプトを開き、このディレクトリに移動し、以下のコマンドを実行してください。

```shell
pnpm install
```

### 6. Mecab のインストール

<https://qd-suriken.com/2020/04/22/widows%E3%81%A7mecabneologd/>などを参照し、Mecab と mecab-ipadic-neologd をインストールし、Path を設定してください。

### 7. システムの実行

PowerShell やコマンドプロンプトを開き、このディレクトリに移動し、以下のコマンドを実行してください。

```shell
pnpm dev
```

初回起動時は、Python のセットアップが行われます(時間がかかります)。セットアップが完了すると、GUI が憑依されます。

## Usage

### Browser

#### Launch

ブラウザを起動します。

#### Close

ブラウザを閉じます。

### Keywords

#### Open

検索キーワードの一覧を表示します。

#### Suggest

最後に閲覧した Web ページに対しての検索キーワードの推薦処理を開始します。
