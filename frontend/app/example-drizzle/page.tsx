'use client';

import { useState } from 'react';
import { createPatient, getPatients, processConsultation } from '@/lib/db/queries/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ExampleUsage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Ejemplo 1: Crear un paciente
  const handleCreatePatient = async () => {
    setLoading(true);
    try {
      const newPatient = await createPatient({
        dni: 12345678,
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '+34 600 000 000',
      });
      console.log('Paciente creado:', newPatient);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ejemplo 2: Obtener todos los pacientes
  const handleGetPatients = async () => {
    setLoading(true);
    try {
      const allPatients = await getPatients();
      setPatients(allPatients);
      console.log('Pacientes:', allPatients);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ejemplo 3: Procesar una consulta completa con audio
  const handleProcessConsultation = async (audioFile: File) => {
    setLoading(true);
    try {
      const result = await processConsultation({
        patientId: 12345678, // ID del paciente
        title: 'Consulta de seguimiento',
        description: 'Revisión de síntomas',
        audioFile: audioFile,
      });
      console.log('Consulta procesada:', result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Ejemplo de uso de Drizzle ORM</h1>

      <div className="space-x-2">
        <Button onClick={handleCreatePatient} disabled={loading}>
          Crear Paciente
        </Button>
        <Button onClick={handleGetPatients} disabled={loading}>
          Obtener Pacientes
        </Button>
      </div>

      {patients.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Pacientes:</h2>
          <ul className="space-y-2">
            {patients.map((patient) => (
              <li key={patient.dni} className="p-3 bg-secondary text-secondary-foreground rounded-lg border">
                <span className="font-medium">{patient.name}</span>
                {patient.email && <span className="text-muted-foreground"> - {patient.email}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Subir Audio para Consulta:</h2>
        <Input
          type="file"
          accept="audio/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleProcessConsultation(file);
            }
          }}
          disabled={loading}
        />
      </div>
    </div>
  );
}
