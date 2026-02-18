"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { HeartPulse } from "lucide-react"

export function CreatePatientForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const dni = formData.get('dni')
      const name = formData.get('name')
      const email = formData.get('email')
      const birthdate = formData.get('birthdate')
      const phone = formData.get('phone')

      // Convertir fecha si viene en formato MM/DD/YYYY
      let dateOfBirth = birthdate
      if (typeof birthdate === 'string' && birthdate && birthdate.includes('/')) {
        const [month, day, year] = birthdate.split('/')
        dateOfBirth = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }

      const response = await fetch('/api/patients/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dni,
          name,
          email,
          dateOfBirth,
          phone,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        setError(data.error || 'Error al crear el paciente')
        return
      }

      // Éxito - redirigir
      router.push('/pacientes')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="relative min-h-[560px] overflow-hidden border border-slate-200 bg-white shadow-xl">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-400" />
        <CardHeader className="gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-teal-700">
            <HeartPulse className="h-4 w-4" />
            Acceso clinico
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl text-slate-900">
              Crear nuevo paciente
            </CardTitle>
            <CardDescription className="text-slate-500">
              Ingresa los datos del paciente para agregarlo a la plataforma.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="dni" className="text-slate-700">
                  DNI
                </FieldLabel>
                <Input
                  id="dni"
                  name="dni"
                  type="text"
                  placeholder="12345678"
                  className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500"
                  required
                  disabled={loading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="name" className="text-slate-700">
                  Nombre completo
                </FieldLabel>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Juan Pérez"
                  className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500"
                  required
                  disabled={loading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email" className="text-slate-700">
                  Correo electrónico
                </FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nombre@hospital.com"
                  className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500"
                  required
                  disabled={loading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="birthdate" className="text-slate-700">
                  Fecha de nacimiento
                </FieldLabel>
                <Input
                  id="birthdate"
                  name="birthdate"
                  type="text"
                  placeholder="12/31/1990"
                  className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500"
                  required
                  disabled={loading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone" className="text-slate-700">
                  Teléfono
                </FieldLabel>
                <Input
                  id="phone"
                  name="phone"
                  type="text"
                  placeholder="123-456-7890"
                  className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500"
                  required
                  disabled={loading}
                />
              </Field>
            </FieldGroup>

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full bg-teal-600 text-white hover:bg-teal-700"
                disabled={loading}
              >
                {loading ? "Creando..." : "Crear paciente"}
              </Button>
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                  <p className="font-semibold">Error:</p>
                  <p className="mt-1">{error}</p>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
