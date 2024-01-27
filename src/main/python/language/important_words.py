import json
import re
import sys

import MeCab
import numpy as np
import pandas as pd
from gensim.models import KeyedVectors
from scipy.stats import pearsonr
from sklearn.feature_extraction.text import TfidfVectorizer

mecab = MeCab.Tagger('-r "C:\Program Files (x86)\MeCab\etc\mecabrc-u"')

ignore_words_list = [
    r"^.*[0-9]+[年月日時分秒m].*$",
    r"^デートコース$",
    r"^プロ野球$",
    r"^メインスタジアム$",
    r"^国際大会$",
    r"^.+的$",
    r"^重要文化財$",
    r"^神宮球場$",
    r"ウェブサイト",
    r"ホームページ",
    r"公式",
    r"^天望$",
    r"^展望台$",
    r"^ランチメニュー$",
    r"^スカイツリー$",
    r"^ソラマチ$",
    r"^商業施設$",
    r"^光の海$",
    r"^優しい光$",
    r"^イベント会場$",
    r"^自家製パン$",
    r"^テイクアウト$",
    r"^青山$",
    r"^2階$",
    r"^一丁目$",
    r"^登録有形文化財$",
    r"^B級グルメ$",
    r"^レトロ$",
    r"^日本$",
    r"事前予約",
    r"観光地",
    r"web",
    r"キッズ",
    r"ウェルカム",
    r"補助便座",
    #
    r"^デートコース$",
    r"^5分$",
    r"^黄金色$",
    r"^魅力的$",
    r"^1年$",
    r"^デートコース$",
    r"^重要文化財$",
    r"^幻想的$",
    r"^ロイヤルガーデンカフェ$",
    r"^ランチメニュー$",
    r"^自家製パン$",
    r"^テイクアウト$",
    r"^青山$",
    r"^BY$",
    r"^シェフの家$",
    r"^1964年$",
    r"^メインスタジアム$",
    r"^国際大会$",
    r"^プロ野球$",
    r"^2020年東京オリンピック$",
    r"^日本$",
    r"^先端技術$",
    r"^入場無料$",
    r"^3Dプリンタ$",
    r"^神宮$",
    r"^1時間$",
    r"^ターザン$",
    r"^入場料$",
    r"^2歳$",
    r"^100円$",
    r"^300円$",
    r"^休憩所$",
    r"^レジャーシート$",
    #
    r"^言わずと知れた$",
    r"^観光スポット$",
    r"^敷地内$",
    r"^建築物$",
    r"^にも$",
    r"^重要文化財$",
    r"^観世$",
    r"^3人$",
    r"^三社$",
    #
    r"^45分$",
    r"^メッカ$",
    r"^観光客$",
    r"^5分$",
    r"^シャトルバス$",
    r"^高さ$",
    r"^634m$",
    r"^4D$",
    r"^展望台$",
    r"^天望$",
    r"^350m$",
    r"^天望$",
    r"^450m$",
    r"^天望$",
    r"^web$",
    r"^事前予約$",
    r"^天望$",
    r"^天望$",
    r"^限定グッズ$",
    r"^ココ$",
    r"^HP$",
    r"^世界自然遺産$",
    r"^80種$",
    r"^6m$",
    r"^1m$",
    r"^最大級$",
    r"^街中$",
    r"^浴衣姿$",
    r"^1月$",
    r"^5月$",
    r"^9月$",
    r"^入場無料$",
    r"^入場券$",
    r"^ちゃんこ鍋$",
    r"^東の$",
    r"^宰$",
    r"^参拝者$",
    r"^呉服商$",
    r"^2013年$",
    r"^地元住民$",
    r"^観光客$",
    r"^60種$",
    r"^お土産$",
    r"^ゲット$",
]


def extract_words(text: str):
    parsed_result = mecab.parse(text)
    splitted_rows = re.split(r"\n", parsed_result)
    separating_words = list(map(lambda row: re.split(r"\t|,", row), splitted_rows))
    separating_words = list(filter(lambda row: len(row) >= 10, separating_words))

    words = list(
        filter(
            lambda row: (row[1] == "名詞")
            or (row[1] == "動詞")
            or (row[1] == "形容詞"),
            separating_words,
        )
    )
    words = list(map(lambda row: row[0], words))

    proper_nouns = list(filter(lambda row: row[2] == "固有名詞", separating_words))
    proper_nouns = list(map(lambda row: row[0], proper_nouns))
    proper_nouns = [
        pn
        for pn in proper_nouns
        if not any(re.search(pattern, pn) for pattern in ignore_words_list)
    ]

    return {
        "words": words,
        "proper_nouns": proper_nouns,
    }


def calc_tfidf_for_proper_nouns(texts, proper_nouns):
    """
    固有名詞に限定して、テキストのリストからTF-IDF値を計算する関数。

    :param texts: テキストのリスト。
    :param proper_nouns: 固有名詞のリスト。
    :return: TF-IDF行列、単語リスト。
    """

    # カスタムトークナイザーを定義します。
    def custom_tokenizer(text):
        words = text.split()
        proper_nouns_in_text = [word for word in words if word in proper_nouns]
        return proper_nouns_in_text

    # TF-IDFベクトルライザーを初期化します。
    tfidf_vectorizer = TfidfVectorizer(
        use_idf=True, lowercase=False, tokenizer=custom_tokenizer, token_pattern=None
    )

    # 文章内の全単語（ここでは固有名詞のみ）のTfidf値を取得します。
    tfidf_matrix = tfidf_vectorizer.fit_transform(texts)

    # index 順の単語リストを取得します。
    terms = tfidf_vectorizer.get_feature_names_out()

    # 単語毎のtfidf値配列を取得します。
    tfidfs = tfidf_matrix.toarray()

    return tfidfs, terms


# 学習済みのWord2Vecモデルの読み込み
model = KeyedVectors.load("src/main/models/w2v/keyword220807.kv", mmap="r")


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
    top_5_words = sorted(similarity_scores, key=similarity_scores.get, reverse=True)[:5]

    return top_5_words


def find_similar_by_vector(words):
    # トップ5単語のベクトルを加算
    aggregate_vector = np.sum([model[word] for word in words], axis=0)

    # 加算されたベクトルに最も類似した単語を5個選択（ただし、元の単語は除く）
    similar_words = model.similar_by_vector(aggregate_vector, topn=10)

    # 元のトップ5に含まれる単語は除外
    result_words = [word for word, similarity in similar_words if word not in words][:5]

    return result_words


def find_similar_tourism_spots(
    article_title: str, top_5_words: list[str], similar_words: list[str]
):
    proper_nouns = extract_words(article_title)["proper_nouns"]
    if len(proper_nouns) == 0:
        proper_nouns = top_5_words
    proper_noun = proper_nouns[0]

    tourism_spots_df = pd.read_csv("src/main/csv/spots.csv")
    tokyo_tourism_spot_df = tourism_spots_df[tourism_spots_df["都道府県"] == "東京"]

    tokyo_tourism_spot_names = tokyo_tourism_spot_df["観光地"].tolist()
    filtered_tokyo_tourism_spot_names = [
        word for word in tokyo_tourism_spot_names if word in model.key_to_index
    ]
    filtered_tokyo_tourism_spot_names = [
        word for word in filtered_tokyo_tourism_spot_names if word != proper_noun
    ]
    filtered_tokyo_tourism_spot_names = [
        word
        for word in filtered_tokyo_tourism_spot_names
        if word not in top_5_words and word not in similar_words
    ]

    similar_spot_names = []
    for _ in range(15):
        similar_spot_name = model.most_similar_to_given(
            proper_noun,
            filtered_tokyo_tourism_spot_names,
        )
        similar_spot_names.append(similar_spot_name)
        filtered_tokyo_tourism_spot_names.remove(similar_spot_name)

    similar_spot_df = tokyo_tourism_spot_df[
        tokyo_tourism_spot_df["観光地"].isin(similar_spot_names)
    ].reset_index(drop=True)

    # 感情スコアのカラムを選択
    emotion_cols = [
        "yorokobi",
        "ikari",
        "takaburi",
        "aware",
        "suki",
        "kowa",
        "yasu",
        "iya",
        "odoroki",
        "haji",
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
                # ピアソンの積率相関係数を計算
                corr, _ = pearsonr(emotion_scores.iloc[i], emotion_scores.iloc[j])
                correlations.append(corr)

        # 相関係数の平均を計算して辞書に格納
        average_correlation_scores[similar_spot_df.loc[i, "観光地"]] = np.mean(
            correlations
        )

    # 平均相関係数が高い上位5つの観光スポットを選択
    top_5_similar_spots = sorted(
        average_correlation_scores, key=average_correlation_scores.get, reverse=True
    )[:5]

    return top_5_similar_spots


data = json.loads("".join(sys.argv[1:]))
article_title = data["article_title"]
texts = data["texts"]

texts = list(map(lambda text: extract_words(text), texts))

proper_nouns = list(set(sum(list(map(lambda text: text["proper_nouns"], texts)), [])))
texts = list(map(lambda text: " ".join(text["words"]), texts))

tfidfs, terms = calc_tfidf_for_proper_nouns(texts, proper_nouns)

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
