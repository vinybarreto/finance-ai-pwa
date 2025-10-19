/**
 * Cliente Supabase para uso no lado do cliente (Client Components)
 *
 * Este arquivo configura o cliente do Supabase para ser usado em componentes React
 * que rodam no navegador. Ele usa as variáveis de ambiente públicas (NEXT_PUBLIC_*)
 * para conectar ao projeto Supabase.
 *
 * Uso:
 * import { supabase } from '@/lib/supabase/client'
 * const { data, error } = await supabase.from('transactions').select()
 */

import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton instance para uso direto (não recomendado em todos os casos)
export const supabase = createClient()
