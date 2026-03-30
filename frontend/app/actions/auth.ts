'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
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

    await auth.api.signInEmail({
      headers: await headers(),
      body: {
        email,
        password,
      },
    })

    // Revalidar y redirigir
    revalidatePath('/', 'layout')
    redirect('/pacientes')
  } catch (error) {
    // Si es un redirect, lo dejamos pasar
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }

    if (
      error instanceof Error &&
      error.message.toLowerCase().includes('invalid')
    ) {
      return {
        success: false,
        error: 'Credenciales inválidas',
      }
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

    await auth.api.signUpEmail({
      headers: await headers(),
      body: {
        email,
        password,
        name: email.split('@')[0],
      },
    })

    // Revalidar y redirigir a login
    revalidatePath('/', 'layout')
    redirect('/login')
  } catch (error) {
    // Si es un redirect, lo dejamos pasar
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }

    if (
      error instanceof Error &&
      error.message.toLowerCase().includes('exist')
    ) {
      return {
        success: false,
        error: 'Este correo ya está registrado',
      }
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
    await auth.api.signOut({
      headers: await headers(),
    })

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
