from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from services.pdf_service import extract_text_from_pdf
from services.embedding_service import generate_embedding
from services.chunk_service import (chunk_text, embed_chunks)
from services.faiss_service import (build_resume_index, search_index, delete_resume_index, match_requirements)
from services.rag_service import build_rag_prompt
from services.chat_service import generate_chat_response
from fastapi import HTTPException

app = FastAPI(
    title="AI Resume Service",
    version="1.0.0"
)

class ResumeRequest(BaseModel):
    filePath: str

class TextRequest(BaseModel):
    text: str
    
class IndexResumeRequest(BaseModel):
    resumeId: str
    text: str
    
class SearchRequest(BaseModel):
    resumeId: str
    text: str
    topK: int = 5
    
class DeleteIndexRequest(BaseModel):
    resumeId: str
    
class ChatMessage(BaseModel):
    role: str
    content: str

class RagRequest(BaseModel):
    resumeId: str
    question: str
    topK: int = 5
    conversationHistory: list[ChatMessage] = Field(
        default_factory=list
    )
    
class ChatRequest(BaseModel):
    resumeId: str
    message: str
    topK: int = 5
    
class MatchRequirementsRequest(BaseModel):
    resumeId: str
    requirements: list[str]

@app.get("/")
def home():
    return {
        "message": "AI Resume Service Running"
    }

@app.get("/health")
def health():
    return {
        "status": "Healthy"
    }
    
@app.post("/embed")
async def embed_text(request: TextRequest):

    embedding = generate_embedding(
        request.text
    )

    return {
        "embedding": embedding,
        "dimension": len(embedding),
        "model": "all-MiniLM-L6-v2"
    }

@app.post("/process-resume")
async def process_resume(request: ResumeRequest):
    try:
        text = extract_text_from_pdf(request.filePath)
        embedding = generate_embedding(text)

        return {
            "text": text,
            "embedding": embedding,
            "dimension": len(embedding),
            "model": "all-MiniLM-L6-v2"
        }

    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="Resume file not found"
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.post("/index-resume")
async def index_resume(request: IndexResumeRequest):
    try:
        chunks = chunk_text(request.text)

        if not chunks:
            raise HTTPException(
                status_code=400,
                detail="No text available to index"
            )

        embeddings = embed_chunks(chunks)

        build_resume_index(
            request.resumeId,
            chunks,
            embeddings
        )

        return {
            "message": "Resume indexed successfully",
            "resumeId": request.resumeId,
            "chunkCount": len(chunks)
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.post("/search-resume")
async def search_resume(request: SearchRequest):
    try:
        query_embedding = generate_embedding(
            request.text
        )

        results = search_index(
            request.resumeId,
            query_embedding,
            request.topK
        )

        return {
            "results": results
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.delete("/delete-resume-index")
async def delete_resume_index_route(
    request: DeleteIndexRequest
):
    try:
        delete_resume_index(
            request.resumeId
        )

        return {
            "message": "Resume index deleted successfully",
            "resumeId": request.resumeId
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
        
@app.post("/rag")
async def rag(request: RagRequest):
    try:
        question = request.question.strip()

        if not question:
            raise HTTPException(
                status_code=400,
                detail="Question cannot be empty"
            )

        query_embedding = generate_embedding(
            question
        )

        retrieved_chunks = search_index(
            request.resumeId,
            query_embedding,
            request.topK
        )

        history = [
            {
                "role": message.role,
                "content": message.content
            }
            for message in request.conversationHistory
        ]

        prompt = build_rag_prompt(
            question,
            retrieved_chunks,
            history
        )

        return {
            "prompt": prompt,
            "chunks": retrieved_chunks
        }

    except HTTPException:
        raise

    except Exception as e:
        print(
            "RAG error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to build RAG prompt"
        )
                
@app.post("/chat")
async def chat(request: ChatRequest):

    if not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty"
        )

    try:
        query_embedding = generate_embedding(
            request.message
        )
        
        retrieved_chunks = search_index(
            request.resumeId,
            query_embedding,
            request.topK
        )

        prompt = build_rag_prompt(
            request.message,
            retrieved_chunks
        )

        response_generator = generate_chat_response(
            prompt
        )

        return StreamingResponse(
            response_generator,
            media_type="text/plain"
        )

    except Exception as e:
        print("Chat error:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Unable to generate AI response"
        )
        
class MatchRequirementsRequest(BaseModel):
    resumeId: str
    requirements: str


@app.post("/match-requirements")
async def match_resume_requirements(
    request: MatchRequirementsRequest
):
    try:
        requirements = request.requirements.strip()

        if not requirements:
            raise HTTPException(
                status_code=400,
                detail="No requirements provided"
            )

        result = match_requirements(
            request.resumeId,
            requirements
        )

        return {
            "resumeId": request.resumeId,
            "requirements": [result]
        }

    except HTTPException:
        raise

    except Exception as e:
        print(
            "Requirement matching error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to match requirements"
        )