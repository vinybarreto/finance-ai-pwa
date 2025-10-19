-- Finance AI PWA - Row Level Security (RLS) Policies
-- Migration: 002_rls_policies.sql
-- Data: 2025-10-19

-- =====================================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_categorization_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES: users
-- =====================================================

-- Users podem ver e atualizar apenas seus próprios dados
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- POLICIES: accounts
-- =====================================================

CREATE POLICY "Users can view own accounts" ON public.accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts" ON public.accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts" ON public.accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts" ON public.accounts
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES: categories
-- =====================================================

-- Users podem ver categorias do sistema (user_id IS NULL) + suas próprias
CREATE POLICY "Users can view categories" ON public.categories
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES: transactions
-- =====================================================

CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES: budgets
-- =====================================================

CREATE POLICY "Users can view own budgets" ON public.budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" ON public.budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON public.budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON public.budgets
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES: bills
-- =====================================================

CREATE POLICY "Users can view own bills" ON public.bills
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bills" ON public.bills
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bills" ON public.bills
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bills" ON public.bills
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES: investments
-- =====================================================

CREATE POLICY "Users can view own investments" ON public.investments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investments" ON public.investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investments" ON public.investments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own investments" ON public.investments
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES: investment_transactions
-- =====================================================

CREATE POLICY "Users can view own investment transactions" ON public.investment_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.investments
      WHERE id = investment_transactions.investment_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own investment transactions" ON public.investment_transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.investments
      WHERE id = investment_transactions.investment_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own investment transactions" ON public.investment_transactions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.investments
      WHERE id = investment_transactions.investment_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own investment transactions" ON public.investment_transactions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.investments
      WHERE id = investment_transactions.investment_id
      AND user_id = auth.uid()
    )
  );

-- =====================================================
-- POLICIES: goals
-- =====================================================

CREATE POLICY "Users can view own goals" ON public.goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON public.goals
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES: milestones
-- =====================================================

CREATE POLICY "Users can view own milestones" ON public.milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.goals
      WHERE id = milestones.goal_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own milestones" ON public.milestones
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.goals
      WHERE id = milestones.goal_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own milestones" ON public.milestones
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.goals
      WHERE id = milestones.goal_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own milestones" ON public.milestones
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.goals
      WHERE id = milestones.goal_id
      AND user_id = auth.uid()
    )
  );

-- =====================================================
-- POLICIES: debts
-- =====================================================

CREATE POLICY "Users can view own debts" ON public.debts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own debts" ON public.debts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own debts" ON public.debts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own debts" ON public.debts
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES: ai_conversations
-- =====================================================

CREATE POLICY "Users can view own conversations" ON public.ai_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON public.ai_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON public.ai_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON public.ai_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES: ai_insights
-- =====================================================

CREATE POLICY "Users can view own insights" ON public.ai_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights" ON public.ai_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights" ON public.ai_insights
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights" ON public.ai_insights
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES: ai_categorization_rules
-- =====================================================

CREATE POLICY "Users can view own categorization rules" ON public.ai_categorization_rules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categorization rules" ON public.ai_categorization_rules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categorization rules" ON public.ai_categorization_rules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categorization rules" ON public.ai_categorization_rules
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES: gamification
-- =====================================================

CREATE POLICY "Users can view own gamification" ON public.gamification
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gamification" ON public.gamification
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gamification" ON public.gamification
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- GRANTS (permissões para authenticated users)
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
