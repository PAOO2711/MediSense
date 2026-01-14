# 🔄 Guía de Migración: De main.py a Arquitectura Modular

## 📋 Resumen de Cambios

Hemos refactorizado el código monolítico de `main.py` en una arquitectura modular con separación de responsabilidades.

## 🆚 Comparación: Antes vs Después

### ❌ Antes (main.py - 153 líneas)

```python
# backend/main.py
from fastapi import FastAPI, WebSocket, UploadFile, File
from faster_whisper import WhisperModel
import numpy as np
import ffmpeg
# ... más imports

app = FastAPI()

# Variables globales
model = None

# Funciones mezcladas con lógica de negocio
def load_whisper_model():
    # ...

def convert_webm_to_wav(webm_data: bytes) -> str:
    # ...

# Endpoints con lógica embebida
@app.post("/transcribe_file")
async def transcribe_uploaded_file(file: UploadFile = File(...)):
    # Mucha lógica aquí...
    # 50+ líneas de código
    # ...
```

**Problemas:**
- ❌ Todo en un archivo = difícil de mantener
- ❌ Funciones mezcladas con endpoints
- ❌ Sin separación de responsabilidades
- ❌ Difícil de testear independientemente
- ❌ No hay análisis con IA
- ❌ Configuración hardcodeada

---

### ✅ Después (Arquitectura Modular)

```python
# backend/app/main_refactored.py
from fastapi import FastAPI, UploadFile, File
from models.schemas import TranscriptionResponse, MedicalAnalysis
from services.transcription import transcription_service
from services.ai_analysis import medical_analysis_service

app = FastAPI(title="MediSense API", version="2.0.0")

@app.post("/transcribe_and_analyze")
async def transcribe_and_analyze(file: UploadFile = File(...)):
    # Delegar a servicios especializados
    audio_data = await file.read()
    transcription = transcription_service.transcribe_file(audio_data, file.filename)
    analysis = medical_analysis_service.analyze_transcription(transcription["full_text"])
    
    return {
        "transcription": transcription,
        "analysis": analysis.dict()
    }
```

**Ventajas:**
- ✅ Código organizado y modular
- ✅ Fácil de mantener y extender
- ✅ Testeable independientemente
- ✅ Análisis con IA incluido
- ✅ Configuración centralizada
- ✅ Reutilizable

---

## 📦 Mapeo de Funcionalidades

### 1. Transcripción de Audio

**Antes:**
```python
# En main.py (líneas 40-100)
def convert_webm_to_wav(webm_data: bytes) -> str:
    # ... lógica de conversión

@app.post("/transcribe_file")
async def transcribe_uploaded_file(file: UploadFile = File(...)):
    # ... lógica de transcripción
```

**Después:**
```python
# En app/utils/audio.py
def convert_webm_to_wav(webm_data: bytes) -> str:
    # ... lógica de conversión (reutilizable)

# En app/services/transcription.py
class TranscriptionService:
    def transcribe_file(self, audio_data: bytes, filename: str) -> Dict:
        # ... lógica de transcripción (encapsulada)

# En app/main_refactored.py
@app.post("/transcribe_file")
async def transcribe_uploaded_file(file: UploadFile = File(...)):
    audio_data = await file.read()
    return transcription_service.transcribe_file(audio_data, file.filename)
```

---

### 2. Nueva Funcionalidad: Análisis con IA

**Antes:**
- ❌ No existía

**Después:**
```python
# En app/services/ai_analysis.py
class MedicalAnalysisService:
    def analyze_transcription(self, transcription: str) -> MedicalAnalysis:
        # LangChain + Groq para analizar
        # Retorna síntomas, sugerencias, etc.

# En app/main_refactored.py
@app.post("/analyze")
async def analyze_transcription(request: AnalysisRequest):
    return medical_analysis_service.analyze_transcription(
        request.transcription, 
        request.patient_context
    )
```

---

### 3. Configuración

**Antes:**
```python
# Hardcodeado en el código
model = WhisperModel("small", device="cpu", compute_type="int8")
# ...
segments, info = model.transcribe(
    wav_path,
    language="es",
    beam_size=5,
    # ...
)
```

**Después:**
```python
# En app/config/settings.py
class Settings:
    WHISPER_MODEL = "small"
    WHISPER_DEVICE = "cpu"
    TRANSCRIPTION_LANGUAGE = "es"
    TRANSCRIPTION_BEAM_SIZE = 5
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# En los servicios
model = WhisperModel(
    settings.WHISPER_MODEL,
    device=settings.WHISPER_DEVICE,
    compute_type=settings.WHISPER_COMPUTE_TYPE
)
```

---

## 🚀 Pasos para Migrar

### Opción 1: Reemplazo Directo (Recomendado para Nuevos Proyectos)

```bash
cd /home/pedri/medisense/backend/app

# 1. Respaldar el antiguo
mv main.py main_old_backup.py

# 2. Renombrar el nuevo
mv main_refactored.py main.py

# 3. Reiniciar servidor
python3 main.py
```

### Opción 2: Coexistencia (Para Migración Gradual)

Mantener ambas versiones corriendo en diferentes puertos:

```bash
# Terminal 1: Versión antigua (puerto 8000)
python3 main_old.py

# Terminal 2: Versión nueva (puerto 8001)
uvicorn main_refactored:app --port 8001 --reload
```

Luego migrar el frontend gradualmente de un endpoint a otro.

---

## 🧪 Testing de la Migración

### 1. Verificar que el antiguo funciona
```bash
curl -X POST "http://localhost:8000/transcribe_file" \
  -F "file=@test_audio.webm"
```

### 2. Verificar que el nuevo funciona
```bash
curl -X POST "http://localhost:8001/transcribe_file" \
  -F "file=@test_audio.webm"
```

### 3. Comparar respuestas
Ambos deberían retornar la misma transcripción.

### 4. Probar nueva funcionalidad
```bash
curl -X POST "http://localhost:8001/transcribe_and_analyze" \
  -F "file=@test_audio.webm"
```

---

## 📊 Diferencias en Respuestas

### Endpoint: `/transcribe_file`

Ambas versiones retornan el mismo formato:
```json
{
  "success": true,
  "full_text": "Transcripción aquí...",
  "duration": 45.2,
  "language": "es",
  "language_probability": 0.98,
  "filename": "audio.webm"
}
```

### Nuevo Endpoint: `/transcribe_and_analyze`

Solo disponible en la nueva versión:
```json
{
  "transcription": { /* ... */ },
  "analysis": {
    "resumen": "...",
    "sintomas_identificados": [...],
    "sugerencias": [...],
    "nivel_urgencia": "Medio"
  }
}
```

---

## ⚠️ Consideraciones Importantes

### Compatibilidad Backward
- ✅ El endpoint `/transcribe_file` funciona igual
- ✅ No hay breaking changes
- ✅ Frontend antiguo sigue funcionando

### Nuevas Dependencias
```bash
# Asegurarse de instalar
pip3 install langchain-groq
```

### Variables de Entorno
```bash
# Agregar al .env
GROQ_API_KEY=tu_api_key_aqui
```

---

## 🎯 Checklist de Migración

- [ ] Instalar `langchain-groq`
- [ ] Crear archivo `.env` con `GROQ_API_KEY`
- [ ] Probar endpoints de la versión nueva
- [ ] Actualizar frontend para usar nuevo endpoint (opcional)
- [ ] Actualizar schema de DB para guardar análisis (opcional)
- [ ] Documentar cambios para el equipo
- [ ] Backup de la versión antigua
- [ ] Reemplazar main.py

---

## 📈 Beneficios Post-Migración

### Inmediatos
- ✅ Análisis médico con IA funcionando
- ✅ Código más organizado
- ✅ Fácil agregar nuevas features

### A Mediano Plazo
- ✅ Tests unitarios más fáciles
- ✅ Onboarding de nuevos developers más rápido
- ✅ Menos bugs por código desorganizado

### A Largo Plazo
- ✅ Escalabilidad (microservicios)
- ✅ Mantenibilidad
- ✅ Reutilización de código

---

## 🆘 Rollback Plan

Si algo sale mal, revertir es fácil:

```bash
# 1. Detener servidor nuevo
# Ctrl+C

# 2. Restaurar versión antigua
mv main.py main_new.py
mv main_old_backup.py main.py

# 3. Reiniciar
python3 main.py
```

---

## 📞 Soporte

Si tienes dudas o problemas durante la migración:
1. Revisa [ARQUITECTURA.md](ARQUITECTURA.md)
2. Revisa logs: `tail -f logs/app.log`
3. Prueba el test: `python3 -m app.test_ai_analysis`

---

¡La migración está lista! 🎉 Tu código ahora es más profesional, mantenible y potente.
