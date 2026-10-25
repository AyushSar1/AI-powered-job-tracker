from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

def generate_embedding(text: str):
    embedding = model.encode(
        text,
        convert_to_numpy=True
    )

    return embedding.tolist()