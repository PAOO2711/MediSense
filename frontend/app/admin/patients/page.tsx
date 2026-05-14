import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AdminHeader } from '@/components/admin/admin-header';
import { CreatePatientFormPanel } from '@/components/admin/create-patient-form-panel';
import { Button } from '@/components/ui/button';

export default function AdminPatientsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <AdminHeader subtitle="Panel de administración - Alta de pacientes" />

      <div className="container mx-auto px-4 py-8">
        <Button asChild variant="ghost" className="mb-4 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al panel admin
          </Link>
        </Button>

        <CreatePatientFormPanel />
      </div>
    </main>
  );
}