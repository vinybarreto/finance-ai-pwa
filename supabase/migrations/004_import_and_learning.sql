/**
 * Migration 004 - Sistema de Import e Aprendizado
 *
 * Adiciona:
 * - Tabela import_batches para histórico de imports
 * - Tabela learned_patterns para aprendizado de categorização
 * - Tabela learned_transfers para aprendizado de transferências internas
 */

-- =====================================================
-- IMPORT BATCHES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Import info
  bank_name TEXT NOT NULL, -- revolut, activo, novobanco, wise, nubank
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- csv, ofx, pdf

  -- Stats
  total_transactions INTEGER DEFAULT 0,
  imported_count INTEGER DEFAULT 0,
  duplicate_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_import_batches_user ON public.import_batches(user_id);
CREATE INDEX idx_import_batches_status ON public.import_batches(status);
CREATE INDEX idx_import_batches_created ON public.import_batches(created_at DESC);

-- =====================================================
-- LEARNED PATTERNS (Aprendizado de Categorização)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.learned_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Pattern matching
  merchant TEXT, -- nome do estabelecimento
  description_pattern TEXT, -- padrão na descrição (ex: "netflix", "uber")

  -- Learned category
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,

  -- Confidence
  times_applied INTEGER DEFAULT 0, -- quantas vezes foi aplicado
  times_corrected INTEGER DEFAULT 0, -- quantas vezes usuário corrigiu
  confidence_score DECIMAL(3,2) DEFAULT 1.00, -- 0.00 a 1.00

  -- Meta
  last_applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: um padrão por usuário
  UNIQUE(user_id, merchant, description_pattern)
);

-- Índices
CREATE INDEX idx_learned_patterns_user ON public.learned_patterns(user_id);
CREATE INDEX idx_learned_patterns_merchant ON public.learned_patterns(merchant);
CREATE INDEX idx_learned_patterns_confidence ON public.learned_patterns(confidence_score DESC);

-- =====================================================
-- LEARNED TRANSFERS (Aprendizado de Transferências)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.learned_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Pattern matching
  description_pattern TEXT NOT NULL, -- ex: "To Vinycius Barreto", "Transferência enviada"
  account_pattern TEXT, -- ex: "Revolut", "Wise"

  -- Learned behavior
  is_internal_transfer BOOLEAN NOT NULL, -- true = transferência interna, false = não é
  target_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL, -- conta destino (se interna)

  -- Confidence
  times_applied INTEGER DEFAULT 0,
  times_corrected INTEGER DEFAULT 0,
  confidence_score DECIMAL(3,2) DEFAULT 1.00,

  -- Meta
  last_applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(user_id, description_pattern, account_pattern)
);

-- Índices
CREATE INDEX idx_learned_transfers_user ON public.learned_transfers(user_id);
CREATE INDEX idx_learned_transfers_pattern ON public.learned_transfers(description_pattern);
CREATE INDEX idx_learned_transfers_confidence ON public.learned_transfers(confidence_score DESC);

-- Trigger para updated_at
CREATE TRIGGER update_learned_patterns_updated_at
  BEFORE UPDATE ON public.learned_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learned_transfers_updated_at
  BEFORE UPDATE ON public.learned_transfers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Import Batches
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY import_batches_select_policy
  ON public.import_batches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY import_batches_insert_policy
  ON public.import_batches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY import_batches_update_policy
  ON public.import_batches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY import_batches_delete_policy
  ON public.import_batches FOR DELETE
  USING (auth.uid() = user_id);

-- Learned Patterns
ALTER TABLE public.learned_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY learned_patterns_select_policy
  ON public.learned_patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY learned_patterns_insert_policy
  ON public.learned_patterns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY learned_patterns_update_policy
  ON public.learned_patterns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY learned_patterns_delete_policy
  ON public.learned_patterns FOR DELETE
  USING (auth.uid() = user_id);

-- Learned Transfers
ALTER TABLE public.learned_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY learned_transfers_select_policy
  ON public.learned_transfers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY learned_transfers_insert_policy
  ON public.learned_transfers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY learned_transfers_update_policy
  ON public.learned_transfers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY learned_transfers_delete_policy
  ON public.learned_transfers FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

/**
 * Incrementar contador quando padrão é aplicado
 */
CREATE OR REPLACE FUNCTION increment_pattern_usage(pattern_id UUID, pattern_type TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF pattern_type = 'category' THEN
    UPDATE public.learned_patterns
    SET
      times_applied = times_applied + 1,
      last_applied_at = NOW()
    WHERE id = pattern_id;
  ELSIF pattern_type = 'transfer' THEN
    UPDATE public.learned_transfers
    SET
      times_applied = times_applied + 1,
      last_applied_at = NOW()
    WHERE id = pattern_id;
  END IF;
END;
$$;

/**
 * Registrar correção do usuário (reduz confidence)
 */
CREATE OR REPLACE FUNCTION record_pattern_correction(pattern_id UUID, pattern_type TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF pattern_type = 'category' THEN
    UPDATE public.learned_patterns
    SET
      times_corrected = times_corrected + 1,
      confidence_score = GREATEST(0.10, confidence_score - 0.10) -- mínimo 0.10
    WHERE id = pattern_id;
  ELSIF pattern_type = 'transfer' THEN
    UPDATE public.learned_transfers
    SET
      times_corrected = times_corrected + 1,
      confidence_score = GREATEST(0.10, confidence_score - 0.10)
    WHERE id = pattern_id;
  END IF;
END;
$$;

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE public.import_batches IS 'Histórico de imports de extratos bancários';
COMMENT ON TABLE public.learned_patterns IS 'Padrões aprendidos de categorização (merchant → category)';
COMMENT ON TABLE public.learned_transfers IS 'Padrões aprendidos de transferências internas';

COMMENT ON COLUMN public.learned_patterns.confidence_score IS 'Score de confiança (1.00 = 100%, diminui com correções)';
COMMENT ON COLUMN public.learned_transfers.confidence_score IS 'Score de confiança (1.00 = 100%, diminui com correções)';
