from google import genai

# Inicializa el cliente
client = genai.Client()

# Creamos los mensajes como diccionarios
messages = [
    {"author": "system", "content": "Eres un asistente experto en biología que explica conceptos de manera sencilla."},
    {"author": "user", "content": "Explícame cómo funciona la fotosíntesis y dame un ejemplo práctico."}
]

# Llamada al modelo de chat
response = client.chat.completions.create(
    model="gemini-2.5-chat",
    messages=messages
)

# La respuesta se encuentra en response.choices[0].content
print(response.choices[0].content)
