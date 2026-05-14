# 🚀 Guía de Integración Frontend - Backend

## 📌 Cómo usar el nuevo análisis de IA en tu aplicación

## 🎯 Escenario: Nueva Consulta con Grabación

Cuando un médico crea una nueva consulta y graba al paciente, el flujo es:

1. **Grabar audio** en el frontend
2. **Enviar audio** al backend para transcribir
3. **Analizar transcripción** con IA
4. **Mostrar sugerencias** al médico

---

## 💻 Ejemplo de Integración

### Frontend: Crear Nueva Consulta

Actualiza tu archivo: [frontend/app/pacientes/[dni]/nueva-consulta/page.tsx](../../../frontend/app/pacientes/%5Bdni%5D/nueva-consulta/page.tsx)

```typescript
// Función para enviar audio y obtener análisis
async function handleAudioSubmit(audioBlob: Blob, patientDNI: string) {
  try {
    // 1. Crear FormData con el audio
    const formData = new FormData();
    formData.append('file', audioBlob, 'grabacion.webm');
    formData.append('patient_context', `Paciente DNI: ${patientDNI}`);
    
    // 2. Enviar al backend - Transcribir y Analizar
    const response = await fetch('http://localhost:8000/transcribe_and_analyze', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Error en el análisis');
    }
    
    const result = await response.json();
    
    // 3. Procesar resultados
    const { transcription, analysis } = result;
    
    console.log('Transcripción:', transcription.full_text);
    console.log('Análisis:', analysis);
    
    // 4. Guardar en base de datos
    await saveConsultation({
      patientDNI,
      transcription: transcription.full_text,
      symptoms: analysis.sintomas_identificados,
      suggestions: analysis.sugerencias,
      urgencyLevel: analysis.nivel_urgencia,
      summary: analysis.resumen,
    });
    
    // 5. Mostrar resultados al médico
    return analysis;
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

---

## 🎨 Componente para Mostrar Análisis

Crea un nuevo componente: `frontend/components/medical-analysis-card.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Symptom {
  nombre: string;
  severidad: string;
  duracion_estimada: string;
  descripcion: string;
}

interface Suggestion {
  tipo: string;
  contenido: string;
  prioridad: string;
  justificacion: string;
}

interface MedicalAnalysisProps {
  resumen: string;
  sintomas_identificados: Symptom[];
  sugerencias: Suggestion[];
  preguntas_adicionales: string[];
  nivel_urgencia: string;
  notas_relevantes: string[];
}

export function MedicalAnalysisCard({ 
  resumen, 
  sintomas_identificados,
  sugerencias,
  preguntas_adicionales,
  nivel_urgencia,
  notas_relevantes 
}: MedicalAnalysisProps) {
  
  const urgencyColor = {
    'Bajo': 'bg-green-100 text-green-800',
    'Medio': 'bg-yellow-100 text-yellow-800',
    'Alto': 'bg-orange-100 text-orange-800',
    'Urgente': 'bg-red-100 text-red-800',
  };
  
  return (
    <div className="space-y-4">
      {/* Resumen y Urgencia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Análisis de IA</span>
            <Badge className={urgencyColor[nivel_urgencia]}>
              Urgencia: {nivel_urgencia}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{resumen}</p>
        </CardContent>
      </Card>
      
      {/* Síntomas */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Síntomas Identificados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sintomas_identificados.map((sintoma, idx) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold">{sintoma.nombre}</h4>
                  <Badge variant="outline">{sintoma.severidad}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {sintoma.descripcion}
                </p>
                {sintoma.duracion_estimada && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Duración: {sintoma.duracion_estimada}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Sugerencias */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Sugerencias para el Médico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sugerencias.map((sug, idx) => (
              <Alert key={idx}>
                <AlertDescription>
                  <div className="flex justify-between items-start mb-2">
                    <Badge>{sug.tipo.replace('_', ' ')}</Badge>
                    <Badge variant="outline">{sug.prioridad}</Badge>
                  </div>
                  <p className="font-medium">{sug.contenido}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {sug.justificacion}
                  </p>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Preguntas Adicionales */}
      {preguntas_adicionales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>❓ Preguntas Recomendadas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {preguntas_adicionales.map((pregunta, idx) => (
                <li key={idx} className="text-sm">{pregunta}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {/* Notas Relevantes */}
      {notas_relevantes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📌 Notas Relevantes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {notas_relevantes.map((nota, idx) => (
                <li key={idx} className="text-sm">{nota}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

## 🔄 Flujo Completo en Nueva Consulta

### Paso 1: Modificar el componente de grabación

```typescript
// En tu página de nueva consulta
'use client';

import { useState } from 'react';
import { AudioRecorder } from '@/components/audio-recorder';
import { MedicalAnalysisCard } from '@/components/medical-analysis-card';
import { Button } from '@/components/ui/button';

export default function NewConsultationPage({ params }: { params: { dni: string } }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [transcription, setTranscription] = useState('');
  
  async function handleRecordingComplete(audioBlob: Blob) {
    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'grabacion.webm');
      
      const response = await fetch('http://localhost:8000/transcribe_and_analyze', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      setTranscription(result.transcription.full_text);
      setAnalysis(result.analysis);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error al analizar la grabación');
    } finally {
      setIsAnalyzing(false);
    }
  }
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Nueva Consulta</h1>
      
      {/* Grabadora */}
      <AudioRecorder onRecordingComplete={handleRecordingComplete} />
      
      {/* Loading */}
      {isAnalyzing && (
        <div className="text-center py-8">
          <p>🔄 Transcribiendo y analizando...</p>
        </div>
      )}
      
      {/* Transcripción */}
      {transcription && (
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Transcripción:</h3>
          <p className="text-sm">{transcription}</p>
        </div>
      )}
      
      {/* Análisis */}
      {analysis && <MedicalAnalysisCard {...analysis} />}
      
      {/* Botón para confirmar y guardar */}
      {analysis && (
        <Button size="lg" onClick={() => handleSaveConsultation()}>
          Confirmar y Guardar Consulta
        </Button>
      )}
    </div>
  );
}
```

---

## 📡 API Endpoints Disponibles

### 1. POST `/transcribe_file`
Solo transcribe el audio (sin análisis)

```bash
curl -X POST "http://localhost:8000/transcribe_file" \
  -F "file=@audio.webm"
```

### 2. POST `/analyze`
Solo analiza un texto ya transcrito

```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "transcription": "El paciente tiene dolor...",
    "patient_context": "Paciente de 35 años"
  }'
```

### 3. POST `/transcribe_and_analyze` ⭐ Recomendado
Transcribe y analiza en un solo paso

```bash
curl -X POST "http://localhost:8000/transcribe_and_analyze" \
  -F "file=@audio.webm" \
  -F "patient_context=Paciente de 35 años"
```

---

## 🗄️ Guardar en Base de Datos

Actualiza tus rutas API para incluir el análisis:

```typescript
// frontend/app/api/consultations/route.ts
export async function POST(request: Request) {
  const data = await request.json();
  
  const consultation = await db.insert(consultations).values({
    patientDNI: data.patientDNI,
    date: new Date(),
    transcription: data.transcription,
    aiAnalysis: JSON.stringify(data.analysis), // Guardar como JSON
    urgencyLevel: data.analysis.nivel_urgencia,
    symptoms: JSON.stringify(data.analysis.sintomas_identificados),
    suggestions: JSON.stringify(data.analysis.sugerencias),
  });
  
  return Response.json(consultation);
}
```

---

## ⚙️ Configuración Necesaria

### 1. Actualizar Schema de Base de Datos

Agrega columnas para el análisis en tu schema:

```typescript
// frontend/lib/db/schema/schema.ts
export const consultations = pgTable('consultations', {
  id: serial('id').primaryKey(),
  patientDNI: varchar('patient_dni', { length: 20 }).notNull(),
  date: timestamp('date').defaultNow(),
  transcription: text('transcription'),
  aiAnalysis: json('ai_analysis'), // Análisis completo
  urgencyLevel: varchar('urgency_level', { length: 20 }),
  symptoms: json('symptoms'),
  suggestions: json('suggestions'),
  // ... otros campos
});
```

### 2. Iniciar Backend

```bash
cd /home/pedri/medisense/backend
source venv/bin/activate  # Si usas venv
python3 -m app.main_refactored
```

O para desarrollo con recarga automática:

```bash
cd /home/pedri/medisense/backend
uvicorn app.main_refactored:app --reload
```

---

## 🔒 Producción: Consideraciones

1. **CORS**: Actualiza `settings.py` con tu dominio real
2. **Rate Limiting**: Limita requests por IP
3. **Autenticación**: Protege los endpoints
4. **Logging**: Registra todas las consultas
5. **Error Handling**: Maneja errores de red

---

## 🧪 Testing

### Test rápido del endpoint
```bash
# Terminal 1: Iniciar servidor
cd backend
python3 -m app.main_refactored

# Terminal 2: Probar endpoint
curl http://localhost:8000/health
```

---

## 📚 Próximos Pasos

1. ✅ Implementar el componente `MedicalAnalysisCard`
2. ✅ Actualizar la página de nueva consulta
3. ✅ Modificar el schema de la base de datos
4. ✅ Agregar validación de médico confirmando sugerencias
5. ✅ Implementar historial de análisis por paciente

---

¿Necesitas ayuda con alguna de estas integraciones? 🚀
