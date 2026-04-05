'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  UserPlus,
  Stethoscope,
  Activity
} from 'lucide-react';
import type { Patient } from '@/types/consultation';
import { logout } from '@/app/actions/auth';

type SortBy = 'name' | 'dni' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function PacientesPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        sortBy,
        sortOrder,
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      const response = await fetch(`/api/patients?${params}`, {
        method: 'GET',
      });
      const result = await response.json();

      if (!response.ok) {
        setPatients([]);
        setTotalPages(1);
        setTotal(0);
        return;
      }
      
      setPatients(Array.isArray(result.data) ? result.data : []);
      setTotalPages(typeof result.totalPages === 'number' && result.totalPages > 0 ? result.totalPages : 1);
      setTotal(typeof result.total === 'number' ? result.total : 0);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSort = (column: SortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const getSortIcon = (column: SortBy) => {
    if (sortBy !== column) return <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />;
    return sortOrder === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4 text-teal-600" /> 
      : <ArrowDown className="ml-2 h-4 w-4 text-teal-600" />;
  };

  const handleLogout = async () => {
    try {
      const response = await logout();
      if (response.success) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleViewPatient = (dni: string) => {
    router.push(`/pacientes/${dni}`);
  };

  const handleCreatePatient = () => {
    router.push('/pacientes/new');
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="ml-6 border-white text-white hover:bg-white hover:text-teal-600"
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">
        <Card className="border border-gray-200 shadow-lg bg-white">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Users className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">
                    Pacientes
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    {total} pacientes registrados
                  </CardDescription>
                </div>
              </div>
              {/* <Button 
                onClick={handleCreatePatient}
                className="bg-teal-600 hover:bg-teal-700 text-white gap-2 shadow-md">
                <UserPlus className="h-4 w-4" />
                Nuevo Paciente
              </Button> */}
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre o DNI..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-50 to-teal-50 hover:from-blue-50 hover:to-teal-50">
                    <TableHead 
                      className="cursor-pointer select-none font-semibold text-gray-700"
                      onClick={() => handleSort('dni')}
                    >
                      <div className="flex items-center">
                        DNI
                        {getSortIcon('dni')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer select-none font-semibold text-gray-700"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Nombre
                        {getSortIcon('name')}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Email
                    </TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="bg-white">
                        <TableCell>
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : patients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center bg-white">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="h-8 w-8 text-gray-300" />
                          <p className="text-gray-600">No se encontraron pacientes</p>
                          {search && (
                            <p className="text-sm text-gray-400">
                              Intenta con otro término de búsqueda
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    patients.map((patient, index) => (
                      <TableRow 
                        key={patient.dni}
                        className={`hover:bg-teal-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                      >
                        <TableCell className="font-mono">
                          <Badge variant="outline" className="font-mono bg-blue-50 text-blue-700 border-blue-200">
                            {patient.dni}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">
                          {patient.name}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {patient.email || (
                            <span className="text-gray-400 italic">Sin email</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewPatient(patient.dni)}
                            className="text-teal-600 hover:text-teal-700 hover:bg-teal-100 gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Ver detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  Mostrando {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} de {total} pacientes
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="h-8 w-8 p-0 border-gray-300 text-gray-600"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="h-8 w-8 p-0 border-gray-300 text-gray-600"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1 mx-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className={`h-8 w-8 p-0 ${
                            page === pageNum 
                              ? 'bg-teal-600 hover:bg-teal-700 text-white border-teal-600' 
                              : 'border-gray-300 text-gray-600'
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="h-8 w-8 p-0 border-gray-300 text-gray-600"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="h-8 w-8 p-0 border-gray-300 text-gray-600"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 MediSense - Sistema de Gestión Médica</p>
        </div>
      </div>
    </div>
  );
}
