from services.embedding_service import generate_embedding

def chunk_text(text, chunk_size=800, overlap=100):
    if not text:
        return []

    chunks = []

    start = 0
    text_length = len(text)

    while start < text_length:

        end = start + chunk_size

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start += chunk_size - overlap

    return chunks

def embed_chunks(chunks):

    embeddings = []

    for chunk in chunks:

        embedding = generate_embedding(chunk)

        embeddings.append(embedding)

    return embeddings