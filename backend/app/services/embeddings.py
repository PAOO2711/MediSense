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
            [doc],  # from_documents espera una lista
            self.embeddings,
            client = self.supabase,
            table_name = "documents",
            query_name = "match_documents",
        )

    def retrieve_similar_cases(self, query: str, top_k: int = 5, patient_id: int = None) -> list[dict]:
        try:
            # Generar embedding de la consulta
            query_embedding = self.embeddings.embed_query(query)
            
            # Parámetros para la función RPC
            rpc_params = {
                "query_embedding": query_embedding,
                "match_count": top_k,
            }
            
            # Agregar patient_id solo si se proporciona
            if patient_id is not None:
                rpc_params["patient_id"] = patient_id
            
            # Llamar a la función RPC de Supabase
            res = self.supabase.rpc("match_documents", rpc_params).execute()
            
            # Formatear resultados
            results = [
                {
                    "content": row["content"],
                    "metadata": row["metadata"],
                    "similarity": row.get("similarity", 0),
                }
                for row in res.data
            ]
            
            return results
            
        except Exception as e:
            # Si hay error (ej. tabla vacía o función no existe), retornar lista vacía
            return []


