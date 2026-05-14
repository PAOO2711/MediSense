from langchain_huggingface import HuggingFacePipeline
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from langchain_core.prompts import ChatPromptTemplate
import torch
import time
import requests
import tempfile
import os

# Función para obtener transcripción del servidor
def get_transcription_from_audio(audio_file_path=None, transcription_text=None):
    """
    Obtiene transcripción de audio o usa texto directo
    """
    if transcription_text:
        # Usar texto directo (para pruebas)
        return transcription_text
    
    if audio_file_path and os.path.exists(audio_file_path):
        # Enviar archivo al servidor de transcripción
        try:
            with open(audio_file_path, 'rb') as audio_file:
                files = {'file': audio_file}
                response = requests.post('http://localhost:8000/transcribe_file', files=files)
                
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    return result.get('full_text', '')
                else:
                    print(f"❌ Error en transcripción: {result.get('error')}")
                    return None
            else:
                print(f"❌ Error del servidor: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Error conectando con servidor: {e}")
            return None
    
    return None

print("🔥 Cargando modelo DeepSeek...")

# Cargar modelo DeepSeek
tokenizer = AutoTokenizer.from_pretrained("deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B")
model = AutoModelForCausalLM.from_pretrained(
    "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
    dtype=torch.float16,  # Usar half precision para ahorrar VRAM
    device_map="auto",  # Mapeo automático a GPU
    trust_remote_code=True,
)

# Crear pipeline de generación
pipe = pipeline(
    "text-generation", 
    model=model, 
    tokenizer=tokenizer, 
    max_new_tokens=256,  # Aumentamos significativamente los tokens
    temperature=0.7,
    top_p=0.9,
    do_sample=True,
    repetition_penalty=1.1
)

# Crear HuggingFace pipeline para LangChain
hf = HuggingFacePipeline(pipeline=pipe)

# Crear un chat prompt template con system y user separados
chat_template = ChatPromptTemplate.from_messages([
    ("system", "{system_prompt}"),
    ("user", "{user_prompt}")
])

# Definir el system prompt para consultas médicas
system_prompt = """Eres un asistente médico experto que responde preguntas sobre medicina y salud de manera clara y precisa. 
Analiza la consulta del paciente y proporciona información médica útil, siempre recomendando consultar con un profesional cuando sea necesario."""

# Obtener transcripción de audio
print("🎙️ Obteniendo transcripción...")

# Opción 1: Usar texto de prueba (comentar para usar audio real)
transcribed_text = "Doctor, últimamente he tenido dolores de cabeza frecuentes y mareos. ¿Podría ser algo serio?"

# Opción 2: Usar archivo de audio (descomentar y proporcionar ruta)
# transcribed_text = get_transcription_from_audio(audio_file_path="path/to/audio.wav")

# Opción 3: Usar transcripción directa
# transcribed_text = get_transcription_from_audio(transcription_text="Tu texto aquí")

if transcribed_text:
    user_prompt = transcribed_text
    print(f"✅ Transcripción obtenida: {user_prompt[:100]}...")
else:
    # Fallback si no hay transcripción
    user_prompt = "Explícame qué síntomas debo vigilar para cuidar mi salud."
    print("⚠️ Usando prompt predeterminado")

# Crear la cadena
chain = chat_template | hf

# Mostrar consulta médica
print("\n" + "="*60)
print("🏥 CONSULTA MÉDICA VIRTUAL")
print("="*60)
print(f"👤 Paciente: {user_prompt}")
print("\n🩺 Doctor IA:", end="", flush=True)

# Generar respuesta
result = chain.invoke({
    "system_prompt": system_prompt,
    "user_prompt": user_prompt
})

# Mostrar respuesta con efecto de escritura
if hasattr(result, 'split'):
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

print("\n\n" + "="*60)
print("⚠️  AVISO: Esta es una consulta informativa.")
print("Siempre consulta con un médico profesional para diagnósticos reales.")
print("="*60)