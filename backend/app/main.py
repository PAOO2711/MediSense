from fastapi import FastAPI, WebSocket
from faster_whisper import WhisperModel
import numpy as np
import io
import soundfile as sf

from faster_whisper import WhisperModel

# Fuerza la descarga a la carpeta local `./models/whisper-small`
model = WhisperModel(
    "openai/whisper-small",
    device="cuda",
    compute_type="float16",
    download_root="./models"  # guarda el modelo aquí
)

app = FastAPI()

model = WhisperModel("openai/whisper-small", device="cuda")

@app.websocket("/ws/transcribe")
async def websocket_transcribe(websocket: WebSocket):
    await websocket.accept()
    buffer_audio = b""

    try:
        while True:
            # Recibir chunk de audio en bytes desde frontend
            chunk = await websocket.receive_bytes()
            buffer_audio += chunk

            # Convertir bytes a numpy array (asumiendo formato WAV)
            try:
                audio_data, samplerate = sf.read(io.BytesIO(buffer_audio))
            except RuntimeError:
                continue
        
            # Transcripción parcial
            segments, info = model.transcribe(audio_data, language="es", beam_size=5)
            texto_parcial = " ".join([s.text for s in segments])

            # Enviar texto parcial al frontend
            await websocket.send_text(texto_parcial)

            buffer_audio = b""  # Limpiar buffer después de procesar

    except Exception as e:
        print("Conexión cerrada:", e)
        await websocket.close()