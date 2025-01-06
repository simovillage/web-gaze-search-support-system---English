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

    except LookupError:
        nltk.download(resource)


stop_words = set(stopwords.words("english"))


# NLTKを使ってテキストから単語を抽出する関数
def extract_words(text: str):
    # トークナイゼーション
    words = word_tokenize(text)

    # 品詞タグ付け
    tagged_words = pos_tag(words)

    # 無視する言葉
    ignore_words = [
    "Said", "Inner", "JPY", "Treajure", "Visitors", "Considered",
    "Today", "Year", "Attractions", "Travel", "Japan", "Tokyo",
    "English", "Given", "People", "Station", 
    "April", "May", "June", "November", "October", "Spring", "Autumn", "February", "March",
    "New","Prefecture", "Main", "First",
    "River", "Gate", "Hall", "Foundation", "Ceremony", "Day",
    "Period", "Admission", "House", "Photo", "Tea", "Well", 
    "Exit", "Manuel", "Sean", "David", "Marshall", "CC", "BY-NC", "BY-NC-ND"
    ]



    # 重要な品詞の抽出（名詞、動詞、形容詞）
    # word.lower → 単語を小文字化する
    important_words = [
        word for word, tag in tagged_words
        if tag.startswith(("NN", "VB", "JJ")) and word.lower() not in stop_words
    ]

    # 固有名詞の抽出（記号や一般名詞を除外）
    proper_nouns = [
        word for word, tag in tagged_words
        if tag.startswith("NNP") and word.isalpha() and word[0].isupper() and word not in ignore_words
    ]

    # 重複を削除
    proper_nouns = list(set(proper_nouns))

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

# 結果から日本語をはじくためのフィルター
def contains_japanese(word):
    for char in word:
        if '\u3040' <= char <= '\u30FF' or '\u4E00' <= char <= '\u9FFF':
            return True
    return False

# 本文から関連するワードを抽出
def find_top_similar_words(words):
    # モデルの語彙にある単語のみを含むリストを作成
    filtered_words = [word for word in words if word in model.key_to_index]

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
    top_5_words = sorted(similarity_scores, key=similarity_scores.get, reverse=True)[:10]
    top_5_words = [word.lower() for word in top_5_words if not contains_japanese(word)]

    return top_5_words

#　上記ワードの加算したベクトルに似てるベクトルを持つワードを抽出
def find_similar_by_vector(words):
    words = [word.lower() for word in words]  # 小文字化

    filtered_words = [word for word in words if word in model.key_to_index]

    aggregate_vector = np.sum([model[word] for word in filtered_words], axis=0)

    similar_words = model.similar_by_vector(aggregate_vector, topn=10)

    result_words = [
        word for word,similarity in similar_words
        if word not in filtered_words and not contains_japanese(word)
    ][:5]

    return result_words



# 類似観光スポットを抽出する関数
def find_similar_tourism_spots(
    article_title: str, top_5_words: list[str], similar_words: list[str]
):
    # proper_nouns = [noun.lower() for noun in extract_words(article_title)["proper_nouns"]]
    proper_nouns = [noun[0] for noun in similar_words]
    if len(proper_nouns) == 0:
        proper_nouns = top_5_words
    proper_noun = proper_nouns[0]

    tourism_spots_df = pd.read_csv(
        "src/main/csv/Tokyo_spots_en_ja.csv"
    )

    # 観光地名を取得
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
            break  # 空ならループを終了

        # 最も類似した観光地を取得
        similar_spot_name = model.most_similar_to_given(
            proper_noun,
            filtered_tokyo_tourism_spot_names,
        )
        similar_spot_names.append(similar_spot_name)

        filtered_tokyo_tourism_spot_names.remove(similar_spot_name)

    # 正常に取得した場合
    similar_spot_df = tourism_spots_df[
        tourism_spots_df["wikipedia2VecVocab"].isin(similar_spot_names)
    ].reset_index(drop=True)

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
similar_words = find_similar_by_vector(top_5_words)
similar_spots = find_similar_tourism_spots(article_title, top_5_words, similar_words)


print(
    json.dumps(
        {
            "text_related": top_5_words,
            "similar_related": similar_words,
            "spot_related": similar_spots,
        },
    )
)
