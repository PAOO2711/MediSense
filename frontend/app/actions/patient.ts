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

    console.log('Datos recibidos en createPatient:', rawData)

    // Convertir fecha si viene en formato MM/DD/YYYY
    let dateOfBirth = rawData.dateOfBirth
    if (typeof dateOfBirth === 'string' && dateOfBirth) {
      // Si es formato MM/DD/YYYY, convertir a YYYY-MM-DD
      if (dateOfBirth.includes('/')) {
        const [month, day, year] = dateOfBirth.split('/')
        dateOfBirth = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }
    }

    const dataToSend = {
      dni: rawData.dni,
      name: rawData.name,
      email: rawData.email,
      phone: rawData.phone,
      dateOfBirth: dateOfBirth,
    }

    console.log('Datos a enviar a API:', dataToSend)

    // Crear paciente a través de la API
    const response = await fetch('/api/patients/new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    })

    const patient = await response.json()

    // Verificar si hubo error en la respuesta
    if (!response.ok || patient.error) {
      return {
        success: false,
        error: patient.error || `Error ${response.status}: No se pudo crear el paciente`,
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
