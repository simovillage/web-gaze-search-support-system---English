import json
import sys

import torch
from sklearn.metrics.pairwise import cosine_similarity
from transformers import BertJapaneseTokenizer, BertModel


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


MODEL_NAME = "sonoisa/sentence-bert-base-ja-mean-tokens-v2"  # <- v2です。
model = SentenceBertJapanese(MODEL_NAME)


def calc_sentence_bert_similarity(target: str, sentences: list[str]):
    sentences_list = [target] + sentences
    embeddings = model.encode(sentences_list, batch_size=8)

    similarity_matrix = cosine_similarity(embeddings)
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
