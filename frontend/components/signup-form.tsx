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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { HeartPulse, ShieldCheck } from "lucide-react"
import { signup } from "@/app/actions/auth"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      className="w-full bg-teal-600 text-white hover:bg-teal-700"
      disabled={pending}
    >
      {pending ? "Registrando..." : "Registrarse"}
    </Button>
  )
}

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, formAction] = useActionState(signup, null)

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
              Bienvenido a MediSense
            </CardTitle>
            <CardDescription className="text-slate-500">
              Registrate para gestionar pacientes y consultas con seguridad.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <form className="space-y-6" action={formAction}>
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="email" className="text-slate-700">
                  Correo institucional
                </FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nombre@hospital.com"
                  className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500"
                  required
                />
                {state?.fieldErrors?.email && (
                  <p className="text-sm text-red-600">
                    {state.fieldErrors.email[0]}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="password" className="text-slate-700">
                  Contraseña
                </FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500"
                  required
                />
                {state?.fieldErrors?.password && (
                  <p className="text-sm text-red-600">
                    {state.fieldErrors.password[0]}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword" className="text-slate-700">
                  Confirmar contraseña
                </FieldLabel>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500"
                  required
                />
                {state?.fieldErrors?.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {state.fieldErrors.confirmPassword[0]}
                  </p>
                )}
              </Field>
            </FieldGroup>

            <div className="space-y-3 pt-2">
              <SubmitButton />
              {state?.error && (
                <p className="text-center text-sm text-red-600">
                  {state.error}
                </p>
              )}
              <FieldDescription className="text-center text-slate-500">
                Ya tienes una cuenta?{" "}
                <a href="/login" className="text-teal-600 hover:text-teal-800">
                  Inicia sesión
                </a>
              </FieldDescription>
            </div>
          </form>

          <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <div className="flex items-center gap-2 text-slate-700">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              Acceso cifrado y cumplimiento de normativas sanitarias.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
