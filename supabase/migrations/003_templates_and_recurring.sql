/**
 * Migration 003 - Templates e Transações Recorrentes
 *
 * Adiciona:
 * - Tabela transaction_templates para templates de transações rápidas
 * - Campos de recorrência na tabela transactions
 * - RLS policies para templates
 */

-- =====================================================
-- TRANSACTION TEMPLATES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.transaction_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Template info
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- emoji ou ícone

  -- Transaction data
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  transaction_type public.transaction_type NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',

  -- Optional fields
  merchant TEXT,
  notes TEXT,
  tags TEXT[],

  -- Meta
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_transaction_templates_user ON public.transaction_templates(user_id);
CREATE INDEX idx_transaction_templates_times_used ON public.transaction_templates(times_used DESC);

-- Trigger para updated_at
CREATE TRIGGER update_transaction_templates_updated_at
  BEFORE UPDATE ON public.transaction_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RECURRING TRANSACTIONS
-- =====================================================

-- Adicionar colunas de recorrência na tabela transactions
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurrence_rule TEXT, -- RRULE format (RFC 5545)
ADD COLUMN IF NOT EXISTS parent_transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS next_occurrence DATE;

-- Índice para buscar transações recorrentes
CREATE INDEX idx_transactions_recurring ON public.transactions(is_recurring, next_occurrence)
  WHERE is_recurring = TRUE;

-- =====================================================
-- RLS POLICIES - TEMPLATES
-- =====================================================

ALTER TABLE public.transaction_templates ENABLE ROW LEVEL SECURITY;

-- SELECT: usuário pode ver apenas seus próprios templates
CREATE POLICY transaction_templates_select_policy
  ON public.transaction_templates
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: usuário pode criar templates para si mesmo
CREATE POLICY transaction_templates_insert_policy
  ON public.transaction_templates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: usuário pode atualizar apenas seus próprios templates
CREATE POLICY transaction_templates_update_policy
  ON public.transaction_templates
  FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: usuário pode deletar apenas seus próprios templates
CREATE POLICY transaction_templates_delete_policy
  ON public.transaction_templates
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

/**
 * Função para incrementar contador de uso do template
 */
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.transaction_templates
  SET
    times_used = times_used + 1,
    last_used_at = NOW()
  WHERE id = template_id;
END;
$$;

-- =====================================================
-- TEMPLATES PADRÃO DO SISTEMA
-- =====================================================

-- Função para criar templates padrão para novos usuários
CREATE OR REPLACE FUNCTION create_default_templates(p_user_id UUID, p_account_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_alimentacao_id UUID;
  v_transporte_id UUID;
  v_habitacao_id UUID;
  v_entretenimento_id UUID;
  v_salario_id UUID;
BEGIN
  -- Buscar categorias padrão
  SELECT id INTO v_alimentacao_id FROM public.categories WHERE name = 'Alimentação' AND user_id IS NULL LIMIT 1;
  SELECT id INTO v_transporte_id FROM public.categories WHERE name = 'Transporte' AND user_id IS NULL LIMIT 1;
  SELECT id INTO v_habitacao_id FROM public.categories WHERE name = 'Habitação' AND user_id IS NULL LIMIT 1;
  SELECT id INTO v_entretenimento_id FROM public.categories WHERE name = 'Entretenimento' AND user_id IS NULL LIMIT 1;
  SELECT id INTO v_salario_id FROM public.categories WHERE name = 'Salário' AND user_id IS NULL LIMIT 1;

  -- Criar templates de exemplo
  INSERT INTO public.transaction_templates (user_id, account_id, name, description, icon, category_id, transaction_type, amount, currency, merchant)
  VALUES
    -- Despesas
    (p_user_id, p_account_id, 'Supermercado', 'Compras mensais', '🛒', v_alimentacao_id, 'expense', 150.00, 'EUR', 'Continente'),
    (p_user_id, p_account_id, 'Combustível', 'Abastecimento', '⛽', v_transporte_id, 'expense', 60.00, 'EUR', 'Galp'),
    (p_user_id, p_account_id, 'Aluguel', 'Pagamento mensal', '🏠', v_habitacao_id, 'expense', 700.00, 'EUR', NULL),
    (p_user_id, p_account_id, 'Netflix', 'Assinatura mensal', '📺', v_entretenimento_id, 'expense', 13.99, 'EUR', 'Netflix'),
    -- Receitas
    (p_user_id, p_account_id, 'Salário', 'Salário mensal', '💰', v_salario_id, 'income', 2000.00, 'EUR', NULL);
END;
$$;

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE public.transaction_templates IS 'Templates para criação rápida de transações recorrentes';
COMMENT ON COLUMN public.transaction_templates.name IS 'Nome do template (ex: "Aluguel", "Netflix")';
COMMENT ON COLUMN public.transaction_templates.times_used IS 'Contador de quantas vezes o template foi usado';

-- Comentários para campos de recorrência (na tabela transactions, não templates)
COMMENT ON COLUMN public.transactions.recurrence_rule IS 'Regra de recorrência no formato RRULE (RFC 5545)';
COMMENT ON COLUMN public.transactions.is_recurring IS 'Indica se é uma transação recorrente';
