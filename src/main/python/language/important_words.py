import json
import sys
# 文字コードエラーを回避
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


import nltk
import numpy as np
import pandas as pd
from gensim.models import KeyedVectors
from nltk import pos_tag
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from scipy.stats import pearsonr
from sklearn.feature_extraction.text import TfidfVectorizer

nltk_resources = {
    "punkt_tab": "tokenizers/punkt_tab",
    "averaged_perceptron_tagger_eng": "taggers/averaged_perceptron_tagger_eng",
    "stopwords": "corpora/stopwords",
}

for resource, path in nltk_resources.items():
    try:
        nltk.data.find(f"{path}")
        # print(f"{resource} is already downloaded")
    except LookupError:
        nltk.download(resource)
        # print(f"{resource} download complete")

stop_words = set(stopwords.words("english"))


# NLTKを使ってテキストから単語を抽出する関数
def extract_words(text: str):
    # トークナイゼーション
    words = word_tokenize(text)

    # 品詞タグ付け
    tagged_words = pos_tag(words)

    # 重要な品詞の抽出（名詞、動詞、形容詞）
    # word.lower → 単語を小文字化する
    important_words = [
        word
        for word, tag in tagged_words
        if tag.startswith(("NN", "VB", "JJ")) and word.lower() not in stop_words
    ]

    # 固有名詞の抽出
    proper_nouns = [word for word, tag in tagged_words if tag.startswith("NNP")]

    return {
        "words": important_words,
        "proper_nouns": proper_nouns,
    }


def calc_tfidf_for_proper_nouns(texts):
    extracted_data = [extract_words(text) for text in texts]
    all_proper_nouns = [
        word for data in extracted_data for word in data["proper_nouns"]
    ]

    # カスタムトークナイザーを定義します。
    def custom_tokenizer(text):
        words = text.split()
        # (単語,タグ)のタプルの単語のみを抽出
        proper_nouns_in_text = [word for word in words if word in all_proper_nouns]
        return proper_nouns_in_text

    # TF-IDFベクトルライザーを初期化します。
    # lawercase　→　全て小文字化する。固有名詞の特性を失わせてしまうため必ずFalse
    tfidf_vectorizer = TfidfVectorizer(
        use_idf=True, lowercase=False, tokenizer=custom_tokenizer, token_pattern=None
    )

    # proper_nounsの抽出されたリストを結合した文字列として渡す
    texts = [" ".join(data["words"]) for data in extracted_data]

    # 文章内の全単語（ここでは固有名詞のみ）のTfidf値を取得します。
    tfidf_matrix = tfidf_vectorizer.fit_transform(texts)

    # index 順の単語リストを取得します。
    terms = [term.lower() for term in tfidf_vectorizer.get_feature_names_out()]

    # 単語毎のtfidf値配列を取得します。
    tfidfs = tfidf_matrix.toarray()

    return tfidfs, terms


# 学習済みのWord2Vecモデルの読み込み
model = KeyedVectors.load("src/main/models/w2v/wikipedia2vec_model.kv", mmap="r")


def find_top_similar_words(words):
    # モデルの語彙にある単語のみを含むリストを作成
    filtered_words = [word for word in words if word in model.key_to_index]
    # print(filtered_words)

    # 類似度スコアを格納するための辞書
    similarity_scores = {}

    # 各単語について計算
    for word in filtered_words:
        similarity = np.mean(
            [
                model.similarity(word, other_word)
                for other_word in filtered_words
                if other_word != word
            ]
        )
        similarity_scores[word] = similarity

    # 平均類似度が高い上位5単語を選択
    top_5_words = sorted(similarity_scores, key=similarity_scores.get, reverse=True)[:5]
    top_5_words = [word.lower() for word in top_5_words]

    return top_5_words

"""
def find_similar_by_vector(words):
    # トップ5単語のベクトルを加算
    aggregate_vector = np.sum([model[word] for word in words], axis=0)

    # 加算されたベクトルに最も類似した単語を5個選択（ただし、元の単語は除く）
    similar_words = model.similar_by_vector(aggregate_vector, topn=10)

    # 元のトップ5に含まれる単語は除外
    result_words = [word for word, similarity in similar_words if word not in words][:5]

    return result_words
"""
def find_similar_by_vector(words):
    words = [word.lower() for word in words]  # 小文字化
    # print(f"Input words (lowercased): {words}")

    # ENTITY/ を付与して語彙に合わせる
    # formatted_words = [f"ENTITY/{word}" for word in words]
    # filtered_words = [word for word in formatted_words if word in model.key_to_index]
    filtered_words = [word for word in words if word in model.key_to_index]
    # デバッグ用 - filtered wordsを表示
    # print(f"Filtered words: {filtered_words}")

    #デバッグ用 - filtered_wordsが存在しなかった場合、default_wordを返す
    if not filtered_words:
        # print("No words found in the model vocabulary. Returning default value.")
        return ["default_word"]  # デフォルト処理

    aggregate_vector = np.sum([model[word] for word in filtered_words], axis=0)
    # デバッグ用 - aggregate vectorを表示
    # print(f"Aggregate vector shape: {aggregate_vector.shape}")

    # デバッグ用 - Aggregate vectorが0の場合、default_wordを返す
    if np.all(aggregate_vector == 0):
        # print("Aggregate vector is zero. Returning default value.")
        return ["default_word"]

    similar_words = model.similar_by_vector(aggregate_vector, topn=10)
    # デバッグ用 - similar wordsを表示
    # print(f"Similar words: {similar_words}")
    # デバッグ用 - similar wordsが0の場合、default_wordを返す
    if not similar_words:
        # print("No similar words found. Returning default value.")
        return ["default_word"]

    result_words = [
        word for word, similarity in similar_words
        if word not in filtered_words
    ][:5]

    # デバッグ用 - result wordsが0の場合、default_wordを返す
    if not result_words:
        # print("Result words is empty. Returning default value.")
        return ["default_word"]

    return result_words



# 類似観光スポットを抽出する関数
def find_similar_tourism_spots(
    article_title: str, top_5_words: list[str], similar_words: list[str]
):
    proper_nouns = [noun.lower() for noun in extract_words(article_title)["proper_nouns"]]
    if len(proper_nouns) == 0:
        proper_nouns = top_5_words
    proper_noun = proper_nouns[0]

    tourism_spots_df = pd.read_csv(
        "src/main/csv/Tokyo_spots_en_ja.csv"
        # 家用
        # "D:\senpaisystem\src\main\csv\Tokyo_spots_en_ja.csv"
    )
    # tokyo_tourism_spot_df = tourism_spots_df[tourism_spots_df["Ward"]]

    # 観光地名を小文字化
    tokyo_tourism_spot_names = tourism_spots_df["wikipedia2VecVocab"].astype(str)

    filtered_tokyo_tourism_spot_names = [
        word for word in tokyo_tourism_spot_names if word in model.key_to_index
    ]
    filtered_tokyo_tourism_spot_names = [
        word for word in filtered_tokyo_tourism_spot_names if word != proper_noun
    ]
    filtered_tokyo_tourism_spot_names = [
        word
        for word in filtered_tokyo_tourism_spot_names
        if word not in [word for word in top_5_words + similar_words]
    ]

    similar_spot_names = []
    for _ in range(15):
        if not filtered_tokyo_tourism_spot_names:
            # print("Filtered tourism spot names is empty. Stopping iteration.")
            break  # 空ならループを終了

        # execution_count += 1  # 実行回数をインクリメント
        # print(f"Finding most similar to: {proper_noun}")
        # print(f"Candidates: {filtered_tokyo_tourism_spot_names}")

        # 最も類似した観光地を取得
        similar_spot_name = model.most_similar_to_given(
            proper_noun,
            filtered_tokyo_tourism_spot_names,
        )
        # print(f"Most similar spot found: {similar_spot_name}")
        similar_spot_names.append(similar_spot_name)

        filtered_tokyo_tourism_spot_names.remove(similar_spot_name)

    # 正常に取得した場合
    similar_spot_df = tourism_spots_df[
        tourism_spots_df["wikipedia2VecVocab"].isin(similar_spot_names)
    ].reset_index(drop=True)
    # print(f"Total executions of the loop: {execution_count}")

    # 感情スコアのカラムを選択
    emotion_cols = [
        "anger",
        "anticipation",
        "disgust",
        "fear",
        "joy",
        "negative",
        "positive",
        "sadness",
        "surprise",
        "trust",
    ]

    # 各観光スポットの感情スコアを抽出
    emotion_scores = similar_spot_df[emotion_cols]

    # 各観光スポットの平均相関係数を格納するための辞書
    average_correlation_scores = {}

    # 各観光スポットについて計算
    for i in range(len(emotion_scores)):
        correlations = []
        for j in range(len(emotion_scores)):
            if i != j:
                # TODO: ここでエラーが発生する可能性あり
                # ピアソンの積率相関係数を計算
                corr, _ = pearsonr(emotion_scores.iloc[i], emotion_scores.iloc[j])
                correlations.append(corr)
                # correlations.append(1)

        # 相関係数の平均を計算して辞書に格納
        average_correlation_scores[similar_spot_df.loc[i, "wikipedia2VecVocab"]] = np.mean(
            correlations
        )

    # 平均相関係数が高い上位5つの観光スポットを選択
    top_5_similar_spots_vocab = sorted(
        average_correlation_scores, key=average_correlation_scores.get, reverse=True
    )[:5]

        # top_5_similar_spots_vocabに対応するPlace_Nameを取得
    top_5_similar_spots = similar_spot_df.loc[
        similar_spot_df["wikipedia2VecVocab"].isin(top_5_similar_spots_vocab),
        "Place_Name"
    ].tolist()

    return top_5_similar_spots


data = json.loads("".join(sys.argv[1:]))
article_title = data["article_title"]
texts = data["texts"]

texts = list(map(lambda text: extract_words(text), texts))

proper_nouns = list(set(sum(list(map(lambda text: text["proper_nouns"], texts)), [])))
texts = list(map(lambda text: " ".join(text["words"]), texts))

tfidfs, terms = calc_tfidf_for_proper_nouns(texts)

top_5_words = find_top_similar_words(terms)
# print(top_5_words)
similar_words = find_similar_by_vector(top_5_words)
# print(similar_words)
similar_spots = find_similar_tourism_spots(article_title, top_5_words, similar_words)
# print(similar_spots)


print(
    json.dumps(
        {
            "text_related": top_5_words,
            "similar_related": similar_words,
            "spot_related": similar_spots,
        },
    )
)
