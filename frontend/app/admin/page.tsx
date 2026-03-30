'use client';

import { FormEvent, useState } from 'react';
import { logout } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity, ShieldCheck, Stethoscope, UserPlus } from 'lucide-react';

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? 'No se pudo crear el usuario');
        return;
      }

      setMessage(`Médico creado: ${result.email}`);
      setEmail('');
      setPassword('');
    } catch {
      setError('Error de red al crear el usuario');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">MediSense</h1>
              <p className="text-sm text-blue-100">Panel de administración</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Activity className="h-5 w-5 animate-pulse text-green-300" />
              <span className="text-sm text-blue-100">Sistema activo</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void logout();
              }}
              className="ml-6 border-white text-white hover:bg-white hover:text-teal-600"
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
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
            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email del médico</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
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
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="border-gray-300 bg-white text-gray-900"
                />
              </div>

              <Button
                className="w-full bg-teal-600 text-white hover:bg-teal-700"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creando usuario...' : 'Crear médico'}
              </Button>
            </form>

            {message ? (
              <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {message}
              </div>
            ) : null}

            {error ? (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
