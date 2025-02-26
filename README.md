# web-gaze-search-support-system - English

視線情報を活用した Web 検索支援システムの英語対応バージョン

## このシステムについて
このシステムは[先行研究のシステム](https://github.com/airRnot1106/web-gaze-search-support-system.git)の一部を改変し、英語に対応させたものです<br>
詳しくはTeamsにアップロードされている論文を読んでください<br>

## やりながら少しずつ調べた方がいいこと
- [ ] Python仮想環境について
- [ ] Pythonバージョンについて
- [ ] 環境変数について 
- [ ] Git Hubについて
- [ ] ディレクトリについて
- [ ] アイトラッカーについて（使い方とか）
- [ ] Wikipedia2VecやWord2Vecについて

## このプログラムを動かすのに必要な条件(Requirement)

- Windows 10 or 11 (64bit)
- Node.js v18.18.2 or later
- Python v3.10.10（必ずこのバージョンをインストールしてください）
- openai の API キー（先生にアカウントの情報を教えてもらってください）

## Setup

### 1. Node.js のインストール

[Node.js](https://nodejs.org/en)の公式サイトからインストーラをダウンロードし、インストールしてください。もしくは、その他の方法で Node.js をインストールしてください。 

### 2. Python のインストール

[Python](https://www.python.org)の公式サイトからインストーラをダウンロードし、インストールしてください。もしくは、その他の方法で Python をインストールしてください。<br>
必ず3.10.10のバージョンをインストールしてください

### 3. pnpm のインストール

[pnpm](https://pnpm.io/ja/installation)を参照し、pnpm をインストールしてください。<br>
npmを使用するの場所を参考にしてください

### 4. Tobii Pro Eye Tracker Managerのインストール
[ダウンロードページ](https://www.tobii.com/ja/products/software/applications-and-developer-kits/tobii-pro-eye-tracker-manager)に移動し、Windows用をダウンロードしてください<br>
もし動作しなかった場合、公開されていればv2.7.1をインストールしてください（動いたので）


### 5. リポジトリのクローン

このディレクトリを丸々あなたの PC にコピーしてください。もしくは、Git hubからシステムのプログラム<https://github.com/simovillage/web-gaze-search-support-system---English.git>をクローンしてください。

### 6. ライブラリのインストール

PowerShell やコマンドプロンプトを開き、このディレクトリに移動し、以下のコマンドを実行してください。

```shell
pnpm install
```

### 7. Python仮想環境の作成
venvで仮想環境を作成してください<br>
Powershellかコマンドプロンプトを開きこのディレクトリに移動し以下のコマンドを実行してください<br>
```shell
python -m venv .venv
```


### 8. 依存関係ライブラリのインストール
以下のコマンドを入力し、仮想環境をアクティベートしてください<br>
```shell
.\.venv\Scripts\activate
```

アクティベートしたのち、以下のコマンドを入力し、インストールが完了するのを待ってください
```shell
pip install -r requirements.txt
```


### 9. .env ファイルの作成

ルートディレクトリの下に
「.env」
というファイルを作成し、
以下をそのままコピペしてください

```shell
MAIN_VITE_OPENAI_API_KEY = (your-api-key-here)
```

(your-openai-api-key-here) の場所に持っている API キーを入力してください。

### 10.wikipedia2vec 学習済みモデルの導入

[Wikipedia2Vec事前学習モデルダウンロードページ](https://wikipedia2vec.github.io/wikipedia2vec/pretrained/)から以下の英語事前学習モデルをダウンロードしてください<br>

```
enwiki_20180420 (window=5, iteration=10, negative=15)　→ 300d(bin)
```

これを何とかしてKeyed Vectorファイル(拡張子：.kv)にしたのち、作成の際に出てきたnpyファイルと一緒に以下の場所に格納してください
```shell
src/main/models/w2v/
```

### 11. アイトラッカーのキャリブレーション
Tobii Pro Sparkを接続し、キャリブレーションを行ってください

### 12. システムの実行

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

- 先行研究の論文を読んでおくとかなり理解がスムーズになります。
- Tobii Pro Labと一緒に使うとエラー出るかも
- 導入の際にエラーが出るかもなので都度エラー文を調べて頑張ってください


