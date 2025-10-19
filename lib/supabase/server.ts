/**
 * Cliente Supabase para uso no lado do servidor (Server Components, API Routes)
 *
 * Este arquivo configura o cliente do Supabase para ser usado em Server Components
 * e API Routes. Ele gerencia cookies de forma adequada usando o Next.js cookies().
 *
 * Uso em Server Component:
 * import { createClient } from '@/lib/supabase/server'
 * const supabase = createClient()
 * const { data, error } = await supabase.from('transactions').select()
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
