'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, signupSchema } from '@/lib/schemas/auth'

// Tipo de respuesta de las acciones
type ActionResponse = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

/**
 * Server Action para iniciar sesión
 */
export async function login(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const rawData = {
      email: formData.get('email'),
      password: formData.get('password'),
    }

    // Validar con Zod
    const validatedData = loginSchema.safeParse(rawData)

    if (!validatedData.success) {
      return {
        success: false,
        fieldErrors: validatedData.error.flatten().fieldErrors,
      }
    }

    const { email, password } = validatedData.data

    // Autenticar con Supabase
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        error: error.message === 'Invalid login credentials'
          ? 'Credenciales inválidas'
          : 'Error al iniciar sesión. Intenta de nuevo.',
      }
    }

    // Revalidar y redirigir
    revalidatePath('/', 'layout')
    redirect('/pacientes')
  } catch (error) {
    // Si es un redirect, lo dejamos pasar
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }

    return {
      success: false,
      error: 'Error inesperado. Intenta de nuevo.',
    }
  }
}

/**
 * Server Action para registrarse
 */
export async function signup(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const rawData = {
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    }

    // Validar con Zod
    const validatedData = signupSchema.safeParse(rawData)

    if (!validatedData.success) {
      return {
        success: false,
        fieldErrors: validatedData.error.flatten().fieldErrors,
      }
    }

    const { email, password } = validatedData.data

    // Registrar con Supabase
    const supabase = await createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        error: error.message === 'User already registered'
          ? 'Este correo ya está registrado'
          : 'Error al registrarse. Intenta de nuevo.',
      }
    }

    // Revalidar y redirigir a login
    revalidatePath('/', 'layout')
    redirect('/login')
  } catch (error) {
    // Si es un redirect, lo dejamos pasar
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }

    return {
      success: false,
      error: 'Error inesperado. Intenta de nuevo.',
    }
  }
}

/**
 * Server Action para cerrar sesión
 */
export async function logout(): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: 'Error al cerrar sesión',
      }
    }

    revalidatePath('/', 'layout')
    redirect('/login')
  } catch (error) {
    // Si es un redirect, lo dejamos pasar
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }

    return {
      success: false,
      error: 'Error inesperado',
    }
  }
}
