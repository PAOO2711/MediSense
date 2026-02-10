from dotenv import load_dotenv
import os
from pathlib import Path

# Cargar las variables de entorno desde el archivo .env
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

from langchain_community.vectorstores import SupabaseVectorStore
from supabase.client import Client, create_client
from langchain_core.documents import Document
from langchain_huggingface.embeddings import HuggingFaceEmbeddings

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

class EmbeddingsService:

    def __init__(self):
        self.vector_store = None
        self.embeddings = HuggingFaceEmbeddings(model_name="intfloat/multilingual-e5-base")
        self.supabase :Client = create_client(supabase_url, supabase_key)

    def create_embeddings(self, doc: Document):
        self.vector_store = SupabaseVectorStore.from_documents(
            doc,
            self.embeddings,
            client = self.supabase,
            table_name = "documents",
            query_name = "match_documents",
        )

    def retrieve_similar_cases(self, query: str, top_k: int = 5, patient_id: int = None) -> list[dict]:
        self.vector_store = SupabaseVectorStore(
            embedding=self.embeddings,
            client=self.supabase,
            table_name="documents",
            query_name="match_documents",
        )
        
        if not self.vector_store:
            raise ValueError("Vector store no inicializado. Crea embeddings primero.")
        
        results = self.vector_store.similarity_search(query, k=top_k, patient_id=patient_id)
        return [ {"content": doc.page_content, "metadata": doc.metadata} for doc in results ]


