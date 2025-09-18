'use client'

import { useAuth } from '@/components/providers/auth-provider'
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
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

const emailFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const phoneFormSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(8),
})

type EmailFormData = z.infer<typeof emailFormSchema>
type PhoneFormData = z.infer<typeof phoneFormSchema>

export function AuthLoginForm() {
  const t = useTranslations('auth')
  const { signIn } = useAuth()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: {
      phone: '',
      password: '',
    },
  })

  const onEmailSubmit = async (data: EmailFormData) => {
    try {
      await signIn('email', {
        email: data.email,
        password: data.password,
      })
      toast.success(t('login.success'), {
        description: t('login.redirecting'),
      })
    } catch (error) {
      toast({
        title: t('login.error'),
        description: t('login.invalidCredentials'),
        variant: 'destructive',
      })
    }
  }

  const onPhoneSubmit = async (data: PhoneFormData) => {
    try {
      await signIn('phone', {
        phone: data.phone,
        password: data.password,
      })
      toast({
        title: t('login.success'),
        description: t('login.redirecting'),
      })
    } catch (error) {
      toast({
        title: t('login.error'),
        description: t('login.invalidCredentials'),
        variant: 'destructive',
      })
    }
  }

  const onGoogleSignIn = async () => {
    try {
      await signIn('google')
    } catch (error) {
      toast({
        title: t('login.error'),
        description: t('login.googleError'),
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="grid gap-6">
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">{t('login.withEmail')}</TabsTrigger>
          <TabsTrigger value="phone">{t('login.withPhone')}</TabsTrigger>
        </TabsList>
        <TabsContent value="email">
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('login.email')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={emailForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('login.password')}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {t('login.signIn')}
              </Button>
            </form>
          </Form>
        </TabsContent>
        <TabsContent value="phone">
          <Form {...phoneForm}>
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
              <FormField
                control={phoneForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('login.phone')}</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+212600000000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={phoneForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('login.password')}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {t('login.signIn')}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t('login.orContinueWith')}
          </span>
        </div>
      </div>
      <Button variant="outline" type="button" onClick={onGoogleSignIn}>
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
        {t('login.googleSignIn')}
      </Button>
    </div>
  )
}
