'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Edit, 
  Trash2, 
  Plus,
  Stethoscope,
  FileText,
  Clock,
  Activity,
  Heart
} from 'lucide-react';
import type { Patient, Consultation } from '@/types/consultation';

export default function PatientDetailPage({ params }: { params: Promise<{ dni: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    // Evitar llamadas duplicadas
    if (hasFetched) return;
    
    async function fetchData() {
      try {
        const dni = resolvedParams.dni;
        
        // GET /api/patients/[dni]
        const patientResponse = await fetch(`/api/patients/${dni}`, {
          method: 'GET',
        });
        
        if (patientResponse.ok) {
          const patientData = await patientResponse.json();
          setPatient(patientData);
          
          // GET /api/patients/[dni]/consultations
          const consultationsResponse = await fetch(`/api/patients/${dni}/consultations`, {
            method: 'GET',
          });
          
          if (consultationsResponse.ok) {
            const consultationsData = await consultationsResponse.json();
            setConsultations(consultationsData);
          }
        }
      } catch (error) {
        console.error('Error fetching patient:', error);
      } finally {
        setLoading(false);
        setHasFetched(true);
      }
    }
    fetchData();
  }, [resolvedParams.dni, hasFetched]);

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'No especificada';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
      default:
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'in-progress':
        return 'En progreso';
      case 'pending':
      default:
        return 'Pendiente';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="text-gray-600">Cargando información del paciente...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="max-w-md border border-gray-200 shadow-lg">
          <CardContent className="pt-6 text-center">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Paciente no encontrado
            </h2>
            <p className="text-gray-600 mb-4">
              No se encontró ningún paciente con el DNI especificado.
            </p>
            <Button onClick={() => router.push('/pacientes')} className="bg-teal-600 hover:bg-teal-700 text-white">
              Volver a pacientes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header con gradiente médico */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">MediSense</h1>
              <p className="text-blue-100 text-sm">Sistema de Gestión de Pacientes</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-300 animate-pulse" />
              <span className="text-sm text-blue-100">Sistema activo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Navegación */}
        <Button 
          variant="ghost" 
          onClick={() => router.push('/pacientes')}
          className="mb-6 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a pacientes
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Patient Info Card */}
          <Card className="lg:col-span-1 border border-gray-200 shadow-lg bg-white">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-teal-50">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-md">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">
                    {patient.name}
                  </CardTitle>
                  <Badge variant="outline" className="font-mono mt-1 bg-white text-blue-700 border-blue-200">
                    DNI: {patient.dni}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-gray-900">{patient.email || 'Sin email registrado'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Phone className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-900">{patient.phone || 'Sin teléfono registrado'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-gray-900">Nacimiento: {formatDate(patient.dateOfBirth)}</span>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Registration Info */}
              <div className="text-sm text-gray-500 space-y-1">
                <p>📅 Registrado: {formatDate(patient.createdAt)}</p>
                <p>🔄 Última actualización: {formatDate(patient.updatedAt)}</p>
              </div>

              <hr className="border-gray-200" />

              {/* Actions */}
              <div className="space-y-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md">
                  <Edit className="h-4 w-4" />
                  Editar paciente
                </Button>
                <Button variant="outline" className="w-full text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50 gap-2">
                  <Trash2 className="h-4 w-4" />
                  Eliminar paciente
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Consultations Card */}
          <Card className="lg:col-span-2 border border-gray-200 shadow-lg bg-white">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <FileText className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">
                      Consultas médicas
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                      {consultations.length} consultas registradas
                    </CardDescription>
                  </div>
                </div>
                <Button 
                  className="bg-teal-600 hover:bg-teal-700 text-white gap-2 shadow-md"
                  onClick={() => router.push(`/pacientes/${patient.dni}/nueva-consulta`)}
                >
                  <Plus className="h-4 w-4" />
                  Nueva consulta
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {consultations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Heart className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sin consultas registradas
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Este paciente aún no tiene consultas médicas registradas.
                  </p>
                  <Button 
                    className="bg-teal-600 hover:bg-teal-700 text-white gap-2 shadow-md"
                    onClick={() => router.push(`/pacientes/${patient.dni}/nueva-consulta`)}
                  >
                    <Plus className="h-4 w-4" />
                    Crear primera consulta
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {consultations.map((consultation) => (
                    <div 
                      key={consultation.id}
                      className="p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer bg-white"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">
                              {consultation.title}
                            </h4>
                            <Badge className={`${getStatusColor(consultation.status)} border`}>
                              {getStatusText(consultation.status)}
                            </Badge>
                          </div>
                          {consultation.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {consultation.description}
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {formatDate(consultation.date)}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => router.push(`/pacientes/${patient.dni}/consultas/${consultation.id}`)}
                          className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                        >
                          Ver detalles
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 MediSense - Sistema de Gestión Médica</p>
        </div>
      </div>
    </div>
  );
}
