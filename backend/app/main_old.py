# backend/main_full_recording.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import numpy as np
import ffmpeg
import io
import logging
import tempfile
import os
from pathlib import Path

# Configurar logging
logging.basicConfig(level=logging.INFO)

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar modelo
model = None

def load_whisper_model():
    """Cargar modelo Whisper de forma segura"""
    global model
    try:
        logging.info("🔄 Cargando modelo Whisper...")
        # Usar modelo small para mejor precisión y robustez
        model = WhisperModel("small", device="cpu", compute_type="int8")
        logging.info("✅ Modelo Whisper 'small' cargado exitosamente")
        return True
    except Exception as e:
        logging.error(f"❌ Error cargando modelo: {e}")
        return False

# Cargar modelo al iniciar
model_loaded = load_whisper_model()

def convert_webm_to_wav(webm_data: bytes) -> str:
    """Convertir datos WebM a archivo WAV temporal"""
    try:
        # Crear archivo temporal para WebM
        with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as webm_file:
            webm_file.write(webm_data)
            webm_path = webm_file.name
        
        # Crear archivo temporal para WAV
        wav_path = tempfile.mktemp(suffix='.wav')
        
        # Convertir WebM a WAV usando ffmpeg
        (
            ffmpeg
            .input(webm_path)
            .output(wav_path, acodec='pcm_s16le', ac=1, ar='16000')
            .overwrite_output()
            .run(quiet=True)
        )
        
        # Limpiar archivo WebM temporal
        os.unlink(webm_path)
        
        logging.info(f"✅ Audio convertido a WAV: {wav_path}")
        return wav_path
        
    except Exception as e:
        logging.error(f"❌ Error convirtiendo audio: {e}")
        # Limpiar archivos en caso de error
        if 'webm_path' in locals() and os.path.exists(webm_path):
            os.unlink(webm_path)
        if 'wav_path' in locals() and os.path.exists(wav_path):
            os.unlink(wav_path)
        return None

# WebSocket endpoints removidos - usando solo HTTP POST para simplicidad

@app.post("/transcribe_file")
async def transcribe_uploaded_file(file: UploadFile = File(...)):
    """Endpoint para transcribir archivos de audio subidos"""
    
    if not model:
        return {"error": "Modelo no disponible"}
    
    try:
        # Leer el archivo subido
        audio_data = await file.read()
        logging.info(f"📁 Archivo recibido: {file.filename}, {len(audio_data)} bytes")
        
        # Convertir a WAV si es necesario
        if file.filename.endswith('.webm') or file.content_type == 'audio/webm':
            wav_path = convert_webm_to_wav(audio_data)
        else:
            # Guardar archivo temporal para otros formatos
            with tempfile.NamedTemporaryFile(suffix=Path(file.filename).suffix, delete=False) as temp_file:
                temp_file.write(audio_data)
                wav_path = temp_file.name
        
        if not wav_path:
            return {"error": "Error procesando archivo de audio"}
        
        # Transcribir
        segments, info = model.transcribe(
            wav_path,
            language="es",
            beam_size=5,
            temperature=0.2,
            word_timestamps=True,
            vad_filter=True
        )
        
        # Procesar resultado
        full_transcription = ""
        
        for segment in segments:
            segment_text = segment.text.strip()
            full_transcription += segment_text + " "
        
        # Limpiar archivo temporal
        os.unlink(wav_path)
        
        return {
            "success": True,
            "full_text": full_transcription.strip(),
            "duration": round(info.duration, 2),
            "language": info.language,
            "language_probability": round(info.language_probability, 2),
            "filename": file.filename
        }
        
    except Exception as e:
        logging.error(f"❌ Error transcribiendo archivo: {e}")
        return {"error": str(e)}

@app.get("/")
async def root():
    return {
        "message": "🎙️ Servidor de transcripción completa activo",
        "modelo_cargado": model is not None,
        "status": "✅ Funcionando" if model else "⚠️ Sin modelo",
        "endpoint": "/transcribe_file",
        "método": "POST",
        "descripción": "Sube un archivo de audio para transcribir"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)