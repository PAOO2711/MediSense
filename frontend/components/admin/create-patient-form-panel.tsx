'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, UserCheck, UsersRound } from 'lucide-react';

type Doctor = {
  id: string;
  name: string;
  surname: string;
  email: string;
};

type DoctorsMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

const DOCTORS_PAGE_SIZE = 5;

export function CreatePatientFormPanel() {
  const [dni, setDni] = useState('');
  const [name, setName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsMeta, setDoctorsMeta] = useState<DoctorsMeta>({
    page: 1,
    limit: DOCTORS_PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [doctorPage, setDoctorPage] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [creatingPatient, setCreatingPatient] = useState(false);
  const [patientMessage, setPatientMessage] = useState<string | null>(null);
  const [patientError, setPatientError] = useState<string | null>(null);

  const hasDoctorSearch = useMemo(() => doctorSearch.trim().length > 0, [doctorSearch]);

  const getDoctorDisplayName = (doctor: Doctor) => {
    const fullName = `${doctor.name} ${doctor.surname}`.trim();
    return fullName.length > 0 ? fullName : 'Médico sin nombre';
  };

  const handleDoctorSearchChange = (value: string) => {
    setDoctorSearch(value);
    setDoctorPage(1);
  };

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoadingDoctors(true);
        const params = new URLSearchParams();
        if (doctorSearch.trim()) {
          params.set('q', doctorSearch.trim());
        }
        params.set('page', String(doctorPage));
        params.set('limit', String(DOCTORS_PAGE_SIZE));
        const response = await fetch(`/api/admin/doctors?${params.toString()}`, {
          method: 'GET',
          signal: controller.signal,
        });

        const result = await response.json();
        if (!response.ok) {
          setDoctors([]);
          return;
        }

        const nextDoctors: Doctor[] = Array.isArray(result.data) ? result.data : [];
        setDoctors(nextDoctors);
        setDoctorsMeta(
          result.meta ?? {
            page: doctorPage,
            limit: DOCTORS_PAGE_SIZE,
            total: nextDoctors.length,
            totalPages: nextDoctors.length > 0 ? 1 : 0,
            hasNextPage: false,
            hasPreviousPage: doctorPage > 1,
          }
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        setDoctors([]);
        setDoctorsMeta({
          page: doctorPage,
          limit: DOCTORS_PAGE_SIZE,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: doctorPage > 1,
        });
      } finally {
        setLoadingDoctors(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [doctorSearch, doctorPage]);

  async function onPatientSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPatientMessage(null);
    setPatientError(null);

    if (!selectedDoctor) {
      setPatientError('Selecciona un médico para asignar el ownerId.');
      return;
    }

    setCreatingPatient(true);
    try {
      const response = await fetch('/api/admin/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dni,
          name,
          email: patientEmail,
          phone,
          dateOfBirth,
          ownerId: selectedDoctor.id,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setPatientError(result.error ?? 'No se pudo crear el paciente.');
        return;
      }

      setPatientMessage(`Paciente ${result.name} creado y vinculado a ${selectedDoctor.email}.`);
      setDni('');
      setName('');
      setPatientEmail('');
      setPhone('');
      setDateOfBirth('');
      setSelectedDoctor(null);
    } catch {
      setPatientError('Error de red al crear el paciente.');
    } finally {
      setCreatingPatient(false);
    }
  }

  return (
    <Card className="mx-auto w-full border border-gray-200 bg-white shadow-lg">
      <CardHeader className="border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <UsersRound className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-gray-900">Alta de pacientes con asignación de médico</CardTitle>
            <CardDescription className="text-gray-500">
              Crea un paciente y vincúlalo a un médico existente.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <form className="space-y-4" onSubmit={onPatientSubmit}>
            <div className="space-y-2">
              <Label htmlFor="patient-dni" className="text-gray-700">DNI</Label>
              <Input
                id="patient-dni"
                required
                value={dni}
                onChange={(event) => setDni(event.target.value)}
                placeholder="12345678"
                className="border-gray-300 bg-white text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient-name" className="text-gray-700">Nombre completo</Label>
              <Input
                id="patient-name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nombre del paciente"
                className="border-gray-300 bg-white text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient-email" className="text-gray-700">Correo electrónico</Label>
              <Input
                id="patient-email"
                type="email"
                value={patientEmail}
                onChange={(event) => setPatientEmail(event.target.value)}
                placeholder="paciente@correo.com"
                className="border-gray-300 bg-white text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient-phone" className="text-gray-700">Teléfono</Label>
              <Input
                id="patient-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="600123123"
                className="border-gray-300 bg-white text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient-dob" className="text-gray-700">Fecha de nacimiento</Label>
              <Input
                id="patient-dob"
                type="date"
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
                className="border-gray-300 bg-white text-gray-900"
              />
            </div>

            <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
              {selectedDoctor ? (
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  <span>Médico asignado:</span>
                  <Badge className="bg-white text-blue-700 hover:bg-white">{getDoctorDisplayName(selectedDoctor)}</Badge>
                </div>
              ) : (
                <span>Selecciona un médico en la columna derecha para asignárselo a un paciente.</span>
              )}
            </div>

            <Button
              className="w-full bg-teal-600 text-white hover:bg-teal-700"
              type="submit"
              disabled={creatingPatient}
            >
              {creatingPatient ? 'Creando paciente...' : 'Crear paciente y vincular médico'}
            </Button>

            {patientMessage ? (
              <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {patientMessage}
              </div>
            ) : null}

            {patientError ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {patientError}
              </div>
            ) : null}
          </form>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={doctorSearch}
                onChange={(event) => handleDoctorSearchChange(event.target.value)}
                placeholder="Buscar médico por nombre, apellidos, email o id..."
                className="pl-9 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 text-sm text-gray-600">
              <span>
                {doctorsMeta.total > 0
                  ? `Mostrando ${doctors.length} de ${doctorsMeta.total}`
                  : 'Sin resultados'}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300 bg-white text-gray-700 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                  disabled={loadingDoctors || !doctorsMeta.hasPreviousPage}
                  onClick={() => setDoctorPage((currentPage) => Math.max(1, currentPage - 1))}
                >
                  Anterior
                </Button>
                <span className="min-w-20 text-center text-xs uppercase tracking-wide text-gray-400">
                  Página {doctorsMeta.page} de {doctorsMeta.totalPages || 1}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300 bg-white text-gray-700 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                  disabled={loadingDoctors || !doctorsMeta.hasNextPage}
                  onClick={() => setDoctorPage((currentPage) => currentPage + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>

            <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {loadingDoctors ? (
                <p className="text-sm text-gray-500">Buscando médicos...</p>
              ) : doctors.length === 0 ? (
                <p className="text-sm text-gray-500">
                  {hasDoctorSearch
                    ? 'No hay resultados para esa búsqueda.'
                    : 'No se encontraron médicos disponibles.'}
                </p>
              ) : (
                doctors.map((doctor) => {
                  const isSelected = selectedDoctor?.id === doctor.id;
                  return (
                    <button
                      key={doctor.id}
                      type="button"
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setPatientError(null);
                      }}
                      className={`w-full rounded-md border p-3 text-left transition ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/40'
                      }`}
                    >
                      <p className="font-medium text-gray-900">{getDoctorDisplayName(doctor)}</p>
                      <p className="mt-1 text-xs text-gray-500">{doctor.email || 'Sin email'}</p>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}