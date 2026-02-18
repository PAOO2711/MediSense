'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  ArrowLeft, 
  Calendar,
  FileText,
  Stethoscope,
  ClipboardList,
  TestTube,
  Brain,
  Loader2,
  AlertCircle,
  User,
  Activity,
  ExternalLink
} from 'lucide-react';
import type { Patient, Consultation, Transcription, PatientHistory } from '@/types/consultation';

export default function ConsultaDetailPage({ 
  params 
}: { 
  params: Promise<{ dni: string; consultationId: string }> 
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [transcription, setTranscription] = useState<Transcription | null>(null);
  const [relatedAntecedents, setRelatedAntecedents] = useState<PatientHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Disable browser navigation
  useEffect(() => {
    const disableNavigation = (e: PopStateEvent) => {
      window.history.pushState(null, '', window.location.href);
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', disableNavigation);

    return () => {
      window.removeEventListener('popstate', disableNavigation);
    };
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch patient
        const patientRes = await fetch(`/api/patients/${resolvedParams.dni}`);
        if (patientRes.ok) {
          const patientData = await patientRes.json();
          setPatient(patientData);
        }

        // Fetch consultation
        const consultationRes = await fetch(`/api/consultations/${resolvedParams.consultationId}`);
        if (!consultationRes.ok) {
          throw new Error('Consulta no encontrada');
        }
        const consultationData = await consultationRes.json();
        setConsultation(consultationData);

        // Fetch transcription
        const transcriptionRes = await fetch(`/api/consultations/${resolvedParams.consultationId}/transcriptions`);
        if (transcriptionRes.ok) {
          const transcriptionData = await transcriptionRes.json();
          if (transcriptionData.length > 0) {
            setTranscription(transcriptionData[0]);
          }
        }

        // Fetch all patient history to find antecedents diagnosed in this consultation
        const historyRes = await fetch(`/api/patients/${resolvedParams.dni}/history`);
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          // Filter antecedents that were diagnosed in this consultation
          const related = historyData.filter(
            (h: PatientHistory) => h.consultationId === resolvedParams.consultationId
          );
          setRelatedAntecedents(related);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando la consulta');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [resolvedParams.dni, resolvedParams.consultationId]);

  const navigateToConsultation = (consultationId: string) => {
    window.open(
      `/pacientes/${resolvedParams.dni}/consultas/${consultationId}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin h-12 w-12 text-teal-600" />
          <p className="text-gray-600">Cargando consulta...</p>
        </div>
      </div>
    );
  }

  if (error || !consultation) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error || 'Consulta no encontrada'}</p>
            <Button onClick={() => router.back()}>
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
              <div>
                <a href={`/pacientes/${patient?.dni}`}>
                <h1 className="text-2xl font-bold">Detalle de Consulta</h1>
                {patient && (
                  <div className="flex items-center gap-2 text-blue-100 mt-1">
                    <User className="h-4 w-4" />
                    <span>{patient.name}</span>
                    <span className="opacity-50">•</span>
                    <span>DNI: {patient.dni}</span>
                  </div>
                )}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {new Date(consultation.date).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Consultation Details */}
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
                {consultation.motivoConsulta ? (
                  <p className="text-gray-900 text-base">
                    {consultation.motivoConsulta}
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    No se registró motivo de consulta
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Antecedentes diagnosticados en esta consulta */}
            {relatedAntecedents.length > 0 && (
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Activity className="h-5 w-5 text-orange-600" />
                    Antecedentes Diagnosticados
                  </CardTitle>
                  <CardDescription>
                    Condiciones diagnosticadas en esta consulta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {relatedAntecedents.map((antecedent) => (
                      <div
                        key={antecedent.id}
                        className="p-4 rounded-lg border-2 border-orange-200 bg-orange-50"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {antecedent.antecedente}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Diagnosticado: {new Date(antecedent.diagnosticadoEn).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={
                              antecedent.status === 'activo' 
                                ? 'bg-green-100 text-green-700 border-green-200' 
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                            }
                          >
                            {antecedent.status === 'activo' ? 'Activo' : 'Resuelto'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigateToConsultation(antecedent.consultationId)}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Anamnesis */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Stethoscope className="h-5 w-5 text-teal-600" />
                  Anamnesis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {consultation.anamnesis ? (
                  <p className="text-gray-900 text-base whitespace-pre-wrap">
                    {consultation.anamnesis}
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    No se registró anamnesis
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Pruebas Complementarias */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <TestTube className="h-5 w-5 text-purple-600" />
                  Pruebas Complementarias
                </CardTitle>
              </CardHeader>
              <CardContent>
                {consultation.pruebas ? (
                  <p className="text-gray-900 text-base whitespace-pre-wrap">
                    {consultation.pruebas}
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    No se registraron pruebas complementarias
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Diagnóstico */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Brain className="h-5 w-5 text-indigo-600" />
                  Diagnóstico
                </CardTitle>
              </CardHeader>
              <CardContent>
                {consultation.diagnostico ? (
                  <p className="text-gray-900 text-base whitespace-pre-wrap">
                    {consultation.diagnostico}
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    No se registró diagnóstico
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recomendaciones */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <FileText className="h-5 w-5 text-green-600" />
                  Recomendaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                {consultation.recomendaciones ? (
                  <p className="text-gray-900 text-base whitespace-pre-wrap">
                    {consultation.recomendaciones}
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    No se registraron recomendaciones
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Transcription and Resumen */}
          <div className="lg:col-span-1 space-y-6">
            {/* Transcription Card */}
            <Card className="border-0 shadow-lg bg-white sticky top-6">
              <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white -mt-6 pt-8 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Transcripción
                </CardTitle>
                <CardDescription className="text-teal-100">
                  Registro de audio de la consulta
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {transcription ? (
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="transcription" className="border-none">
                      <AccordionTrigger className="text-sm font-medium text-gray-700 hover:text-gray-900 hover:no-underline">
                        Ver transcripción completa
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-gray-50 p-4 rounded-lg border max-h-[600px] overflow-y-auto">
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {transcription.fullText}
                          </p>
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                              Transcrito el {new Date(transcription.createdAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay transcripción disponible</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumen IA Card */}
            {relatedAntecedents.some(ant => ant.resumen) && (
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white -mt-6 pt-8 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Resumen IA
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    Análisis generado por inteligencia artificial
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {relatedAntecedents.filter(ant => ant.resumen).map((antecedent) => (
                    <Accordion key={antecedent.id} type="single" collapsible className="w-full">
                      <AccordionItem value={`resumen-${antecedent.id}`} className="border-none">
                        <AccordionTrigger className="text-sm font-medium text-gray-700 hover:text-gray-900 hover:no-underline">
                          Ver resumen de análisis
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {antecedent.resumen}
                            </p>
                            <div className="mt-4 pt-4 border-t border-purple-200">
                              <p className="text-xs text-gray-500">
                                Asociado al diagnóstico: <span className="font-medium">{antecedent.antecedente}</span>
                              </p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
