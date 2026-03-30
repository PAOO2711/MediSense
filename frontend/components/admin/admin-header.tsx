'use client';

import { logout } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Activity, Stethoscope } from 'lucide-react';

type AdminHeaderProps = {
  subtitle: string;
};

export function AdminHeader({ subtitle }: AdminHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">MediSense</h1>
            <p className="text-sm text-blue-100">{subtitle}</p>
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
  );
}