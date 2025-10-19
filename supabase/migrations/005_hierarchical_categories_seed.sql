/**
 * Migration 005 - Categorias Hierárquicas (Seed Data)
 *
 * Adiciona categorias pai e subcategorias organizadas
 * para melhor organização financeira
 */

-- =====================================================
-- LIMPAR CATEGORIAS ANTIGAS (se necessário)
-- =====================================================

-- Nota: Não vamos deletar, apenas adicionar as novas hierárquicas

-- =====================================================
-- CATEGORIAS HIERÁRQUICAS - DESPESAS
-- =====================================================

-- 🚗 TRANSPORTE
INSERT INTO public.categories (name, icon, type, color, user_id, parent_category_id)
VALUES
  ('Transporte', '🚗', 'expense', '#3b82f6', NULL, NULL)
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  v_transporte_id UUID;
BEGIN
  -- Buscar ID da categoria pai
  SELECT id INTO v_transporte_id FROM public.categories WHERE name = 'Transporte' AND parent_category_id IS NULL LIMIT 1;

  IF v_transporte_id IS NOT NULL THEN
    -- Subcategorias de Transporte
    INSERT INTO public.categories (name, icon, type, color, user_id, parent_category_id)
    VALUES
      ('Combustível', '⛽', 'expense', '#ef4444', NULL, v_transporte_id),
      ('Pedágio', '🛣️', 'expense', '#f59e0b', NULL, v_transporte_id),
      ('Estacionamento', '🅿️', 'expense', '#8b5cf6', NULL, v_transporte_id),
      ('Manutenção Veículo', '🔧', 'expense', '#10b981', NULL, v_transporte_id),
      ('Transporte Público', '🚇', 'expense', '#06b6d4', NULL, v_transporte_id),
      ('Uber/Bolt', '🚕', 'expense', '#ec4899', NULL, v_transporte_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 🛒 ALIMENTAÇÃO
INSERT INTO public.categories (name, icon, type, color, user_id, parent_category_id)
VALUES
  ('Alimentação', '🛒', 'expense', '#10b981', NULL, NULL)
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  v_alimentacao_id UUID;
BEGIN
  SELECT id INTO v_alimentacao_id FROM public.categories WHERE name = 'Alimentação' AND parent_category_id IS NULL LIMIT 1;

  IF v_alimentacao_id IS NOT NULL THEN
    INSERT INTO public.categories (name, icon, type, color, user_id, parent_category_id)
    VALUES
      ('Supermercado', '🛍️', 'expense', '#10b981', NULL, v_alimentacao_id),
      ('Restaurantes', '🍕', 'expense', '#f59e0b', NULL, v_alimentacao_id),
      ('Cafés e Padarias', '☕', 'expense', '#8b5cf6', NULL, v_alimentacao_id),
      ('Delivery', '🥡', 'expense', '#ec4899', NULL, v_alimentacao_id),
      ('Bar/Bebidas', '🍺', 'expense', '#f97316', NULL, v_alimentacao_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 🏠 HABITAÇÃO
INSERT INTO public.categories (name, icon, type, color, user_id, parent_category_id)
VALUES
  ('Habitação', '🏠', 'expense', '#8b5cf6', NULL, NULL)
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  v_habitacao_id UUID;
BEGIN
  SELECT id INTO v_habitacao_id FROM public.categories WHERE name = 'Habitação' AND parent_category_id IS NULL LIMIT 1;

  IF v_habitacao_id IS NOT NULL THEN
    INSERT INTO public.categories (name, icon, type, color, user_id, parent_category_id)
    VALUES
      ('Aluguel', '🏡', 'expense', '#8b5cf6', NULL, v_habitacao_id),
      ('Condomínio', '🏢', 'expense', '#6366f1', NULL, v_habitacao_id),
      ('Energia Elétrica', '💡', 'expense', '#eab308', NULL, v_habitacao_id),
      ('Água', '💧', 'expense', '#06b6d4', NULL, v_habitacao_id),
      ('Gás', '🔥', 'expense', '#f97316', NULL, v_habitacao_id),
      ('Internet', '📱', 'expense', '#3b82f6', NULL, v_habitacao_id),
      ('Telefone', '📞', 'expense', '#10b981', NULL, v_habitacao_id),
      ('Manutenção Casa', '🔨', 'expense', '#78716c', NULL, v_habitacao_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 🏥 SAÚDE
INSERT INTO public.categories (name, icon, type, color, user_id, parent_category_id)
VALUES
  ('Saúde', '🏥', 'expense', '#ef4444', NULL, NULL)
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  v_saude_id UUID;
BEGIN
  SELECT id INTO v_saude_id FROM public.categories WHERE name = 'Saúde' AND parent_category_id IS NULL LIMIT 1;

  IF v_saude_id IS NOT NULL THEN
    INSERT INTO public.categories (name, icon, type, color, user_id, parent_category_id)
    VALUES
      ('Farmácia', '💊', 'expense', '#ef4444', NULL, v_saude_id),
      ('Consultas Médicas', '👨‍⚕️', 'expense', '#06b6d4', NULL, v_saude_id),
      ('Exames', '🔬', 'expense', '#8b5cf6', NULL, v_saude_id),
      ('Plano de Saúde', '🏥', 'expense', '#10b981', NULL, v_saude_id),
      ('Academia', '💪', 'expense', '#f59e0b', NULL, v_saude_id),
      ('Dentista', '🦷', 'expense', '#ec4899', NULL, v_saude_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 📚 EDUCAÇÃO
INSERT INTO public.categories (name, icon, type, color, user_id, parent_category_id)
VALUES
  ('Educação', '📚', 'expense', '#3b82f6', NULL, NULL)
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  v_educacao_id UUID;
BEGIN
  SELECT id INTO v_educacao_id FROM public.categories WHERE name = 'Educação' AND parent_category_id IS NULL LIMIT 1;

  IF v_educacao_id IS NOT NULL THEN
    INSERT INTO public.categories (name, icon, type, color, user_id, parent_category_id)
    VALUES
      ('Mensalidade Escola', '🎓', 'expense', '#3b82f6', NULL, v_educacao_id),
      ('Material Escolar', '📝', 'expense', '#10b981', NULL, v_educacao_id),
      ('Livros', '📖', 'expense', '#8b5cf6', NULL, v_educacao_id),
      ('Cursos Online', '💻', 'expense', '#06b6d4', NULL, v_educacao_id),
      ('Idiomas', '🗣️', 'expense', '#f59e0b', NULL, v_educacao_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 🎮 LAZER
INSERT INTO public.categories (name, icon, type, color, user_id, parent_category_id)
VALUES
  ('Lazer', '🎮', 'expense', '#ec4899', NULL, NULL)
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  v_lazer_id UUID;
BEGIN
  SELECT id INTO v_lazer_id FROM public.categories WHERE name = 'Lazer' AND parent_category_id IS NULL LIMIT 1;

  IF v_lazer_id IS NOT NULL THEN
    INSERT INTO public.categories (name, icon, type, color, user_id, parent_category_id)
    VALUES
      ('Cinema/Teatro', '🎭', 'expense', '#ec4899', NULL, v_lazer_id),
      ('Streaming', '📺', 'expense', '#ef4444', NULL, v_lazer_id),
      ('Viagens', '✈️', 'expense', '#06b6d4', NULL, v_lazer_id),
      ('Hobbies', '🎨', 'expense', '#8b5cf6', NULL, v_lazer_id),
      ('Games', '🎮', 'expense', '#10b981', NULL, v_lazer_id),
      ('Eventos', '🎉', 'expense', '#f59e0b', NULL, v_lazer_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 🛍️ COMPRAS
INSERT INTO public.categories (name, icon, type, color, user_id, parent_category_id)
VALUES
  ('Compras', '🛍️', 'expense', '#f59e0b', NULL, NULL)
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  v_compras_id UUID;
BEGIN
  SELECT id INTO v_compras_id FROM public.categories WHERE name = 'Compras' AND parent_category_id IS NULL LIMIT 1;

  IF v_compras_id IS NOT NULL THEN
    INSERT INTO public.categories (name, icon, type, color, user_id, parent_category_id)
    VALUES
      ('Roupas', '👕', 'expense', '#ec4899', NULL, v_compras_id),
      ('Eletrônicos', '📱', 'expense', '#3b82f6', NULL, v_compras_id),
      ('Casa e Decoração', '🏠', 'expense', '#8b5cf6', NULL, v_compras_id),
      ('Presentes', '🎁', 'expense', '#ef4444', NULL, v_compras_id),
      ('Beleza/Cuidados', '💄', 'expense', '#ec4899', NULL, v_compras_id),
      ('Pet Shop', '🐾', 'expense', '#10b981', NULL, v_compras_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 💼 SERVIÇOS
INSERT INTO public.categories (name, icon, type, color, user_id, parent_category_id)
VALUES
  ('Serviços', '💼', 'expense', '#6366f1', NULL, NULL)
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  v_servicos_id UUID;
BEGIN
  SELECT id INTO v_servicos_id FROM public.categories WHERE name = 'Serviços' AND parent_category_id IS NULL LIMIT 1;

  IF v_servicos_id IS NOT NULL THEN
    INSERT INTO public.categories (name, icon, type, color, user_id, parent_category_id)
    VALUES
      ('Seguros', '🛡️', 'expense', '#6366f1', NULL, v_servicos_id),
      ('Impostos', '💰', 'expense', '#ef4444', NULL, v_servicos_id),
      ('Taxas Bancárias', '🏦', 'expense', '#8b5cf6', NULL, v_servicos_id),
      ('Advogado', '⚖️', 'expense', '#78716c', NULL, v_servicos_id),
      ('Contabilidade', '📊', 'expense', '#10b981', NULL, v_servicos_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- CATEGORIAS HIERÁRQUICAS - RECEITAS
-- =====================================================

-- 💰 RECEITAS TRABALHO
INSERT INTO public.categories (name, icon, type, color, user_id, parent_category_id)
VALUES
  ('Trabalho', '💰', 'income', '#10b981', NULL, NULL)
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  v_trabalho_id UUID;
BEGIN
  SELECT id INTO v_trabalho_id FROM public.categories WHERE name = 'Trabalho' AND parent_category_id IS NULL AND type = 'income' LIMIT 1;

  IF v_trabalho_id IS NOT NULL THEN
    INSERT INTO public.categories (name, icon, type, color, user_id, parent_category_id)
    VALUES
      ('Salário', '💵', 'income', '#10b981', NULL, v_trabalho_id),
      ('Freelance', '💻', 'income', '#06b6d4', NULL, v_trabalho_id),
      ('Bônus', '🎁', 'income', '#f59e0b', NULL, v_trabalho_id),
      ('Comissões', '📈', 'income', '#8b5cf6', NULL, v_trabalho_id),
      ('13º Salário', '💰', 'income', '#10b981', NULL, v_trabalho_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 📈 INVESTIMENTOS
INSERT INTO public.categories (name, icon, type, color, user_id, parent_category_id)
VALUES
  ('Investimentos', '📈', 'income', '#3b82f6', NULL, NULL)
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  v_investimentos_id UUID;
BEGIN
  SELECT id INTO v_investimentos_id FROM public.categories WHERE name = 'Investimentos' AND parent_category_id IS NULL AND type = 'income' LIMIT 1;

  IF v_investimentos_id IS NOT NULL THEN
    INSERT INTO public.categories (name, icon, type, color, user_id, parent_category_id)
    VALUES
      ('Dividendos', '💹', 'income', '#10b981', NULL, v_investimentos_id),
      ('Juros', '💵', 'income', '#06b6d4', NULL, v_investimentos_id),
      ('Rendimento', '📊', 'income', '#8b5cf6', NULL, v_investimentos_id),
      ('Venda de Ativos', '💰', 'income', '#f59e0b', NULL, v_investimentos_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 🎁 OUTRAS RECEITAS
INSERT INTO public.categories (name, icon, type, color, user_id, parent_category_id)
VALUES
  ('Outras Receitas', '🎁', 'income', '#ec4899', NULL, NULL)
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  v_outras_id UUID;
BEGIN
  SELECT id INTO v_outras_id FROM public.categories WHERE name = 'Outras Receitas' AND parent_category_id IS NULL AND type = 'income' LIMIT 1;

  IF v_outras_id IS NOT NULL THEN
    INSERT INTO public.categories (name, icon, type, color, user_id, parent_category_id)
    VALUES
      ('Presente', '🎁', 'income', '#ec4899', NULL, v_outras_id),
      ('Reembolso', '↩️', 'income', '#06b6d4', NULL, v_outras_id),
      ('Prêmio', '🏆', 'income', '#f59e0b', NULL, v_outras_id),
      ('Venda', '🛒', 'income', '#10b981', NULL, v_outras_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON COLUMN public.categories.parent_category_id IS 'ID da categoria pai (para hierarquia/subcategorias)';
