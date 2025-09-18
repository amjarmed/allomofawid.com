'use client'

import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

const phoneRegex = /^\+212[567]\d{8}$/

const registerSchema = z.object({
  full_name: z.string().min(2).max(50),
  email: z.string().email().optional(),
  phone: z.string().regex(phoneRegex, 'Invalid Moroccan phone number').optional(),
  password: z.string().min(8),
  confirm_password: z.string()
}).superRefine(({ email, phone, password, confirm_password }, ctx) => {
  if (!email && !phone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Either email or phone is required',
      path: ['email']
    })
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Either email or phone is required',
      path: ['phone']
    })
  }
  if (password !== confirm_password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Passwords do not match',
      path: ['confirm_password']
    })
  }
})

type RegisterData = z.infer<typeof registerSchema>

export function AuthRegisterForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [method, setMethod] = React.useState<'email' | 'phone'>('email')
  const supabase = createClient()

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      password: '',
      confirm_password: '',
    },
  })

  const onSubmit = async (data: RegisterData) => {
    try {
      const { error } = method === 'email'
        ? await supabase.auth.signUp({
            email: data.email!,
            password: data.password,
            options: {
              data: {
                full_name: data.full_name,
              },
            },
          })
        : await supabase.auth.signUp({
            phone: data.phone!,
            password: data.password,
            options: {
              data: {
                full_name: data.full_name,
              },
            },
          })

      if (error) throw error

      toast.success(t('register.success'), {
        description: t('register.verificationSent')
      })

      // Redirect to verification page or dashboard
      router.push('/auth/verify')
    } catch (error) {
      toast.error(t('register.error'), {
        description: t('register.errorMessage')
      })
    }
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('register.fullName')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Tabs value={method} onValueChange={(value) => setMethod(value as 'email' | 'phone')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">{t('register.withEmail')}</TabsTrigger>
              <TabsTrigger value="phone">{t('register.withPhone')}</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('register.email')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            <TabsContent value="phone">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('register.phone')}</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+212600000000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('register.password')}</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirm_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('register.confirmPassword')}</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            {t('register.createAccount')}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t('register.orContinueWith')}
          </span>
        </div>
      </div>

      <Button variant="outline" type="button" onClick={() => supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })}>
        <svg
          className="mr-2 h-4 w-4"
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="google"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 488 512"
        >
          <path
            fill="currentColor"
            d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
          ></path>
        </svg>
        {t('register.googleSignUp')}
      </Button>
    </div>
  )
}
