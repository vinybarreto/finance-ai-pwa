-- Finance AI PWA - Dados Iniciais (Seed)
-- Arquivo: seed.sql
-- Data: 2025-10-19

-- =====================================================
-- CATEGORIAS DO SISTEMA (user_id = NULL)
-- =====================================================

-- Categorias de DESPESA
INSERT INTO public.categories (name, type, icon, color, is_system, is_tax_deductible, tax_deduction_type) VALUES
-- Essenciais
('Alimentação', 'expense', '🍔', '#ef4444', true, false, NULL),
('Supermercado', 'expense', '🛒', '#f97316', true, false, NULL),
('Restaurantes', 'expense', '🍽️', '#fb923c', true, false, NULL),
('Transporte', 'expense', '🚗', '#3b82f6', true, false, NULL),
('Combustível', 'expense', '⛽', '#60a5fa', true, false, NULL),
('Transportes Públicos', 'expense', '🚌', '#93c5fd', true, false, NULL),
('Habitação', 'expense', '🏠', '#8b5cf6', true, true, 'habitacao'),
('Aluguel', 'expense', '🔑', '#a78bfa', true, false, NULL),
('Condomínio', 'expense', '🏢', '#c4b5fd', true, false, NULL),
('Contas', 'expense', '📄', '#6366f1', true, false, NULL),
('Energia', 'expense', '⚡', '#818cf8', true, false, NULL),
('Água', 'expense', '💧', '#a5b4fc', true, false, NULL),
('Internet', 'expense', '🌐', '#c7d2fe', true, false, NULL),

-- Saúde (dedutível IRS)
('Saúde', 'expense', '🏥', '#10b981', true, true, 'saude'),
('Médico', 'expense', '👨‍⚕️', '#34d399', true, true, 'saude'),
('Farmácia', 'expense', '💊', '#6ee7b7', true, true, 'saude'),
('Dentista', 'expense', '🦷', '#a7f3d0', true, true, 'saude'),

-- Educação (dedutível IRS)
('Educação', 'expense', '📚', '#f59e0b', true, true, 'educacao'),
('Escola/Universidade', 'expense', '🎓', '#fbbf24', true, true, 'educacao'),
('Cursos', 'expense', '📖', '#fcd34d', true, true, 'educacao'),
('Livros', 'expense', '📕', '#fde68a', true, false, NULL),

-- Lazer
('Lazer', 'expense', '🎉', '#ec4899', true, false, NULL),
('Cinema', 'expense', '🎬', '#f472b6', true, false, NULL),
('Streaming', 'expense', '📺', '#f9a8d4', true, false, NULL),
('Viagens', 'expense', '✈️', '#fbcfe8', true, false, NULL),

-- Compras
('Compras', 'expense', '🛍️', '#14b8a6', true, false, NULL),
('Vestuário', 'expense', '👕', '#2dd4bf', true, false, NULL),
('Eletrônicos', 'expense', '📱', '#5eead4', true, false, NULL),
('Casa', 'expense', '🛋️', '#99f6e4', true, false, NULL),

-- Outros
('Pets', 'expense', '🐾', '#a855f7', true, false, NULL),
('Beleza', 'expense', '💅', '#c084fc', true, false, NULL),
('Presentes', 'expense', '🎁', '#e9d5ff', true, false, NULL),
('Doações', 'expense', '❤️', '#fecaca', true, false, NULL),
('Seguros', 'expense', '🛡️', '#78716c', true, false, NULL),
('Impostos', 'expense', '💰', '#a8a29e', true, false, NULL),
('Outros Gastos', 'expense', '📝', '#d4d4d8', true, false, NULL);

-- Categorias de RECEITA
INSERT INTO public.categories (name, type, icon, color, is_system) VALUES
('Salário', 'income', '💵', '#22c55e', true),
('Freelance', 'income', '💼', '#4ade80', true),
('Investimentos', 'income', '📈', '#86efac', true),
('Dividendos', 'income', '💎', '#bbf7d0', true),
('Prêmios', 'income', '🏆', '#dcfce7', true),
('Vendas', 'income', '🛒', '#a3e635', true),
('Outras Receitas', 'income', '💚', '#d9f99d', true);

-- Categorias AMBAS (expense + income)
INSERT INTO public.categories (name, type, icon, color, is_system) VALUES
('Transferências', 'both', '🔄', '#64748b', true),
('Ajustes', 'both', '⚖️', '#94a3b8', true);

-- =====================================================
-- FUNÇÃO PARA CRIAR CONTAS INICIAIS DO USUÁRIO
-- =====================================================

CREATE OR REPLACE FUNCTION create_user_initial_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir usuário em public.users
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);

  -- Criar entrada de gamificação
  INSERT INTO public.gamification (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar dados iniciais quando usuário faz signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_initial_data();

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON FUNCTION create_user_initial_data IS 'Cria dados iniciais do usuário após signup';
