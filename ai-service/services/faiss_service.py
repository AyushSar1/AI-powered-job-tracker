import os
import json
import faiss
import numpy as np
from services.embedding_service import generate_embedding


EMBEDDING_DIMENSION = 384

FAISS_BASE_PATH = "data/faiss"

def create_index():

    return faiss.IndexFlatIP(
        EMBEDDING_DIMENSION
    )
    
def add_embeddings(index, embeddings):

    vectors = np.array(
        embeddings,
        dtype=np.float32
    )

    faiss.normalize_L2(vectors)
    index.add(vectors)
    
    return index

def get_resume_directory(resume_id):
    return os.path.join(FAISS_BASE_PATH, str(resume_id))
    
def save_index(index, resume_id):
    resume_directory = get_resume_directory(resume_id)

    os.makedirs(resume_directory, exist_ok=True)

    index_path = os.path.join(
        resume_directory,
        "index.faiss"
    )

    faiss.write_index(index, index_path)
    
def save_chunks(chunks, resume_id):
    resume_directory = get_resume_directory(resume_id)

    os.makedirs(resume_directory, exist_ok=True)

    chunks_path = os.path.join(
        resume_directory,
        "chunks.json"
    )

    with open(chunks_path, "w", encoding="utf-8") as file:
        json.dump(
            chunks,
            file,
            ensure_ascii=False,
            indent=2
        )
        
def load_index(resume_id):
    resume_directory = get_resume_directory(resume_id)

    index_path = os.path.join(
        resume_directory,
        "index.faiss"
    )

    if not os.path.exists(index_path):
        return None

    return faiss.read_index(index_path)
    
def load_chunks(resume_id):
    resume_directory = get_resume_directory(resume_id)

    chunks_path = os.path.join(
        resume_directory,
        "chunks.json"
    )

    if not os.path.exists(chunks_path):
        return []

    with open(chunks_path, "r", encoding="utf-8") as file:
        return json.load(file)
    
def search_index(resume_id, embedding, top_k=5):
    index = load_index(resume_id)

    if index is None:
        return []

    chunks = load_chunks(resume_id)

    query = np.array(
        [embedding],
        dtype=np.float32
    )

    faiss.normalize_L2(query)

    top_k = min(top_k, index.ntotal)

    if top_k == 0:
        return []

    distances, indices = index.search(
        query,
        top_k
    )

    results = []

    for distance, index_id in zip(
        distances[0],
        indices[0]
    ):
        if index_id < 0:
            continue

        if index_id >= len(chunks):
            continue

        results.append({
            "chunkId": int(index_id),
            "text": chunks[index_id],
            "similarity": float(distance)
        })

    return results

def match_requirements(resume_id, requirements):
    
    requirements = requirements.strip()

    if not requirements:
        return None

    embedding = generate_embedding(
        requirements
    )

    matches = search_index(
        resume_id,
        embedding,
        top_k=1
    )

    best_match = (
        matches[0]
        if matches
        else None
    )

    return {
        "requirement": requirements,

        "bestSimilarity": (
            best_match["similarity"]
            if best_match
            else 0
        ),

        "evidence": (
            best_match["text"]
            if best_match
            else None
        ),

        "chunkId": (
            best_match["chunkId"]
            if best_match
            else None
        )
    }

def build_resume_index(resume_id, chunks, embeddings):
    if len(chunks) != len(embeddings):
        raise ValueError(
            "Number of chunks and embeddings must be the same"
        )

    index = create_index()

    add_embeddings(
        index,
        embeddings
    )

    save_index(
        index,
        resume_id
    )

    save_chunks(
        chunks,
        resume_id
    )
    
def delete_resume_index(resume_id):
    import shutil

    resume_directory = get_resume_directory(resume_id)

    if os.path.exists(resume_directory):
        shutil.rmtree(resume_directory)