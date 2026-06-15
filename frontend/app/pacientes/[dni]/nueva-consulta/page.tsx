'use client';

import { useState, useEffect, use, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Mic, 
  Square,
  Save,
  Sparkles,
  Plus,
  FileText,
  Stethoscope,
  ClipboardList,
  TestTube,
  Brain,
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
  Activity,
  CheckCheck,
  ExternalLink
} from 'lucide-react';
import type { Patient, AISuggestion, PatientHistory } from '@/types/consultation';

// Helper function to format time in MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function NuevaConsultaPage({ params }: { params: Promise<{ dni: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  // Patient data
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  
  // Form fields
  const [motivoConsulta, setMotivoConsulta] = useState('');
  const [anamnesis, setAnamnesis] = useState('');
  const [pruebasComplementarias, setPruebasComplementarias] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  
  // Patient history (antecedentes)
  const [patientHistory, setPatientHistory] = useState<PatientHistory[]>([]);
  const [activeHistoryIds, setActiveHistoryIds] = useState<Set<string>>(new Set());
  
  // Audio recording
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState<string>('Listo para grabar');
  const [transcription, setTranscription] = useState('');
  const [duration, setDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // AI Suggestions
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [aiAnalysisResumen, setAiAnalysisResumen] = useState<string>('');
  
  // Saving
  const [saving, setSaving] = useState(false);

  // Fetch patient data and history
  useEffect(() => {
    async function fetchPatient() {
      try {
        const response = await fetch(`/api/patients/${resolvedParams.dni}`, {
          method: 'GET',
        });
        
        if (response.ok) {
          const data = await response.json();
          setPatient(data);
        }
      } catch (error) {
        console.error('Error fetching patient:', error);
      } finally {
        setLoadingPatient(false);
      }
    }
    
    async function fetchPatientHistory() {
      try {
        const response = await fetch(`/api/patients/${resolvedParams.dni}/history?activeOnly=true`, {
          method: 'GET',
        });
        
        if (response.ok) {
          const data = await response.json();
          setPatientHistory(data);
          // Initialize all active antecedents as checked
          setActiveHistoryIds(new Set(data.map((h: PatientHistory) => h.id)));
        }
      } catch (error) {
        console.error('Error fetching patient history:', error);
      }
    }
    
    fetchPatient();
    fetchPatientHistory();
  }, [resolvedParams.dni]);

  // Audio recording functions
  const startRecording = useCallback(async () => {
    try {
      setRecordingStatus('Solicitando permisos...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setRecordingStatus('Procesando transcripción...');
        setIsProcessing(true);

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      setRecordingStatus('Grabando...');

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error iniciando grabación:', error);
      setRecordingStatus('Error accediendo al micrófono');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('patient_id', resolvedParams.dni); // Pasar el DNI del paciente para contexto adicional
      if (patient?.age != null) {
        formData.append('patient_age', String(patient.age));
      }

      //const { data: { session } } = await supabase.auth.getSession();

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/transcribe_and_analyze`, {
        method: 'POST',
        /* headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        }, */
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const result = await response.json();

      // Extraer transcripción
      if (result.transcription?.success) {
        setTranscription(result.transcription.full_text);
        setDuration(result.transcription.duration);
        setRecordingStatus('Transcripción completada');
      } else {
        setRecordingStatus('Error en transcripción');
        return;
      }

      // Extraer y mapear síntomas e sugerencias de IA
      if (result.analysis) {
        setLoadingSuggestions(true);
        
        // Rellenar automáticamente el motivo de consulta si sigue vacío
        if (!motivoConsulta?.trim() && result.analysis.motivo_consulta) {
          setMotivoConsulta(result.analysis.motivo_consulta);
        }

        // Guardar el resumen para usarlo al guardar la consulta
        if (result.analysis.resumen) {
          setAiAnalysisResumen(result.analysis.resumen);
        }
        
        // Mapear síntomas identificados (confianza 1.0 porque fueron identificados directamente)
        const identifiedSymptoms: AISuggestion[] = (result.analysis.sintomas_identificados || []).map((sym: Record<string, unknown>, index: number) => ({
          id: `symptom-${Date.now()}-${index}`,
          type: 'symptom' as const,
          text: String(sym['nombre'] ?? ''),
          description: String(sym['descripcion'] ?? ''),
          confidence: 1.0,
          source: 'identified' as const
        }));
        
        // Mapear sugerencias de IA
        const suggestedItems: AISuggestion[] = (result.analysis.sugerencias || []).map((sug: Record<string, unknown>, index: number) => ({
          id: `suggestion-${Date.now()}-${index}`,
          type: (String(sug['tipo']) as 'symptom' | 'condition' | 'recommendation'),
          text: String(sug['contenido'] ?? ''),
          description: String(sug['justificacion'] ?? ''),
          confidence: Number(sug['confianza']) || 0,
          source: 'suggested' as const
        }));
        
        // Agrupar: primero síntomas identificados, luego otras sugerencias, luego sugerencias de síntomas
        const allSuggestions: AISuggestion[] = [
          ...identifiedSymptoms,
          ...suggestedItems.filter(s => s.type !== 'symptom'),
          ...suggestedItems.filter(s => s.type === 'symptom')
        ];
        
        setAiSuggestions(allSuggestions);
        setLoadingSuggestions(false);
      }

    } catch (error) {
      console.error('Error transcribiendo:', error);
      setRecordingStatus('Error en transcripción');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Note: AI suggestions are now generated directly in transcribeAudio via backend
  // This function is no longer needed but kept for reference if manual triggering is needed
  const generateAISuggestions = async (text: string) => {
    // This is now handled automatically by the backend in transcribe_and_analyze
    // Keeping this function in case we need to re-analyze later
    console.log('AI suggestions are now generated automatically during transcription');
  };

  const addSuggestionToAnamnesis = (suggestion: AISuggestion) => {
    const suggestionText =
      suggestion.source === 'identified' && suggestion.description?.trim()
        ? `${suggestion.text} (${suggestion.description.trim()})`
        : suggestion.text;

    const newText = anamnesis 
      ? `${anamnesis}\n• ${suggestionText}`
      : `• ${suggestionText}`;
    setAnamnesis(newText);
    
    // Remove the suggestion from the list
    setAiSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  // Save consultation
  const handleSave = async () => {
    if (!patient) return;
    
    setSaving(true);
    try {
      // Create consultation
      const consultationResponse = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.dni,
          title: motivoConsulta || 'Consulta médica',
          motivoConsulta,
          anamnesis,
          pruebas: pruebasComplementarias,
          diagnostico,
          status: 'completed'
        })
      });

      if (!consultationResponse.ok) {
        throw new Error('Error creating consultation');
      }

      const consultation = await consultationResponse.json();

      // If there's a transcription, save it
      if (transcription) {
        await fetch('/api/transcriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            consultationId: consultation.id,
            fullText: transcription,
            duration: duration,
          })
        });
      }
      
      // If there's a diagnosis, create a patient history record
      if (diagnostico && diagnostico.trim()) {
        await fetch(`/api/patients/${patient.dni}/history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            antecedente: diagnostico,
            resumen: aiAnalysisResumen || null, // Guardar el resumen del análisis de IA
            diagnosticadoEn: new Date().toISOString(),
            consultationId: consultation.id,
            status: 'activo'
          })
        });
      }
      
      // Update status of any antecedents that were unchecked (marked as resolved)
      for (const historyItem of patientHistory) {
        if (!activeHistoryIds.has(historyItem.id)) {
          // This antecedent was unchecked, mark it as resolved
          await fetch(`/api/patients/${patient.dni}/history`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              historyId: historyItem.id,
              status: 'resuelto',
              resolvedInConsultationId: consultation.id
            })
          });
        }
      }

      // Save consultation as embedding for future AI retrieval
      const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      // Construir contexto rico para mejores búsquedas de similitud
      
      const pageContent = `
      CONSULTA MÉDICA

      --- MOTIVO DE CONSULTA ---
      ${motivoConsulta || 'No especificado'}

      --- ANAMNESIS ---
      ${anamnesis || 'No registrada'}

      --- DIAGNÓSTICO FINAL ---
      ${diagnostico || 'No especificado'}

      ${aiAnalysisResumen ? `--- RESUMEN IA ---\n${aiAnalysisResumen}` : ''}
      `.trim();

      const metadata = {
        patient_id: patient.dni,
        fecha: new Date().toISOString(),
      };

      await fetch(`${url}/generate_embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_content: pageContent,
          metadata: metadata
        })
      })

      // Redirect back to patient detail
      router.push(`/pacientes/${patient.dni}`);
      
    } catch (error) {
      console.error('Error saving consultation:', error);
    } finally {
      setSaving(false);
    }
  };

  const getSuggestionTypeColor = (type: AISuggestion['type']) => {
    switch (type) {
      case 'symptom':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'condition':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'recommendation':
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getSuggestionTypeLabel = (type: AISuggestion['type']) => {
    switch (type) {
      case 'symptom':
        return 'Síntoma';
      case 'condition':
        return 'Condición';
      case 'recommendation':
        return 'Recomendación';
    }
  };

  if (loadingPatient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Paciente no encontrado</h2>
            <Button onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 text-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Nueva Consulta</h1>
                <div className="flex items-center gap-2 text-blue-100 mt-1">
                  <User className="h-4 w-4" />
                  <span>{patient.name}</span>
                  <span className="opacity-50">•</span>
                  <span>DNI: {patient.dni}</span>
                </div>
              </div>
            </div>
            <Button 
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Consulta
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Medical Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Motivo de Consulta */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                  Motivo de Consulta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Ej: Dolor abdominal, revisión rutinaria, seguimiento..."
                  value={motivoConsulta}
                  onChange={(e) => setMotivoConsulta(e.target.value)}
                  className="text-lg bg-white border border-gray-300 text-gray-900"
                />
              </CardContent>
            </Card>

            {/* Antecedentes */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Activity className="h-5 w-5 text-orange-600" />
                  Antecedentes
                </CardTitle>
                <CardDescription>
                  Historial médico del paciente. Desmarca para marcar como resuelto en esta consulta.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {patientHistory.length > 0 ? (
                  <div className="space-y-3">
                    {patientHistory.map((history) => {
                      const isActive = activeHistoryIds.has(history.id);
                      const toggleHistory = () => {
                        setActiveHistoryIds(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(history.id)) {
                            newSet.delete(history.id);
                          } else {
                            newSet.add(history.id);
                          }
                          return newSet;
                        });
                      };
                      
                      return (
                        <div
                          key={history.id}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            isActive 
                              ? 'border-orange-200 bg-orange-50' 
                              : 'border-gray-200 bg-gray-50 opacity-60'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              onClick={toggleHistory}
                              className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all hover:shadow-md ${
                                isActive
                                  ? 'bg-orange-500 border-orange-500 hover:bg-orange-600'
                                  : 'bg-white border-gray-300 hover:border-orange-400'
                              }`}
                            >
                              {isActive && <CheckCheck className="h-3 w-3 text-white" />}
                            </button>
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={toggleHistory}
                            >
                              <p className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500 line-through'}`}>
                                {history.antecedente}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Diagnosticado: {new Date(history.diagnosticadoEn).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}
                            >
                              {isActive ? 'Activo' : 'Será resuelto'}
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                  `/pacientes/${patient?.dni}/consultas/${history.consultationId}`,
                                  '_blank',
                                  'noopener,noreferrer'
                                );
                              }}
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay antecedentes registrados</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Anamnesis */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Stethoscope className="h-5 w-5 text-teal-600" />
                  Anamnesis
                </CardTitle>
                <CardDescription>
                  Historial clínico y síntomas del paciente. Las sugerencias de IA se añadirán aquí.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Describa los síntomas, antecedentes relevantes, evolución del cuadro..."
                  value={anamnesis}
                  onChange={(e) => setAnamnesis(e.target.value)}
                  className="min-h-[200px] text-base bg-white border border-gray-300 text-gray-900"
                />
              </CardContent>
            </Card>

            {/* Pruebas Complementarias */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <TestTube className="h-5 w-5 text-purple-600" />
                  Pruebas Complementarias
                </CardTitle>
                <CardDescription>
                  Análisis, radiografías, estudios solicitados o realizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Ej: Analítica de sangre completa, Rx tórax, ECG..."
                  value={pruebasComplementarias}
                  onChange={(e) => setPruebasComplementarias(e.target.value)}
                  className="min-h-[120px] text-base bg-white border border-gray-300 text-gray-900"
                />
              </CardContent>
            </Card>

            {/* Diagnóstico */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Brain className="h-5 w-5 text-indigo-600" />
                  Diagnóstico
                </CardTitle>
                <CardDescription>
                  Diagnóstico final de la consulta. Se añadirá al historial del paciente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Ej: Gastroenteritis aguda, Hipertensión arterial descompensada..."
                  value={diagnostico}
                  onChange={(e) => setDiagnostico(e.target.value)}
                  className="min-h-[100px] text-base bg-white border border-gray-300 text-gray-900"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Audio Recording & AI */}
          <div className="lg:col-span-1 space-y-6">
            {/* Audio Recorder Card */}
            <Card className="border-0 shadow-lg bg-white overflow-hidden pt-0">
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white -mt-6 pt-8 pb-4 flex flex-col items-center justify-center px-6">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Mic className="h-5 w-5" />
                  Grabación de Audio
                </div>
                <p className="text-teal-100 text-sm mt-1">
                  Graba la conversación con el paciente
                </p>
              </div>
              <CardContent className="pt-6 space-y-4">
                {/* Recording Status */}
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="outline" 
                    className={isRecording ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-100 text-gray-700 border-gray-300'}
                  >
                    {isRecording && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />}
                    {recordingStatus}
                  </Badge>
                  {isRecording && (
                    <span className="font-mono text-lg font-semibold text-gray-700">
                      {formatTime(recordingTime)}
                    </span>
                  )}
                </div>

                {/* Recording Controls */}
                <div className="flex gap-3">
                  {!isRecording && !isProcessing && (
                    <Button 
                      onClick={startRecording} 
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Iniciar Grabación
                    </Button>
                  )}
                  
                  {isRecording && (
                    <Button 
                      onClick={stopRecording} 
                      variant="destructive" 
                      className="flex-1"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Detener
                    </Button>
                  )}

                  {isProcessing && (
                    <Button disabled className="flex-1">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Transcribiendo...
                    </Button>
                  )}
                </div>

                {/* Transcription Result */}
                {transcription && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Transcripción
                    </Label>
                    <div className="bg-gray-50 p-4 rounded-lg border max-h-48 overflow-y-auto">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {transcription}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Suggestions Card */}
            <Card className="border-0 shadow-lg bg-white overflow-hidden pt-0">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white -mt-6 pt-8 pb-4 flex flex-col items-center justify-center px-6">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Sparkles className="h-5 w-5" />
                  Sugerencias IA
                </div>
                <p className="text-purple-100 text-sm mt-1">
                  Click para añadir a la anamnesis
                </p>
              </div>
              <CardContent className="pt-6">
                {loadingSuggestions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                    <span className="ml-2 text-gray-600">Analizando transcripción...</span>
                  </div>
                ) : aiSuggestions.length > 0 ? (
                  <div className="space-y-3">
                    {aiSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => addSuggestionToAnamnesis(suggestion)}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getSuggestionTypeColor(suggestion.type)}`}
                              >
                                {getSuggestionTypeLabel(suggestion.type)}
                              </Badge>
                              {suggestion.source === 'identified' ? (
                                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">Identificado</span>
                              ) : (
                                <span className="text-xs text-gray-400">
                                  {Math.round(suggestion.confidence * 100)}% conf.
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 font-medium">{suggestion.text}</p>
                            {suggestion.description && (
                              <p className="text-xs text-gray-500 mt-1">{suggestion.description}</p>
                            )}
                          </div>
                          <Plus className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : transcription ? (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay sugerencias disponibles</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Graba audio para obtener sugerencias</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
