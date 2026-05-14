from pydantic import BaseModel, Field
from typing import Literal
from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import os

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# Obtener la API key de Gemini desde las variables de entorno
google_api_key = os.getenv("GOOGLE_API_KEY")

if not google_api_key:
    raise ValueError("❌ Error: GOOGLE_API_KEY no encontrada en las variables de entorno. Asegúrate de definirla en el archivo .env")

model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=google_api_key  # Usar la API key desde variables de entorno
)

class ProductReview(BaseModel):
    """Analysis of a product review."""
    rating: int | None = Field(description="The rating of the product", ge=1, le=5)
    sentiment: Literal["positive", "negative"] = Field(description="The sentiment of the review")
    key_points: list[str] = Field(description="The key points of the review. Lowercase, 1-3 words each.")

# Para este ejemplo no necesitamos tools adicionales

agent = create_agent(
    model=model,
    response_format=ProductReview
)

result = agent.invoke({
    "messages": [{"role": "user", "content": "Analyze this review: 'Great product: 5 out of 5 stars. Fast shipping, but expensive'"}]
})


print(result["structured_response"].rating)
# ProductReview(rating=5, sentiment='positive', key_points=['fast shipping', 'expensive'])