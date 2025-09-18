import { Database } from '@/lib/types/supabase'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookieStore = cookies()
          return cookieStore.get(name)?.value
        },
        set: async (name: string, value: string, options: CookieOptions) => {
          const cookieStore = await cookies()
          cookieStore.set(name, value)
        },
        remove: async (name: string) => {
          const cookieStore = await cookies()
          cookieStore.delete(name)
        }
      }
    }
  )
}
        }
      }
    }
  )
}

export const createClient = createServerComponentClient
      }
    }
  )
}
        }
        }
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie error
          }
        },
      },
    }
  )
}
