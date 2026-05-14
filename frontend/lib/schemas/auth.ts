import { z } from 'zod'

// Schemas de validacion con Zod
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es requerido')
    .email('Correo electronico invalido'),
  password: z
    .string()
    .min(6, 'La contrasena debe tener al menos 6 caracteres'),
})

export const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, 'El correo es requerido')
      .email('Correo electronico invalido'),
    password: z
      .string()
      .min(6, 'La contrasena debe tener al menos 6 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'La contraseña debe contener al menos una mayuscula, una minuscula y un numero'
      ),
    confirmPassword: z.string().min(1, 'Confirma tu contrasena'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contrasenas no coinciden',
    path: ['confirmPassword'],
  })

// Tipos derivados de los schemas
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
