import * as z from 'zod';

export const emailLoginSchema = z.object({
  email: z.string()
    .min(1, { message: 'auth.validation.email_required' })
    .email({ message: 'auth.validation.email_invalid' }),
  password: z.string()
    .min(8, { message: 'auth.validation.password_min_length' })
    .max(100, { message: 'auth.validation.password_max_length' })
})

export const phoneLoginSchema = z.object({
  phone: z.string()
    .min(1, { message: 'auth.validation.phone_required' })
    .regex(/^\+[1-9]\d{1,14}$/, { message: 'auth.validation.phone_invalid' }),
  password: z.string()
    .min(8, { message: 'auth.validation.password_min_length' })
    .max(100, { message: 'auth.validation.password_max_length' })
})

export const registerSchema = z.object({
  email: z.string()
    .min(1, { message: 'auth.validation.email_required' })
    .email({ message: 'auth.validation.email_invalid' }),
  phone: z.string()
    .min(1, { message: 'auth.validation.phone_required' })
    .regex(/^\+[1-9]\d{1,14}$/, { message: 'auth.validation.phone_invalid' }),
  password: z.string()
    .min(8, { message: 'auth.validation.password_min_length' })
    .max(100, { message: 'auth.validation.password_max_length' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: 'auth.validation.password_requirements'
    }),
  confirmPassword: z.string()
    .min(1, { message: 'auth.validation.confirm_password_required' })
})
.refine((data) => data.password === data.confirmPassword, {
  message: 'auth.validation.passwords_must_match',
  path: ['confirmPassword']
})
