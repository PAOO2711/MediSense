'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, UserCheck, UsersRound } from 'lucide-react';

type Patient = {
  dni: number;
  name: string;
  email: string | null;
  ownerId: string;
};

type Doctor = {
  id: string;
  name: string;
  surname: string;
  email: string;
};

type ListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

const PAGE_SIZE = 5;

function getDoctorDisplayName(doctor: Doctor) {
  const fullName = `${doctor.name} ${doctor.surname}`.trim();
  return fullName.length > 0 ? fullName : 'Médico sin nombre';
}

function getPatientDisplayName(patient: Patient) {
  const baseName = patient.name.trim();
  return baseName.length > 0 ? baseName : `Paciente ${patient.dni}`;
}

export function AssignPatientDoctorPanel() {
  const [patientSearch, setPatientSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patientMeta, setPatientMeta] = useState<ListMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [doctorMeta, setDoctorMeta] = useState<ListMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [patientPage, setPatientPage] = useState(1);
  const [doctorPage, setDoctorPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasPatientSearch = useMemo(() => patientSearch.trim().length > 0, [patientSearch]);
  const hasDoctorSearch = useMemo(() => doctorSearch.trim().length > 0, [doctorSearch]);

  const handlePatientSearchChange = (value: string) => {
    setPatientSearch(value);
    setPatientPage(1);
  };

  const handleDoctorSearchChange = (value: string) => {
    setDoctorSearch(value);
    setDoctorPage(1);
  };

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoadingPatients(true);
        const params = new URLSearchParams();
        if (patientSearch.trim()) {
          params.set('search', patientSearch.trim());
        }
        params.set('page', String(patientPage));
        params.set('pageSize', String(PAGE_SIZE));

        const response = await fetch(`/api/admin/patient-assignments?${params.toString()}`, {
          method: 'GET',
          signal: controller.signal,
        });

        const result = await response.json();
        if (!response.ok) {
          setPatients([]);
          setPatientMeta({
            page: patientPage,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: patientPage > 1,
          });
          return;
        }

        const nextPatients: Patient[] = Array.isArray(result.data) ? result.data : [];
        setPatients(nextPatients);
        setPatientMeta(
          result.page
            ? {
                page: result.page,
                limit: result.pageSize ?? PAGE_SIZE,
                total: result.total ?? nextPatients.length,
                totalPages: result.totalPages ?? 0,
                hasNextPage: (result.totalPages ?? 0) > (result.page ?? 1),
                hasPreviousPage: (result.page ?? 1) > 1,
              }
            : {
                page: patientPage,
                limit: PAGE_SIZE,
                total: nextPatients.length,
                totalPages: nextPatients.length > 0 ? 1 : 0,
                hasNextPage: false,
                hasPreviousPage: patientPage > 1,
              }
        );
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          return;
        }
        setPatients([]);
      } finally {
        setLoadingPatients(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [patientSearch, patientPage]);

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
        params.set('limit', String(PAGE_SIZE));

        const response = await fetch(`/api/admin/doctors?${params.toString()}`, {
          method: 'GET',
          signal: controller.signal,
        });

        const result = await response.json();
        if (!response.ok) {
          setDoctors([]);
          setDoctorMeta({
            page: doctorPage,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: doctorPage > 1,
          });
          return;
        }

        const nextDoctors: Doctor[] = Array.isArray(result.data) ? result.data : [];
        setDoctors(nextDoctors);
        setDoctorMeta(
          result.meta ?? {
            page: doctorPage,
            limit: PAGE_SIZE,
            total: nextDoctors.length,
            totalPages: nextDoctors.length > 0 ? 1 : 0,
            hasNextPage: false,
            hasPreviousPage: doctorPage > 1,
          }
        );
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          return;
        }
        setDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [doctorSearch, doctorPage]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!selectedPatient) {
      setError('Selecciona un paciente.');
      return;
    }

    if (!selectedDoctor) {
      setError('Selecciona un médico.');
      return;
    }

    setSavingAssignment(true);
    try {
      const response = await fetch('/api/admin/patient-assignments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dni: selectedPatient.dni,
          ownerId: selectedDoctor.id,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? 'No se pudo reasignar el paciente.');
        return;
      }

      setMessage(
        `Paciente ${getPatientDisplayName(selectedPatient)} asignado a ${getDoctorDisplayName(selectedDoctor)}.`
      );
      setSelectedPatient(null);
      setSelectedDoctor(null);
    } catch {
      setError('Error de red al reasignar el paciente.');
    } finally {
      setSavingAssignment(false);
    }
  }

  return (
    <Card className="mx-auto w-full border border-gray-200 bg-white shadow-lg">
      <CardHeader className="border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-violet-100 p-2">
            <UserCheck className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-gray-900">Asignación de médico a paciente</CardTitle>
            <CardDescription className="text-gray-500">
              Busca un paciente existente y asígnale un médico desde la columna derecha.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <UsersRound className="h-4 w-4 text-blue-600" />
              <Label className="text-sm font-medium text-gray-700">Buscar paciente</Label>
            </div>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={patientSearch}
                onChange={(event) => handlePatientSearchChange(event.target.value)}
                placeholder="Buscar por nombre, DNI o email..."
                className="pl-9 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 text-sm text-gray-600">
              <span>
                {patientMeta.total > 0 ? `Mostrando ${patients.length} de ${patientMeta.total}` : 'Sin resultados'}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300 bg-white text-gray-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                  disabled={loadingPatients || !patientMeta.hasPreviousPage}
                  onClick={() => setPatientPage((currentPage) => Math.max(1, currentPage - 1))}
                >
                  Anterior
                </Button>
                <span className="min-w-20 text-center text-xs uppercase tracking-wide text-gray-400">
                  Página {patientMeta.page} de {patientMeta.totalPages || 1}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300 bg-white text-gray-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                  disabled={loadingPatients || !patientMeta.hasNextPage}
                  onClick={() => setPatientPage((currentPage) => currentPage + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>

            <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {loadingPatients ? (
                <p className="text-sm text-gray-500">Buscando pacientes...</p>
              ) : patients.length === 0 ? (
                <p className="text-sm text-gray-500">
                  {hasPatientSearch ? 'No hay resultados para esa búsqueda.' : 'No se encontraron pacientes disponibles.'}
                </p>
              ) : (
                patients.map((patient) => {
                  const isSelected = selectedPatient?.dni === patient.dni;
                  return (
                    <button
                      key={patient.dni}
                      type="button"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setError(null);
                      }}
                      className={`w-full rounded-md border p-3 text-left transition ${
                        isSelected
                          ? 'border-violet-500 bg-violet-50'
                          : 'border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50/40'
                      }`}
                    >
                      <p className="font-medium text-gray-900">{getPatientDisplayName(patient)}</p>
                      <p className="mt-1 text-xs text-gray-500">DNI: {patient.dni}</p>
                      {patient.email ? <p className="mt-1 text-xs text-gray-500">{patient.email}</p> : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-teal-600" />
              <Label className="text-sm font-medium text-gray-700">Buscar médico</Label>
            </div>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={doctorSearch}
                onChange={(event) => handleDoctorSearchChange(event.target.value)}
                placeholder="Buscar por nombre, apellidos, email o DNI..."
                className="pl-9 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 text-sm text-gray-600">
              <span>
                {doctorMeta.total > 0 ? `Mostrando ${doctors.length} de ${doctorMeta.total}` : 'Sin resultados'}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300 bg-white text-gray-700 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                  disabled={loadingDoctors || !doctorMeta.hasPreviousPage}
                  onClick={() => setDoctorPage((currentPage) => Math.max(1, currentPage - 1))}
                >
                  Anterior
                </Button>
                <span className="min-w-20 text-center text-xs uppercase tracking-wide text-gray-400">
                  Página {doctorMeta.page} de {doctorMeta.totalPages || 1}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300 bg-white text-gray-700 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                  disabled={loadingDoctors || !doctorMeta.hasNextPage}
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
                  {hasDoctorSearch ? 'No hay resultados para esa búsqueda.' : 'No se encontraron médicos disponibles.'}
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
                        setError(null);
                      }}
                      className={`w-full rounded-md border p-3 text-left transition ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/40'
                      }`}
                    >
                      <p className="font-medium text-gray-900">{getDoctorDisplayName(doctor)}</p>
                      <p className="mt-1 text-xs text-gray-500">{doctor.email}</p>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="rounded-md border border-violet-100 bg-violet-50 px-3 py-2 text-sm text-violet-700">
            {selectedPatient && selectedDoctor ? (
              <div className="flex flex-wrap items-center gap-2">
                <span>Asignación preparada:</span>
                <Badge className="bg-white text-violet-700 hover:bg-white">{getPatientDisplayName(selectedPatient)}</Badge>
                <span>a</span>
                <Badge className="bg-white text-violet-700 hover:bg-white">{getDoctorDisplayName(selectedDoctor)}</Badge>
              </div>
            ) : (
              <span>Selecciona un paciente y un médico para confirmar la reasignación.</span>
            )}
          </div>

          <Button
            className="w-full bg-violet-600 text-white hover:bg-violet-700"
            type="submit"
            disabled={savingAssignment}
          >
            {savingAssignment ? 'Asignando...' : 'Asignar médico al paciente'}
          </Button>

          {message ? (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
