from langchain_huggingface import HuggingFacePipeline
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from langchain_core.prompts import ChatPromptTemplate
import torch
import time

print("🔥 Cargando modelo DeepSeek...")

model_id = "gpt2"
tokenizer = AutoTokenizer.from_pretrained("deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B")
model = AutoModelForCausalLM.from_pretrained(
    "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
    dtype=torch.float16,  # Usar half precision para ahorrar VRAM
    device_map="auto",  # Mapeo automático a GPU
    trust_remote_code=True,
)
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
hf = HuggingFacePipeline(pipeline=pipe)

# Crear un chat prompt template con system y user separados
chat_template = ChatPromptTemplate.from_messages([
    ("system", "{system_prompt}"),
    ("user", "{user_prompt}")
])

# Definir los prompts
system_prompt = """Eres un asistente médico experto que explica conceptos de medicina y biología de manera clara y precisa. 
Siempre proporciona información técnica pero accesible, estructurada paso a paso cuando sea apropiado."""

user_prompt = "Explícame qué es la electroencefalografía y cómo se utiliza en el diagnóstico médico."

# Crear la cadena
chain = chat_template | hf

# Invocar la cadena con los prompts
print("🤖 Respuesta completa:")
result = chain.invoke({
    "system_prompt": system_prompt,
    "user_prompt": user_prompt
})
print(result)

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