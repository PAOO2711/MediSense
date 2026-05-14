# 🏥 MediSense Backend - Análisis Médico con IA

Sistema de transcripción y análisis médico inteligente usando Whisper + LangChain + Groq.

## ✨ Características

- 🎙️ **Transcripción de Audio**: Convierte grabaciones médicas a texto con Whisper
- 🧠 **Análisis con IA**: Identifica síntomas y genera sugerencias con Groq (LLM)
- 📋 **Respuestas Estructuradas**: Formato JSON validado con Pydantic
- 🔒 **Arquitectura Modular**: Código organizado y fácil de mantener
- ⚡ **API REST**: Endpoints FastAPI documentados automáticamente

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
cd backend
pip3 install -r requirements.txt
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env y agregar tu GROQ_API_KEY
```

### 3. Iniciar el servidor

```bash
python3 -m app.main_refactored
```

El servidor estará en: http://localhost:8000

## 📚 Documentación

- **[ARQUITECTURA.md](ARQUITECTURA.md)** - Estructura del proyecto y organización del código
- **[INTEGRACION_FRONTEND.md](INTEGRACION_FRONTEND.md)** - Cómo integrar con el frontend

## 🎯 Estructura del Proyecto

```
backend/app/
├── main_refactored.py          # 🚀 API principal (FastAPI)
│
├── config/
│   └── settings.py             # ⚙️ Configuración centralizada
│
├── models/
│   └── schemas.py              # 📋 Modelos Pydantic
│
├── services/
│   ├── transcription.py        # 🎙️ Whisper transcription
│   └── ai_analysis.py          # 🧠 LangChain + Groq analysis
│
└── utils/
    └── audio.py                # 🔧 Utilidades de audio
```

## 🔌 Endpoints API

### `POST /transcribe_file`
Transcribe un archivo de audio a texto

```bash
curl -X POST "http://localhost:8000/transcribe_file" \
  -F "file=@audio.webm"
```

### `POST /analyze`
Analiza una transcripción médica

```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "transcription": "Paciente con dolor de cabeza...",
    "patient_context": "35 años, sin antecedentes"
  }'
```

### `POST /transcribe_and_analyze` ⭐
Transcribe y analiza en un solo paso (recomendado)

```bash
curl -X POST "http://localhost:8000/transcribe_and_analyze" \
  -F "file=@audio.webm"
```

**Respuesta:**
```json
{
  "transcription": {
    "success": true,
    "full_text": "Paciente de 35 años con dolor de cabeza...",
    "duration": 45.2,
    "language": "es"
  },
  "analysis": {
    "resumen": "Paciente con cefalea intensa...",
    "sintomas_identificados": [
      {
        "nombre": "Cefalea",
        "severidad": "Moderada",
        "duracion_estimada": "3 días",
        "descripcion": "Dolor pulsátil en lado derecho"
      }
    ],
    "sugerencias": [
      {
        "tipo": "diagnostico_posible",
        "contenido": "Considerar migraña",
        "prioridad": "Alta",
        "justificacion": "Síntomas característicos de migraña"
      }
    ],
    "preguntas_adicionales": [
      "¿Ha tenido episodios similares?",
      "¿Antecedentes familiares de migraña?"
    ],
    "nivel_urgencia": "Medio",
    "notas_relevantes": [
      "Paciente bajo estrés laboral"
    ]
  }
}
```

## 🧪 Pruebas

### Probar el análisis médico

```bash
cd backend
python3 -m app.test_ai_analysis
```

### Ver documentación interactiva

Abre en tu navegador:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔧 Tecnologías

- **FastAPI** - Framework web moderno
- **Faster Whisper** - Transcripción de audio optimizada
- **LangChain** - Framework para aplicaciones con LLMs
- **Groq** - Inferencia LLM ultra-rápida
- **Pydantic** - Validación de datos

## 📊 Flujo de Trabajo

```
┌─────────────┐
│   Cliente   │
│  (Frontend) │
└──────┬──────┘
       │
       │ 1. Upload audio.webm
       ▼
┌─────────────────────────────┐
│   FastAPI Backend           │
│  /transcribe_and_analyze    │
└──────┬──────────────────────┘
       │
       │ 2. Transcribe
       ▼
┌─────────────────────────────┐
│  Whisper Model (Faster)     │
│  "Paciente con dolor..."    │
└──────┬──────────────────────┘
       │
       │ 3. Analyze
       ▼
┌─────────────────────────────┐
│  LangChain + Groq           │
│  llama-3.3-70b-versatile    │
└──────┬──────────────────────┘
       │
       │ 4. Structured Response
       ▼
┌─────────────────────────────┐
│  Pydantic Validation        │
│  {symptoms, suggestions...} │
└──────┬──────────────────────┘
       │
       │ 5. JSON Response
       ▼
┌─────────────┐
│   Cliente   │
│  (Frontend) │
└─────────────┘
```

## ⚙️ Configuración Avanzada

Edita [app/config/settings.py](app/config/settings.py) para ajustar:

- **Modelo Groq**: `GROQ_MODEL` (default: llama-3.3-70b-versatile)
- **Temperatura**: `GROQ_TEMPERATURE` (default: 0.3)
- **Modelo Whisper**: `WHISPER_MODEL` (default: small)
- **Idioma**: `TRANSCRIPTION_LANGUAGE` (default: es)

## 🐛 Solución de Problemas

### Error: "Modelo no disponible"
```bash
# Verificar que Whisper se cargó correctamente
python3 -c "from faster_whisper import WhisperModel; m = WhisperModel('small')"
```

### Error de API Key de Groq
```bash
# Verificar archivo .env
cat .env | grep GROQ_API_KEY

# Verificar que se carga correctamente
python3 -c "from dotenv import load_dotenv; import os; load_dotenv(); print(os.getenv('GROQ_API_KEY'))"
```

### Problemas con audio WebM
```bash
# Instalar ffmpeg si no está
sudo apt install ffmpeg  # Linux
brew install ffmpeg      # macOS
```

## 📈 Próximos Pasos

- [ ] Agregar tests unitarios
- [ ] Implementar caché de análisis
- [ ] Agregar base de datos para historial
- [ ] Implementar autenticación
- [ ] Rate limiting
- [ ] Webhooks para notificaciones

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es parte de MediSense - Sistema de gestión médica inteligente.

---

**Desarrollado con ❤️ usando Python, FastAPI, y IA**
