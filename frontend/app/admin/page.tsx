import Link from 'next/link';
import { ArrowRight, ShieldCheck, UserPlus, UsersRound, UserCog } from 'lucide-react';
import { AdminHeader } from '@/components/admin/admin-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const actions = [
  {
    title: 'Crear nuevo médico',
    description: 'Alta de cuentas médicas para el sistema.',
    href: '/admin/doctors',
    icon: UserPlus,
    accent: 'from-teal-500 to-emerald-500',
    ring: 'group-hover:ring-teal-300',
  },
  {
    title: 'Crear nuevo paciente',
    description: 'Registro de paciente con asignación de médico.',
    href: '/admin/patients',
    icon: UsersRound,
    accent: 'from-blue-500 to-cyan-500',
    ring: 'group-hover:ring-blue-300',
  },
  {
    title: 'Asignar médico a paciente',
    description: 'Reasigna un paciente existente a otro médico.',
    href: '/admin/assignments',
    icon: UserCog,
    accent: 'from-violet-500 to-fuchsia-500',
    ring: 'group-hover:ring-violet-300',
  },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-white">
      <AdminHeader subtitle="Panel de administración" />

      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-5xl border border-gray-200 bg-white shadow-lg">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-teal-100 p-2">
                <ShieldCheck className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">Selecciona una gestión</CardTitle>
                <CardDescription className="text-gray-500">
                  Elige si quieres dar de alta un médico o registrar un nuevo paciente.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid gap-6 p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {actions.slice(0, 2).map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-2 ring-transparent transition hover:-translate-y-0.5 hover:shadow-md ${action.ring}`}
                  >
                    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${action.accent}`} />
                    <div className="flex items-start justify-between">
                      <div className="rounded-lg bg-gray-100 p-2">
                        <Icon className="h-5 w-5 text-gray-700" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-gray-700" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">{action.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{action.description}</p>
                  </Link>
                );
              })}
            </div>

            {actions[2] ? (
              <div className="mx-auto w-full md:max-w-md">
                {(() => {
                  const action = actions[2];
                  const Icon = action.icon;
                  return (
                    <Link
                      href={action.href}
                      className={`group relative block overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-2 ring-transparent transition hover:-translate-y-0.5 hover:shadow-md ${action.ring}`}
                    >
                      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${action.accent}`} />
                      <div className="flex items-start justify-between">
                        <div className="rounded-lg bg-gray-100 p-2">
                          <Icon className="h-5 w-5 text-gray-700" />
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-gray-700" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-gray-900">{action.title}</h3>
                      <p className="mt-2 text-sm text-gray-600">{action.description}</p>
                    </Link>
                  );
                })()}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
