# 🗄️ Supabase Database Setup

## 📋 Arquivos de Migration

1. **001_initial_schema.sql** - Schema completo (20+ tabelas)
2. **002_rls_policies.sql** - Row Level Security policies
3. **seed.sql** - Dados iniciais (40+ categorias)

## 🚀 Como Executar as Migrations

### Opção 1: Via Dashboard Supabase (Recomendado)

1. Acesse: https://supabase.com/dashboard/project/hhsxppzpcbwxhpwszwqa
2. Vá em **SQL Editor** (menu lateral esquerdo)
3. Clique em **New Query**
4. Copie e cole o conteúdo de `001_initial_schema.sql`
5. Clique em **Run** (ou Ctrl+Enter)
6. Repita para `002_rls_policies.sql`
7. Repita para `seed.sql`

### Opção 2: Via Supabase CLI

```bash
# Instalar CLI (se não tiver)
npm install -g supabase

# Linkar ao projeto
supabase link --project-ref hhsxppzpcbwxhpwszwqa

# Executar migrations
supabase db push

# Executar seed
psql $DATABASE_URL < supabase/seed.sql
```

## ✅ Verificar se funcionou

Após executar, você deve ver no dashboard:

**Tables (Tabelas criadas):**
- ✅ users
- ✅ accounts
- ✅ categories (com 40+ categorias pré-definidas)
- ✅ transactions
- ✅ budgets
- ✅ bills
- ✅ investments
- ✅ investment_transactions
- ✅ goals
- ✅ milestones
- ✅ debts
- ✅ ai_conversations
- ✅ ai_insights
- ✅ ai_categorization_rules
- ✅ gamification

**Policies (RLS):**
- Todas as tabelas com políticas de segurança ativas

## 📊 Estrutura do Banco

### Tabelas Principais

**Finanças Core:**
- `accounts` - 5 contas (ACTIVO BANK, REVOLUT, WISE, NOVO BANCO, NUBANK)
- `transactions` - Lançamentos financeiros
- `categories` - Categorias (sistema + personalizadas)
- `budgets` - Orçamentos

**Investimentos:**
- `investments` - Ativos (ações, ETFs, cripto)
- `investment_transactions` - Histórico de compra/venda
- `goals` - Metas e caixinhas
- `milestones` - Marcos de metas

**IA:**
- `ai_conversations` - Histórico de chat
- `ai_insights` - Insights gerados
- `ai_categorization_rules` - Regras aprendidas

**Outros:**
- `bills` - Contas a pagar/receber
- `debts` - Dívidas
- `gamification` - XP, badges, streaks

## 🔐 Segurança

**Row Level Security (RLS):** Ativo em todas as tabelas
- Usuários só acessam seus próprios dados
- Categorias do sistema (user_id = NULL) são visíveis para todos
- Policies garantem isolamento total entre usuários

## 📝 Categorias Pré-definidas

**40+ categorias incluindo:**
- 🍔 Alimentação (Supermercado, Restaurantes)
- 🚗 Transporte (Combustível, Públicos)
- 🏠 Habitação (Aluguel, Contas)
- 🏥 Saúde (dedutível IRS)
- 📚 Educação (dedutível IRS)
- 🎉 Lazer (Cinema, Streaming, Viagens)
- 🛍️ Compras (Vestuário, Eletrônicos)
- 💵 Receitas (Salário, Freelance, Investimentos)

## 🇵🇹 Categorias Dedutíveis IRS Portugal

As seguintes categorias são marcadas como dedutíveis:
- ✅ Saúde (médico, farmácia, dentista)
- ✅ Educação (escola, universidade, cursos)
- ✅ Habitação (juros empréstimo)

## 🛠 Troubleshooting

**Erro: "permission denied"**
- Certifique-se de estar logado no projeto correto
- Verifique se está usando o SQL Editor com permissões de admin

**Erro: "relation already exists"**
- As tabelas já foram criadas anteriormente
- Use `DROP TABLE IF EXISTS` para recriar (cuidado: apaga dados!)

**Categorias não aparecem:**
- Execute o `seed.sql` separadamente
- Verifique se `is_system = true` e `user_id IS NULL`

## 📞 Suporte

Se algo não funcionar:
1. Verifique logs do Supabase Dashboard
2. Consulte DEVELOPMENT.md
3. Crie issue no GitHub

---

**Última atualização:** 2025-10-19
