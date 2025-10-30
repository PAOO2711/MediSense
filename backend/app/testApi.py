import os
from dotenv import load_dotenv
from langchain_huggingface import HuggingFacePipeline
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

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

# Crear un chat prompt template con system y user separados
chat_template = ChatPromptTemplate.from_messages([
    ("system", "{system_prompt}"),
    ("user", "{user_prompt}")
])

# Función para leer archivo de transcripción
def read_transcription_file(file_path):
    """Lee el contenido de un archivo de transcripción"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read().strip()
        return content
    except FileNotFoundError:
        print(f"❌ Error: No se encontró el archivo {file_path}")
        return None
    except Exception as e:
        print(f"❌ Error leyendo archivo: {e}")
        return None

# Definir los prompts
system_prompt = """Eres un asistente médico experto que analiza consultas y síntomas de pacientes. 
Proporciona respuestas profesionales, empáticas y útiles basadas en la información médica que recibes.
Si el paciente menciona síntomas, sugiere posibles causas y recomienda consultar a un profesional de la salud.
Si el paciente simplemente saluda o no proporciona información médica, responde de manera amable y profesional, invitándolo a compartir sus síntomas o preguntas médicas.
Responde únicamente a lo que diga el usuario, sin agregar información adicional no solicitada.
Sé lo más claro y conciso posible en tus respuestas."""

# Leer el contenido de la transcripción
transcription_file = "/home/pedri/medisense/transcriptions/transcripcion_2025-10-13T11-26-29.txt"
user_prompt = read_transcription_file(transcription_file)

# Si no se pudo leer el archivo, usar un prompt por defecto
if user_prompt is None:
    user_prompt = "Hola, ¿cómo estás? Tengo algunas preguntas sobre salud."
    print("⚠️  Usando prompt por defecto")

# Crear la cadena
chain = chat_template | model

# Invocar la cadena con los prompts
print("🤖 Respuesta completa:")
result = chain.invoke({
    "system_prompt": system_prompt,
    "user_prompt": user_prompt
})

print(result.content)

""" print("\n" + "="*50)

print("🔄 Streaming (simulado):")
print(f"System: {system_prompt}")
print(f"User: {user_prompt}")

print("Assistant:", end="", flush=True)

# El streaming en HuggingFacePipeline no funciona igual, así que mostramos la respuesta completa
# pero podemos simular el efecto palabra por palabra
import time
if hasattr(result, 'split'):
    # Extraer solo la parte de la respuesta del asistente
    text = str(result)
    
    # Dividir por oraciones para mejor formato
    sentences = text.replace('. ', '.\n').replace('? ', '?\n').replace('! ', '!\n')
    
    # Imprimir carácter por carácter para un efecto más natural
    for char in sentences:
        print(char, end="", flush=True)
        if char in '.?!':
            time.sleep(0.3)  # Pausa más larga en finales de oración
        elif char == '\n':
            time.sleep(0.2)  # Pausa en saltos de línea
        elif char == ' ':
            time.sleep(0.05)  # Pausa corta en espacios
        else:
            time.sleep(0.02)  # Pausa muy corta entre caracteres
    
    print("\n") """