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
        # self.model.to(device)

    @torch.no_grad()
    def encode(self, sentences, batch_size=8):
        all_embeddings = []
        iterator = range(0, len(sentences), batch_size)
        for batch_idx in iterator:
            batch = sentences[batch_idx : batch_idx + batch_size]

            # モデルに入力をエンコードして埋め込みを取得する
            sentence_embeddings = self.model.encode(batch, show_progress_bar=False)

            all_embeddings.extend(sentence_embeddings)

        # return torch.stack(all_embeddings).numpy()
        return torch.stack(all_embeddings)


MODEL_NAME = "sentence-transformers/all-MiniLM-L5-v2"
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

# sentence-BERTを日本語で使いたい場合は下のモデルを使う
# from transformers import BertJapaneseTokenizer, BertModel

"""

# Sentence-BERT の日本語モデルを使うためのクラス
class SentenceBertJapanese:
    def __init__(self, model_name_or_path, device=None):
        self.tokenizer = BertJapaneseTokenizer.from_pretrained(model_name_or_path)
        self.model = BertModel.from_pretrained(model_name_or_path)
        self.model.eval()

        if device is None:
            device = "cuda" if torch.cuda.is_available() else "cpu"
        self.device = torch.device(device)
        self.model.to(device)

    def _mean_pooling(self, model_output, attention_mask):
        token_embeddings = model_output[
            0
        ]  # First element of model_output contains all token embeddings
        input_mask_expanded = (
            attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
        )
        return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(
            input_mask_expanded.sum(1), min=1e-9
        )

    @torch.no_grad()
    def encode(self, sentences, batch_size=8):
        all_embeddings = []
        iterator = range(0, len(sentences), batch_size)
        for batch_idx in iterator:
            batch = sentences[batch_idx : batch_idx + batch_size]

            encoded_input = self.tokenizer.batch_encode_plus(
                batch, padding="longest", truncation=True, return_tensors="pt"
            ).to(self.device)
            model_output = self.model(**encoded_input)
            sentence_embeddings = self._mean_pooling(
                model_output, encoded_input["attention_mask"]
            ).to("cpu")

            all_embeddings.extend(sentence_embeddings)

        # return torch.stack(all_embeddings).numpy()
        return torch.stack(all_embeddings)
"""
