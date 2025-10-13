# Load model directly - DeepSeek con GPU optimizado
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

print(f"🔥 CUDA disponible: {torch.cuda.is_available()}")

tokenizer = AutoTokenizer.from_pretrained("deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B")
model = AutoModelForCausalLM.from_pretrained(
    "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
    dtype=torch.float16,  # Usar half precision para ahorrar VRAM
    device_map="auto",  # Mapeo automático a GPU
    trust_remote_code=True
)

messages = [
    {"role": "system", "content": "You are a useful medical assistant that helps with medical advice. Based on the user's symptoms, provide appropriate medical suggestions. Always answer in spanish."},
    {"role": "user", "content": "Tengo dolor de cabeza, el cuerpo me duele mucho y también estoy congestionado. Me cuesta respirar por la nariz. ¿Qué puedo tomar para sentirme mejor?"},
]


inputs = tokenizer.apply_chat_template(
	messages,
	add_generation_prompt=True,
	tokenize=True,
	return_dict=True,
	return_tensors="pt",
).to(model.device)

outputs = model.generate(**inputs, max_new_tokens=150)
print(tokenizer.decode(outputs[0][inputs["input_ids"].shape[-1]:]))