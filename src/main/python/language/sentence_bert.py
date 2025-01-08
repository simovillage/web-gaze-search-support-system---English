import json
import sys

import torch
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# sentence-BERT英語モデルを使うためのクラス


class SentenceBertEnglish:
    def __init__(self, model_name_or_path, device=None):
        # sentence Transformerを使用してモデルをロードする
        self.model = SentenceTransformer(model_name_or_path)

        # デバイスの設定
        if device is None:
            device = "cuda" if torch.cuda.is_available() else "cpu"
        self.device = torch.device(device)

        # モデルの移動は不要（今のところ）
        self.model.to(device)

    @torch.no_grad()
    def encode(self, sentences, batch_size=8):
        all_embeddings = []
        iterator = range(0, len(sentences), batch_size)
        for batch_idx in iterator:
            batch = sentences[batch_idx : batch_idx + batch_size]

            # モデルに入力をエンコードして埋め込みを取得する
            sentence_embeddings = self.model.encode(batch, show_progress_bar=False)

            # NumPy配列をTensorに変換
            sentence_embeddings = torch.tensor(sentence_embeddings)

            all_embeddings.extend(sentence_embeddings)

        # Tensorのリストをスタックして返す
        return torch.stack(all_embeddings)

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
model = SentenceBertEnglish(MODEL_NAME)


# 文書間類似度を計算する関数

def calc_sentence_bert_similarity(target: str, sentences: list[str]):
    # ターゲットと比較する文章をセットにする
    sentences_list = [target] + sentences
    # 文章をエンコードしてベクトル化する
    embeddings = model.encode(sentences_list, batch_size=8)

    # コサイン類似度を計算する
    similarity_matrix = cosine_similarity(embeddings)
    # コサイン距離に変換する
    distance_matrix = 1 - similarity_matrix

    # sentences と類似度スコアをセットにする
    sentence_similarity_pairs = [
        {"sentence": sentence, "similarity": float(similarity)}
        for sentence, similarity in zip(sentences, distance_matrix[0][1:])
    ]

    return sentence_similarity_pairs


data = json.loads(sys.argv[1])
target = data["target"]
summaries = data["summaries"]

result = calc_sentence_bert_similarity(target, summaries)
print(json.dumps(result))
