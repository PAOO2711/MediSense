from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# Nombre del modelo
model_name = "mistralai/Mistral-7B-Instruct-v0.3"

# Cargar el tokenizer
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Cargar el modelo con cuantización 4 bits
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    device_map="auto",          # Detecta automáticamente la GPU disponible
    torch_dtype=torch.float16,  # Usa precisión media (más eficiente)
    load_in_4bit=True,          # Cuantización a 4 bits
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4"   # Cuantización NormalFloat4 (mejor calidad)
)

# Prompt de ejemplo
prompt = (
    "Transcripción médica:\n"
    "El paciente presenta fiebre, tos seca y dolor muscular desde hace 3 días.\n\n"
    "Sugerencias médicas para el médico:"
)

# Tokenizar entrada
inputs = tokenizer(prompt, return_tensors="pt").to("cuda")

# Generar texto
outputs = model.generate(
    **inputs,
    max_new_tokens=200,
    temperature=0.7,
    top_p=0.9,
    repetition_penalty=1.1
)

# Decodificar salida
response = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(response)
