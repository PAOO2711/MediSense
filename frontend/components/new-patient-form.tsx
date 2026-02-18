"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { HeartPulse } from "lucide-react"
import { createPatient } from "@/app/actions/patient"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      className="w-full bg-teal-600 text-white hover:bg-teal-700"
      disabled={pending}
    >
      {pending ? "Ingresando..." : "Ingresar"}
    </Button>
  )
}

export function CreatePatientForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const [state, formAction] = useActionState(createPatient, null)

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
          <form className="space-y-6" action={formAction}>
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
                />
              </Field>
            </FieldGroup>

            <div className="space-y-3">
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
