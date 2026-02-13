import { SignUpForm } from "@/components/signup-form"
import { Activity, Stethoscope } from "lucide-react"

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">MediSense</h1>
              <p className="text-sm text-blue-100">
                Acceso seguro a la plataforma clinica
              </p>
            </div>
            <div className="ml-auto hidden items-center gap-2 sm:flex">
              <Activity className="h-5 w-5 animate-pulse text-green-300" />
              <span className="text-sm text-blue-100">Sistema activo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <SignUpForm />
        </div>
      </div>
    </div>
  )
}
