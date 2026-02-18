'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Tipo de respuesta de las acciones
type ActionResponse = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

/**
 * Server Action para crear un nuevo paciente
 */
export async function createPatient(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const rawData = {
      dni: formData.get('dni'),
      name: formData.get('name'),
      email: formData.get('email'),
      dateOfBirth: formData.get('birthdate'),
      phone: formData.get('phone'),
    }

    // Crear paciente a través de la API
    const patient = await fetch('/api/patients/new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rawData),
    }).then(res => res.json())

    if (patient.error) {
      return {
        success: false,
        error: patient.error,
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
