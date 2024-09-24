# web-gaze-search-support-system

視線情報を活用した Web 検索支援システム

## Requirement

- Windows 10 or 11 (64bit)
- Node.js v18.18.2 or later
- Python v3.10.10
- openai の API キー

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

### 7. .env ファイルの作成

ルートディレクトリの下に
「.env」
というファイルを作成し、
以下をそのままコピペしてください

---ここから---（ここは無視）

MAIN_VITE_OPENAI_API_KEY=(your-api-key-here)

---ここまで---（ここも無視）

(your-openai-api-key-here) の場所に持っている API キーを入力してください。

### 8.word2vec 学習済みモデルの導入

なんとかして旧システムを開発した先輩が作成した word2vec 学習済モデルを探し、モデルを入れる場所に入れてください。
場所：.（ルートディレクトリ）/src/main/models/

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

### おまけ

柳川先輩と森先輩の論文を読んでおくとかなり理解がスムーズになります。
