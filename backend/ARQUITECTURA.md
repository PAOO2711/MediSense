# 📚 Guía de Arquitectura - MediSense Backend

## 🎯 Estructura del Proyecto

La nueva arquitectura sigue el patrón **separation of concerns** y está organizada de la siguiente manera:

```
backend/app/
├── main_refactored.py    # 🚀 Punto de entrada principal (FastAPI)
├── config/
│   ├── __init__.py
│   └── settings.py       # ⚙️ Configuración centralizada
├── models/
│   ├── __init__.py
│   └── schemas.py        # 📋 Modelos Pydantic (validación)
├── services/
│   ├── __init__.py
│   ├── transcription.py  # 🎙️ Servicio de transcripción (Whisper)
│   └── ai_analysis.py    # 🧠 Servicio de análisis con IA (LangChain + Groq)
└── utils/
    ├── __init__.py
    └── audio.py          # 🔧 Utilidades de audio
```

---

## 📦 Componentes Principales

### 1. **Config (`config/settings.py`)**
Centraliza toda la configuración de la aplicación:
- Variables de entorno (API keys)
- Parámetros de modelos (Whisper, Groq)
- Configuraciones de transcripción
- CORS y logging

**Ventajas:**
- Un solo lugar para cambiar configuraciones
- Fácil de testear con diferentes configuraciones
- Separación de código y configuración

### 2. **Models (`models/schemas.py`)**
Define los esquemas de datos usando Pydantic:
- `TranscriptionResponse`: Respuesta de transcripción
- `MedicalAnalysis`: Análisis médico estructurado
- `Symptom`, `Suggestion`: Componentes del análisis

**Ventajas:**
- Validación automática de datos
- Documentación automática de la API
- Type safety

### 3. **Services (`services/`)**

#### `transcription.py`
- Maneja todo lo relacionado con Whisper
- Carga y gestiona el modelo
- Transcribe archivos de audio

#### `ai_analysis.py`
- Analiza transcripciones con LangChain + Groq
- Genera respuestas estructuradas con síntomas y sugerencias
- Usa Pydantic para garantizar formato consistente

**Ventajas:**
- Lógica de negocio separada de la API
- Reutilizable en diferentes contextos
- Fácil de testear independientemente

### 4. **Utils (`utils/audio.py`)**
Funciones auxiliares para procesamiento de audio:
- Conversión de formatos
- Limpieza de archivos temporales

---

## 🔄 Flujo de Trabajo

### Flujo 1: Solo Transcripción
```
Cliente → POST /transcribe_file → TranscriptionService → Whisper → Respuesta
```

### Flujo 2: Solo Análisis
```
Cliente → POST /analyze → MedicalAnalysisService → Groq (LangChain) → Respuesta
```

### Flujo 3: Completo (Recomendado)
```
Cliente → POST /transcribe_and_analyze → 
  1. TranscriptionService (Whisper) →
  2. MedicalAnalysisService (Groq) →
  Respuesta combinada
```

---

## 🚀 Endpoints de la API

### `GET /`
Información del servicio y endpoints disponibles

### `POST /transcribe_file`
Transcribe un archivo de audio a texto

**Request:**
```bash
curl -X POST "http://localhost:8000/transcribe_file" \
  -F "file=@grabacion.webm"
```

**Response:**
```json
{
  "success": true,
  "full_text": "El paciente reporta dolor de cabeza...",
  "duration": 45.2,
  "language": "es",
  "language_probability": 0.98,
  "filename": "grabacion.webm"
}
```

### `POST /analyze`
Analiza una transcripción y genera sugerencias médicas

**Request:**
```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "transcription": "El paciente reporta dolor de cabeza intenso...",
    "patient_context": "Paciente de 35 años sin antecedentes"
  }'
```

**Response:**
```json
{
  "resumen": "Paciente con cefalea intensa...",
  "sintomas_identificados": [
    {
      "nombre": "Cefalea",
      "severidad": "Moderada",
      "duracion_estimada": "3 días",
      "descripcion": "Dolor de cabeza pulsátil..."
    }
  ],
  "sugerencias": [
    {
      "tipo": "diagnostico_posible",
      "contenido": "Considerar migraña...",
      "prioridad": "Alta",
      "justificacion": "Síntomas característicos..."
    }
  ],
  "preguntas_adicionales": [
    "¿Ha tenido episodios similares antes?",
    "¿Hay antecedentes familiares de migraña?"
  ],
  "nivel_urgencia": "Medio",
  "notas_relevantes": [
    "Paciente bajo estrés laboral"
  ]
}
```

### `POST /transcribe_and_analyze`
Endpoint combinado: transcribe y analiza en una sola llamada

**Request:**
```bash
curl -X POST "http://localhost:8000/transcribe_and_analyze" \
  -F "file=@grabacion.webm" \
  -F "patient_context=Paciente de 35 años"
```

---

## 🧪 Pruebas

### Instalar dependencias
```bash
cd /home/pedri/medisense/backend
pip install langchain-groq
```

### Probar el análisis médico
```bash
cd app
python test_ai_analysis.py
```

### Iniciar el servidor
```bash
python main_refactored.py
```

O usar uvicorn directamente:
```bash
uvicorn main_refactored:app --reload
```

---

## 💡 Ventajas de esta Arquitectura

### ✅ Mantenibilidad
- Código organizado en módulos lógicos
- Fácil encontrar y modificar funcionalidades
- Un cambio en un servicio no afecta otros

### ✅ Escalabilidad
- Fácil agregar nuevos servicios
- Posibilidad de separar servicios en microservicios
- Cada componente puede escalar independientemente

### ✅ Testabilidad
- Cada servicio se puede testear independientemente
- Mocks más sencillos
- Tests unitarios más específicos

### ✅ Reutilización
- Servicios pueden usarse fuera de FastAPI
- Lógica de negocio independiente del framework
- Fácil crear CLIs o scripts

### ✅ Legibilidad
- Responsabilidades claras
- Menos código en cada archivo
- Más fácil de entender para nuevos desarrolladores

---

## 🔄 Migración desde `main.py`

Para empezar a usar la nueva arquitectura:

1. **Renombrar el antiguo main.py**
```bash
mv main.py main_old.py
mv main_refactored.py main.py
```

2. **Instalar dependencia faltante**
```bash
pip install langchain-groq
```

3. **Reiniciar el servidor**
```bash
python main.py
```

---

## 🎓 Próximos Pasos

### Mejoras recomendadas:
1. **Agregar tests unitarios** en `tests/`
2. **Implementar caché** para análisis repetidos
3. **Agregar logging estructurado** (JSON logs)
4. **Base de datos** para guardar transcripciones y análisis
5. **Autenticación** para la API
6. **Rate limiting** para prevenir abuso
7. **Webhooks** para notificar cuando el análisis termina

### Estructura futura recomendada:
```
backend/
├── app/
│   ├── api/              # Rutas de la API
│   │   ├── v1/
│   │   │   ├── transcription.py
│   │   │   └── analysis.py
│   ├── core/             # Configuración core
│   │   ├── config.py
│   │   └── security.py
│   ├── services/         # Lógica de negocio
│   ├── models/           # Modelos de datos
│   ├── db/               # Base de datos
│   │   ├── models.py
│   │   └── repositories.py
│   └── utils/
├── tests/                # Tests unitarios e integración
└── migrations/           # Migraciones de DB
```

---

## 📝 Notas Importantes

- **Temperatura baja** (0.3) en Groq para análisis médicos más consistentes
- **Validación estricta** con Pydantic para evitar respuestas inválidas
- **Manejo robusto de errores** en todos los servicios
- **Limpieza automática** de archivos temporales

---

## 🆘 Solución de Problemas

### Error: "Modelo no disponible"
- Verificar que Whisper se cargó correctamente
- Revisar logs al iniciar la aplicación

### Error de API key de Groq
- Verificar que `.env` tiene `GROQ_API_KEY`
- Verificar que `dotenv` está instalado

### Respuestas inválidas del LLM
- Aumentar `temperature` si las respuestas son muy rígidas
- Reducir `temperature` si son muy variables
- Verificar el prompt en `ai_analysis.py`

---

¡Listo! 🎉 Tu backend ahora tiene una arquitectura modular, escalable y profesional.
