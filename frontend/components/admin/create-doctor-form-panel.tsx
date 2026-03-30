'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, UserPlus } from 'lucide-react';

export function CreateDoctorFormPanel() {
  const [doctorEmail, setDoctorEmail] = useState('');
  const [doctorPassword, setDoctorPassword] = useState('');
  const [creatingDoctor, setCreatingDoctor] = useState(false);
  const [doctorMessage, setDoctorMessage] = useState<string | null>(null);
  const [doctorError, setDoctorError] = useState<string | null>(null);

  async function onDoctorSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreatingDoctor(true);
    setDoctorMessage(null);
    setDoctorError(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: doctorEmail, password: doctorPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        setDoctorError(result.error ?? 'No se pudo crear el usuario');
        return;
      }

      setDoctorMessage(`Médico creado: ${result.email}`);
      setDoctorEmail('');
      setDoctorPassword('');
    } catch {
      setDoctorError('Error de red al crear el usuario');
    } finally {
      setCreatingDoctor(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-3xl border border-gray-200 bg-white shadow-lg">
      <CardHeader className="border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-100 p-2">
              <ShieldCheck className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">Gestión de médicos</CardTitle>
              <CardDescription className="text-gray-500">
                Crea cuentas de médico con rol user
              </CardDescription>
            </div>
          </div>
          <Button className="bg-teal-600 text-white hover:bg-teal-700" disabled>
            <UserPlus className="mr-2 h-4 w-4" />
            Alta de médico
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form className="space-y-5" onSubmit={onDoctorSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">Email del médico</Label>
            <Input
              id="email"
              type="email"
              required
              value={doctorEmail}
              onChange={(event) => setDoctorEmail(event.target.value)}
              placeholder="medico@clinic.com"
              className="border-gray-300 bg-white text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">Contraseña inicial</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={doctorPassword}
              onChange={(event) => setDoctorPassword(event.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="border-gray-300 bg-white text-gray-900"
            />
          </div>

          <Button
            className="w-full bg-teal-600 text-white hover:bg-teal-700"
            type="submit"
            disabled={creatingDoctor}
          >
            {creatingDoctor ? 'Creando usuario...' : 'Crear médico'}
          </Button>
        </form>

        {doctorMessage ? (
          <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {doctorMessage}
          </div>
        ) : null}

        {doctorError ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {doctorError}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}