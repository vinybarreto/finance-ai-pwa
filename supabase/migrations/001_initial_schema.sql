-- Finance AI PWA - Schema Inicial Completo
-- Migration: 001_initial_schema.sql
-- Data: 2025-10-19

-- =====================================================
-- EXTENSÕES
-- =====================================================

-- UUID para IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TYPES (ENUMS)
-- =====================================================

-- Tipo de conta bancária
CREATE TYPE account_type AS ENUM ('checking', 'savings', 'investment', 'credit_card');

-- Tipo de transação
CREATE TYPE transaction_type AS ENUM ('expense', 'income', 'transfer');

-- Tipo de categoria
CREATE TYPE category_type AS ENUM ('expense', 'income', 'both');

-- Período de orçamento
CREATE TYPE budget_period AS ENUM ('weekly', 'monthly', 'yearly', 'custom');

-- Tipo de ativo de investimento
CREATE TYPE asset_type AS ENUM ('stock', 'etf', 'fund', 'crypto', 'fixed_income', 'real_estate', 'other');

-- Categoria de investimento
CREATE TYPE investment_category AS ENUM ('long_term', 'emergency', 'goal', 'trading');

-- Tipo de transação de investimento
CREATE TYPE investment_transaction_type AS ENUM ('buy', 'sell', 'dividend', 'interest', 'fee');

-- Categoria de meta/caixinha
CREATE TYPE goal_category AS ENUM ('emergency', 'savings', 'purchase', 'travel', 'education', 'other');

-- Severidade de insight
CREATE TYPE insight_severity AS ENUM ('info', 'warning', 'critical', 'success');

-- Status de conta a pagar/receber
CREATE TYPE bill_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');

-- =====================================================
-- TABELA: users (estende auth.users do Supabase)
-- =====================================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,

  -- Preferências e configurações
  settings JSONB DEFAULT '{
    "theme": "light",
    "language": "pt",
    "currency": "EUR",
    "notifications": {
      "email": true,
      "push": true,
      "insights": true
    },
    "dashboard": {
      "layout": "default",
      "widgets": []
    }
  }'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: accounts (contas bancárias)
-- =====================================================

CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  account_type account_type DEFAULT 'checking',
  currency TEXT NOT NULL DEFAULT 'EUR',
  balance DECIMAL(15, 2) DEFAULT 0.00,

  -- Metadados
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,

  -- Configuração
  include_in_total BOOLEAN DEFAULT true,
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX idx_accounts_is_active ON public.accounts(is_active);

-- =====================================================
-- TABELA: categories (categorias)
-- =====================================================

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- NULL = categoria do sistema

  name TEXT NOT NULL,
  type category_type NOT NULL,
  icon TEXT,
  color TEXT,

  -- Hierarquia (subcategorias)
  parent_category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,

  -- Portugal IRS
  is_tax_deductible BOOLEAN DEFAULT false,
  tax_deduction_type TEXT, -- 'saude', 'educacao', 'habitacao', etc

  -- Metadados
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_categories_parent_id ON public.categories(parent_category_id);
CREATE INDEX idx_categories_type ON public.categories(type);

-- =====================================================
-- TABELA: transactions (transações financeiras)
-- =====================================================

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,

  type transaction_type NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',

  -- Conversão de moeda (se aplicável)
  original_amount DECIMAL(15, 2),
  original_currency TEXT,
  exchange_rate DECIMAL(10, 6),

  description TEXT NOT NULL,
  notes TEXT,
  date DATE NOT NULL,

  -- Tags
  tags TEXT[] DEFAULT '{}',

  -- Transferências internas
  is_internal_transfer BOOLEAN DEFAULT false,
  related_transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,

  -- Recorrência
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT, -- RRULE format
  parent_recurring_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,

  -- Parcelamento
  is_installment BOOLEAN DEFAULT false,
  installment_number INTEGER,
  total_installments INTEGER,
  installment_group_id UUID,

  -- Anexos
  attachment_url TEXT,
  attachment_type TEXT,

  -- IA
  ai_categorized BOOLEAN DEFAULT false,
  ai_confidence DECIMAL(3, 2), -- 0.00 a 1.00
  ai_suggested_category_id UUID REFERENCES public.categories(id),

  -- Estabelecimento/Fornecedor
  merchant_name TEXT,
  merchant_location TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_tags ON public.transactions USING GIN(tags);
CREATE INDEX idx_transactions_merchant ON public.transactions(merchant_name);

-- =====================================================
-- TABELA: budgets (orçamentos)
-- =====================================================

CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',

  period budget_period NOT NULL DEFAULT 'monthly',
  start_date DATE NOT NULL,
  end_date DATE,

  -- Alertas (% do orçamento)
  alert_thresholds INTEGER[] DEFAULT '{50, 80, 100}',

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX idx_budgets_category_id ON public.budgets(category_id);
CREATE INDEX idx_budgets_dates ON public.budgets(start_date, end_date);

-- =====================================================
-- TABELA: bills (contas a pagar/receber)
-- =====================================================

CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,

  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',

  due_date DATE NOT NULL,

  -- Status
  status bill_status DEFAULT 'pending',
  paid_date DATE,
  paid_amount DECIMAL(15, 2),

  -- Recorrência
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  parent_bill_id UUID REFERENCES public.bills(id) ON DELETE SET NULL,

  -- Parcelamento
  is_installment BOOLEAN DEFAULT false,
  installment_number INTEGER,
  total_installments INTEGER,

  -- Notificações
  notify_days_before INTEGER DEFAULT 3,

  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_bills_user_id ON public.bills(user_id);
CREATE INDEX idx_bills_due_date ON public.bills(due_date);
CREATE INDEX idx_bills_status ON public.bills(status);

-- =====================================================
-- TABELA: investments (investimentos)
-- =====================================================

CREATE TABLE public.investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  asset_type asset_type NOT NULL,
  symbol TEXT, -- Ticker/código
  name TEXT NOT NULL,

  quantity DECIMAL(18, 8) NOT NULL DEFAULT 0,
  average_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  current_price DECIMAL(15, 2),

  currency TEXT NOT NULL DEFAULT 'EUR',

  -- Categoria (longo prazo, emergência, meta)
  category investment_category DEFAULT 'long_term',
  goal_id UUID, -- FK adicionada depois que goals for criada

  -- Atualização automática de preço
  auto_update_price BOOLEAN DEFAULT true,
  last_price_update TIMESTAMP WITH TIME ZONE,

  -- Metadados
  notes TEXT,
  broker TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_investments_user_id ON public.investments(user_id);
CREATE INDEX idx_investments_symbol ON public.investments(symbol);
CREATE INDEX idx_investments_asset_type ON public.investments(asset_type);

-- =====================================================
-- TABELA: investment_transactions (transações de investimentos)
-- =====================================================

CREATE TABLE public.investment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investment_id UUID NOT NULL REFERENCES public.investments(id) ON DELETE CASCADE,

  type investment_transaction_type NOT NULL,

  quantity DECIMAL(18, 8) NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL,
  fees DECIMAL(15, 2) DEFAULT 0,

  date DATE NOT NULL,
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_inv_trans_investment_id ON public.investment_transactions(investment_id);
CREATE INDEX idx_inv_trans_date ON public.investment_transactions(date DESC);

-- =====================================================
-- TABELA: goals (metas e caixinhas)
-- =====================================================

CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,

  target_amount DECIMAL(15, 2) NOT NULL,
  current_amount DECIMAL(15, 2) DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',

  deadline DATE,
  category goal_category NOT NULL DEFAULT 'savings',

  -- Configuração
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_goals_is_active ON public.goals(is_active);

-- =====================================================
-- TABELA: milestones (marcos de metas)
-- =====================================================

CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  target_amount DECIMAL(15, 2) NOT NULL,

  is_reached BOOLEAN DEFAULT false,
  reached_at TIMESTAMP WITH TIME ZONE,

  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_milestones_goal_id ON public.milestones(goal_id);

-- =====================================================
-- TABELA: debts (dívidas/empréstimos)
-- =====================================================

CREATE TABLE public.debts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,

  total_amount DECIMAL(15, 2) NOT NULL,
  remaining_amount DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',

  interest_rate DECIMAL(5, 2) DEFAULT 0, -- %
  monthly_payment DECIMAL(15, 2),

  start_date DATE NOT NULL,
  end_date DATE,

  creditor TEXT,
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_debts_user_id ON public.debts(user_id);

-- =====================================================
-- TABELA: ai_conversations (conversas com IA)
-- =====================================================

CREATE TABLE public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  title TEXT,
  messages JSONB NOT NULL DEFAULT '[]', -- [{role, content, timestamp}]

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_ai_conv_user_id ON public.ai_conversations(user_id);
CREATE INDEX idx_ai_conv_updated ON public.ai_conversations(updated_at DESC);

-- =====================================================
-- TABELA: ai_insights (insights gerados pela IA)
-- =====================================================

CREATE TABLE public.ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  type TEXT NOT NULL, -- 'unusual_spending', 'savings_opportunity', etc
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  data JSONB, -- Dados estruturados do insight
  severity insight_severity DEFAULT 'info',

  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,

  expires_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX idx_ai_insights_created ON public.ai_insights(created_at DESC);
CREATE INDEX idx_ai_insights_read ON public.ai_insights(is_read, is_dismissed);

-- =====================================================
-- TABELA: ai_categorization_rules (regras de categorização da IA)
-- =====================================================

CREATE TABLE public.ai_categorization_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  pattern TEXT NOT NULL, -- Regex ou texto para match
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,

  confidence DECIMAL(3, 2) DEFAULT 1.00, -- 0.00 a 1.00
  times_applied INTEGER DEFAULT 0,

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_ai_rules_user_id ON public.ai_categorization_rules(user_id);
CREATE INDEX idx_ai_rules_pattern ON public.ai_categorization_rules(pattern);

-- =====================================================
-- TABELA: gamification (gamificação)
-- =====================================================

CREATE TABLE public.gamification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,

  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,

  badges TEXT[] DEFAULT '{}',

  challenges_completed JSONB DEFAULT '{}',

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_gamification_user_id ON public.gamification(user_id);
CREATE INDEX idx_gamification_level ON public.gamification(level DESC);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON public.bills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON public.investments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON public.debts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_rules_updated_at BEFORE UPDATE ON public.ai_categorization_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gamification_updated_at BEFORE UPDATE ON public.gamification
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNÇÕES DE NEGÓCIO
-- =====================================================

-- Função para atualizar saldo da conta após transação
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'expense' THEN
      UPDATE public.accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'income' THEN
      UPDATE public.accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'expense' THEN
      UPDATE public.accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'income' THEN
      UPDATE public.accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Reverter transação antiga
    IF OLD.type = 'expense' THEN
      UPDATE public.accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'income' THEN
      UPDATE public.accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
    END IF;

    -- Aplicar nova transação
    IF NEW.type = 'expense' THEN
      UPDATE public.accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'income' THEN
      UPDATE public.accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_account_balance
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW
  WHEN (pg_trigger_depth() = 0) -- Evitar loops infinitos
  EXECUTE FUNCTION update_account_balance();

-- =====================================================
-- FOREIGN KEYS ADICIONADAS DEPOIS
-- =====================================================

-- Adicionar FK de investments -> goals (agora que goals existe)
ALTER TABLE public.investments
  ADD CONSTRAINT fk_investments_goal
  FOREIGN KEY (goal_id) REFERENCES public.goals(id) ON DELETE SET NULL;

-- Comentários (para documentação)
COMMENT ON TABLE public.accounts IS 'Contas bancárias do usuário (corrente, poupança, cartão, etc)';
COMMENT ON TABLE public.transactions IS 'Transações financeiras (gastos, receitas, transferências)';
COMMENT ON TABLE public.categories IS 'Categorias para organizar transações';
COMMENT ON TABLE public.budgets IS 'Orçamentos mensais/anuais por categoria';
COMMENT ON TABLE public.bills IS 'Contas a pagar e receber';
COMMENT ON TABLE public.investments IS 'Investimentos (ações, ETFs, cripto, etc)';
COMMENT ON TABLE public.goals IS 'Metas financeiras e caixinhas';
COMMENT ON TABLE public.ai_insights IS 'Insights gerados automaticamente pela IA';
