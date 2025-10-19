# 📚 Documentação de Desenvolvimento - Finance AI PWA

> **⚠️ IMPORTANTE:** Este arquivo é atualizado continuamente durante o desenvolvimento. Se o chat quebrar, use este documento para retomar de onde parou.

## 📋 Informações do Projeto

**Nome:** Finance AI PWA
**Tipo:** Progressive Web App (PWA)
**Stack:** Next.js 14 + TypeScript + Supabase + Claude AI
**Repositório:** https://github.com/vinybarreto/finance-ai-pwa
**Última atualização:** 2025-10-19

---

## 🔑 Credenciais e Configuração

> **⚠️ SEGURANÇA:** As credenciais reais estão armazenadas em `.env.local` (NÃO commitado no Git).
> Consulte `.env.example` para template de variáveis de ambiente.

### Serviços Configurados

#### Anthropic (Claude AI)
- Variável: `ANTHROPIC_API_KEY`
- Onde obter: https://console.anthropic.com

#### Supabase (Database + Backend)
- **Project Name:** finance app
- **Project ID:** hhsxppzpcbwxhpwszwqa
- **URL:** https://hhsxppzpcbwxhpwszwqa.supabase.co
- Variáveis necessárias:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Dashboard: https://supabase.com/dashboard/project/hhsxppzpcbwxhpwszwqa

#### GitHub
- **Repositório:** https://github.com/vinybarreto/finance-ai-pwa

#### Telegram Bot
- **Bot Username:** @finance_ai_vinycius_bot
- **Link:** https://t.me/finance_ai_vinycius_bot
- Variável: `TELEGRAM_BOT_TOKEN`

#### Binance API
- Configurado com permissões READ ONLY
- Variáveis:
  - `BINANCE_API_KEY`
  - `BINANCE_API_SECRET`

### Contas Bancárias do Usuário
```
1. ACTIVO BANK (EUR)
2. REVOLUT (EUR)
3. WISE (EUR)
4. NOVO BANCO (EUR)
5. NUBANK (BRL)
```

> **📝 Nota:** Para acessar as credenciais completas, consulte o arquivo `.env.local` no servidor local (não commitado).

---

## 📂 Estrutura do Projeto

```
finance-ai-pwa/
├── DEVELOPMENT.md              # Este arquivo - documentação completa
├── README.md                   # Documentação para usuário final
├── PROGRESS.md                 # Log detalhado de progresso
├── .env.local                  # Variáveis de ambiente (NÃO COMMITAR)
├── .env.example                # Template de variáveis
├── package.json                # Dependências
├── tsconfig.json               # Config TypeScript
├── tailwind.config.ts          # Config Tailwind
├── next.config.js              # Config Next.js
│
├── app/                        # Next.js App Router
│   ├── layout.tsx             # Layout root
│   ├── page.tsx               # Página inicial (landing)
│   ├── globals.css            # Estilos globais
│   │
│   ├── (auth)/                # Grupo autenticação
│   │   ├── login/
│   │   └── signup/
│   │
│   └── (dashboard)/           # Grupo dashboard (autenticado)
│       ├── layout.tsx         # Layout dashboard (sidebar)
│       ├── home/              # Dashboard principal
│       ├── transactions/      # Lançamentos
│       ├── investments/       # Investimentos
│       ├── goals/             # Metas e caixinhas
│       ├── budgets/           # Orçamentos
│       ├── bills/             # Contas a pagar
│       ├── calendar/          # Calendário
│       ├── chat/              # Chat IA
│       ├── reports/           # Relatórios
│       └── settings/          # Configurações
│
├── components/                 # Componentes React
│   ├── ui/                    # shadcn/ui components
│   ├── dashboard/             # Componentes dashboard
│   ├── transactions/          # Componentes transações
│   ├── charts/                # Gráficos
│   ├── ai/                    # Componentes IA
│   └── layout/                # Layouts (sidebar, header)
│
├── lib/                        # Utilitários
│   ├── supabase/              # Cliente Supabase
│   │   ├── client.ts          # Client-side
│   │   ├── server.ts          # Server-side
│   │   └── middleware.ts      # Middleware auth
│   ├── ai/                    # Lógica IA
│   │   ├── claude.ts          # Cliente Claude
│   │   ├── categorization.ts  # Categorização
│   │   ├── insights.ts        # Insights
│   │   └── chat.ts            # Chat
│   ├── integrations/          # APIs externas
│   │   ├── binance.ts
│   │   ├── yahoo-finance.ts
│   │   ├── coingecko.ts
│   │   └── exchange-rates.ts
│   └── utils/                 # Helpers
│       ├── currency.ts
│       ├── date.ts
│       └── format.ts
│
├── hooks/                      # Custom hooks
│   ├── use-transactions.ts
│   ├── use-ai-chat.ts
│   └── use-notifications.ts
│
├── store/                      # Zustand stores
│   ├── auth-store.ts
│   ├── dashboard-store.ts
│   └── theme-store.ts
│
├── types/                      # TypeScript types
│   ├── database.types.ts      # Tipos Supabase (gerado)
│   ├── transaction.ts
│   ├── investment.ts
│   └── ai.ts
│
├── supabase/                   # Supabase config
│   ├── migrations/            # DB migrations
│   │   └── 001_initial_schema.sql
│   ├── functions/             # Edge Functions
│   │   ├── ai-categorization/
│   │   ├── telegram-webhook/
│   │   └── cron-insights/
│   └── seed.sql               # Dados iniciais
│
└── public/                     # Assets estáticos
    ├── icons/                 # PWA icons
    ├── manifest.json          # PWA manifest
    └── sw.js                  # Service Worker
```

---

## 🗄️ Schema do Banco de Dados

### Tabelas Principais

#### `users`
- `id` (uuid, PK)
- `email` (text, unique)
- `full_name` (text)
- `created_at` (timestamp)
- `settings` (jsonb) - preferências usuário

#### `accounts` (5 contas)
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `name` (text) - "ACTIVO BANK", "REVOLUT", etc
- `currency` (text) - "EUR", "BRL"
- `balance` (decimal)
- `account_type` (enum) - 'checking', 'savings', 'investment'
- `is_active` (boolean)
- `created_at` (timestamp)

#### `transactions`
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `account_id` (uuid, FK)
- `type` (enum) - 'expense', 'income', 'transfer'
- `amount` (decimal)
- `currency` (text)
- `description` (text)
- `category_id` (uuid, FK)
- `tags` (text[])
- `date` (date)
- `is_recurring` (boolean)
- `attachment_url` (text) - link para Supabase Storage
- `ai_categorized` (boolean)
- `ai_confidence` (decimal)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `categories`
- `id` (uuid, PK)
- `user_id` (uuid, FK, nullable) - null = categoria sistema
- `name` (text)
- `icon` (text)
- `color` (text)
- `type` (enum) - 'expense', 'income', 'both'
- `is_tax_deductible` (boolean) - IRS Portugal
- `parent_category_id` (uuid, FK, nullable) - subcategorias
- `created_at` (timestamp)

#### `budgets`
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `category_id` (uuid, FK, nullable)
- `amount` (decimal)
- `period` (enum) - 'weekly', 'monthly', 'yearly'
- `start_date` (date)
- `end_date` (date)
- `alert_thresholds` (jsonb) - [50, 80, 100]
- `created_at` (timestamp)

#### `bills`
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `account_id` (uuid, FK)
- `type` (enum) - 'payable', 'receivable'
- `description` (text)
- `amount` (decimal)
- `due_date` (date)
- `category_id` (uuid, FK)
- `is_recurring` (boolean)
- `recurrence_rule` (text) - RRULE format
- `is_paid` (boolean)
- `paid_date` (date, nullable)
- `installment_number` (int, nullable)
- `total_installments` (int, nullable)
- `created_at` (timestamp)

#### `investments`
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `asset_type` (enum) - 'stock', 'etf', 'fund', 'crypto', 'fixed_income'
- `symbol` (text) - ticker/código
- `name` (text)
- `quantity` (decimal)
- `average_price` (decimal)
- `current_price` (decimal)
- `currency` (text)
- `category` (enum) - 'long_term', 'emergency', 'goal'
- `goal_id` (uuid, FK, nullable)
- `auto_update_price` (boolean)
- `last_price_update` (timestamp)
- `created_at` (timestamp)

#### `investment_transactions`
- `id` (uuid, PK)
- `investment_id` (uuid, FK)
- `type` (enum) - 'buy', 'sell', 'dividend'
- `quantity` (decimal)
- `price` (decimal)
- `total_amount` (decimal)
- `fees` (decimal)
- `date` (date)
- `notes` (text)
- `created_at` (timestamp)

#### `goals`
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `name` (text) - "Viagem", "Carro", etc
- `description` (text)
- `target_amount` (decimal)
- `current_amount` (decimal)
- `currency` (text)
- `deadline` (date)
- `category` (enum) - 'emergency', 'savings', 'purchase', 'other'
- `is_active` (boolean)
- `created_at` (timestamp)

#### `milestones`
- `id` (uuid, PK)
- `goal_id` (uuid, FK)
- `name` (text)
- `target_amount` (decimal)
- `is_reached` (boolean)
- `reached_at` (timestamp, nullable)
- `order` (int)

#### `debts`
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `name` (text)
- `total_amount` (decimal)
- `remaining_amount` (decimal)
- `interest_rate` (decimal)
- `monthly_payment` (decimal)
- `start_date` (date)
- `end_date` (date)
- `created_at` (timestamp)

#### `ai_conversations`
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `messages` (jsonb[]) - [{role, content, timestamp}]
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `ai_insights`
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `type` (text) - 'unusual_spending', 'savings_opportunity', etc
- `title` (text)
- `description` (text)
- `data` (jsonb)
- `severity` (enum) - 'info', 'warning', 'critical'
- `is_read` (boolean)
- `created_at` (timestamp)

#### `ai_categorization_rules`
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `pattern` (text) - regex ou texto
- `category_id` (uuid, FK)
- `confidence` (decimal)
- `times_applied` (int)
- `created_at` (timestamp)

#### `gamification`
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `xp` (int)
- `level` (int)
- `current_streak` (int)
- `longest_streak` (int)
- `badges` (text[])
- `challenges_completed` (jsonb)
- `updated_at` (timestamp)

---

## 📊 Progresso do Desenvolvimento

### ✅ Fase 1: Documentação e Setup Inicial
- [x] Criar DEVELOPMENT.md
- [x] Organizar credenciais
- [x] Definir estrutura do projeto
- [ ] Inicializar projeto Next.js
- [ ] Configurar TypeScript + ESLint + Prettier
- [ ] Instalar dependências principais
- [ ] Criar .env.local
- [ ] Setup Supabase local

### ⏳ Fase 2: Supabase (Em andamento)
- [ ] Criar schema completo do banco
- [ ] Executar migrations
- [ ] Configurar Row Level Security (RLS)
- [ ] Seed dados iniciais (5 contas + categorias)
- [ ] Testar conexão

### 🔜 Fase 3: Autenticação
- [ ] Setup Supabase Auth
- [ ] Página login
- [ ] Página signup
- [ ] Middleware proteção rotas
- [ ] Biometria (Web Authentication API)

### 🔜 Fase 4: Layout Base
- [ ] Layout dashboard
- [ ] Sidebar responsivo
- [ ] Header com busca global
- [ ] Tema claro/escuro
- [ ] Navegação por teclado

### 🔜 Fase 5: Transações Core
- [ ] CRUD transações
- [ ] Formulário simplificado
- [ ] Listagem com filtros
- [ ] Integração categorias
- [ ] Tags

### 🔜 Fase 6: IA - Categorização
- [ ] Cliente Claude API
- [ ] Categorização automática
- [ ] Sistema de aprendizado (regras)
- [ ] Detecção duplicatas

### 🔜 Fase 7: Chat IA
- [ ] Interface chat
- [ ] Integração Claude
- [ ] Histórico conversas
- [ ] Busca inteligente
- [ ] Relatórios dinâmicos com gráficos

### 🔜 Fase 8: Entrada Avançada
- [ ] OCR notas fiscais
- [ ] Speech-to-Text
- [ ] Upload CSV/OFX
- [ ] Templates rápidos
- [ ] Bot Telegram

### 🔜 Fase 9: Dashboards
- [ ] Dashboard principal customizável
- [ ] Gráficos (Recharts)
- [ ] Calendário financeiro
- [ ] Fluxo de caixa

### 🔜 Fase 10: Orçamentos & Alertas
- [ ] CRUD orçamentos
- [ ] Alertas multi-nível
- [ ] Notificações push

### 🔜 Fase 11: Contas a Pagar
- [ ] CRUD bills
- [ ] Recorrências
- [ ] Parcelamentos
- [ ] Calendário

### 🔜 Fase 12: Investimentos
- [ ] CRUD investimentos
- [ ] Integração APIs cotações
- [ ] Dividendos
- [ ] Análises IA

### 🔜 Fase 13: Metas & Caixinhas
- [ ] Sistema metas
- [ ] Milestones
- [ ] Calculadora FIRE
- [ ] Sandbox What-If

### 🔜 Fase 14: IA Avançada
- [ ] Insights proativos (cron)
- [ ] Perfil financeiro
- [ ] Alertas automáticos

### 🔜 Fase 15: Gamificação
- [ ] XP e níveis
- [ ] Badges
- [ ] Desafios

### 🔜 Fase 16: Multi-moeda & Fiscal
- [ ] EUR + BRL
- [ ] Câmbio automático
- [ ] Cálculo IRS Portugal

### 🔜 Fase 17: PWA
- [ ] Manifest
- [ ] Service Worker
- [ ] Widgets
- [ ] Offline parcial

### 🔜 Fase 18: Deploy
- [ ] Deploy Vercel
- [ ] CI/CD GitHub Actions
- [ ] Testes

---

## 🔄 Como Retomar se o Chat Quebrar

### 1. Verificar último commit
```bash
cd /Users/vinybarreto/Personal_finance_ai
git log --oneline -10
```

### 2. Verificar PROGRESS.md
Consulte o arquivo `PROGRESS.md` para ver último passo completado com detalhes.

### 3. Verificar TODO list
No novo chat, pergunte:
```
"Qual o estado atual do projeto Finance AI PWA?
Consulte DEVELOPMENT.md e PROGRESS.md"
```

### 4. Fornecer contexto
```
"Estou continuando o desenvolvimento do Finance AI PWA.
Última fase completada: [FASE X]
Próxima tarefa: [TAREFA Y]
Veja DEVELOPMENT.md para credenciais e estrutura completa."
```

---

## 🛠 Comandos Úteis

### Desenvolvimento
```bash
# Instalar dependências
npm install

# Rodar localmente
npm run dev

# Build
npm run build

# Gerar tipos Supabase
npx supabase gen types typescript --project-id hhsxppzpcbwxhpwszwqa > types/database.types.ts

# Migrations
npx supabase db push
```

### Git
```bash
# Status
git status

# Commit
git add .
git commit -m "feat: descrição"
git push

# Ver histórico
git log --oneline
```

---

## 📝 Convenções do Código

### Commits (Conventional Commits)
- `feat:` nova funcionalidade
- `fix:` correção bug
- `docs:` documentação
- `style:` formatação
- `refactor:` refatoração
- `test:` testes
- `chore:` manutenção

### Nomenclatura
- **Componentes:** PascalCase (`TransactionCard.tsx`)
- **Funções/variáveis:** camelCase (`getUserTransactions`)
- **Constantes:** UPPER_SNAKE_CASE (`MAX_AMOUNT`)
- **Arquivos:** kebab-case (`use-transactions.ts`)

### Estrutura Componentes
```tsx
// Imports
import { useState } from 'react'

// Types
interface Props {
  // ...
}

// Component
export function ComponentName({ props }: Props) {
  // Hooks
  // State
  // Handlers
  // Effects

  // Render
  return (
    // JSX
  )
}
```

---

## 🎯 Features Avançadas

### 📊 Categorias Hierárquicas (Migration 005)

**Estrutura:** Categorias Pai → Subcategorias

**Exemplo de hierarquia:**
```
🚗 Transporte (pai)
  ├── ⛽ Combustível
  ├── 🛣️ Pedágio
  ├── 🅿️ Estacionamento
  ├── 🔧 Manutenção Veículo
  ├── 🚇 Transporte Público
  └── 🚕 Uber/Bolt

🛒 Alimentação (pai)
  ├── 🛍️ Supermercado
  ├── 🍕 Restaurantes
  ├── ☕ Cafés e Padarias
  ├── 🥡 Delivery
  └── 🍺 Bar/Bebidas
```

**Total disponível:** 11 categorias pai + 60 subcategorias = **71 categorias**!

**Categorias pai implementadas:**
- **Despesas:** Transporte, Alimentação, Habitação, Saúde, Educação, Lazer, Compras, Serviços
- **Receitas:** Trabalho, Investimentos, Outras Receitas

**Como funciona:**
1. Campo `parent_category_id` na tabela `categories`
2. Se NULL = categoria pai
3. Se preenchido = subcategoria
4. Consultas podem agregar por pai ou detalhar por subcategoria

**Arquivos:**
- `supabase/migrations/005_hierarchical_categories_seed.sql` - Seed completo
- `supabase/EXECUTAR_MIGRATION_005.md` - Guia de execução

---

### 🔄 Sistema de Recategorização Automática

**Problema resolvido:** Quando você corrige uma categorização da IA, as transações antigas ficavam com a categoria errada.

**Solução:** Sistema inteligente que:
1. Detecta transações similares (mesmo merchant ou descrição)
2. Pergunta se quer recategorizar todas
3. Aplica em lote com confirmação

**Componentes principais:**

#### 1. Server Actions (`lib/transactions/recategorize.ts`)
```typescript
// Buscar similares
findSimilarTransactionsByMerchant(merchant: string)
findSimilarTransactionsByDescription(description: string)
findAllSimilarTransactions(merchant, description)

// Recategorizar
recategorizeTransactions(transactionIds[], newCategoryId)
recategorizeByMerchant(merchant, newCategoryId)

// Aplicar padrões aprendidos
applyLearnedPatterns() // Aplica TODOS os padrões com confiança >=70%
getLearnedPatternsStats() // Estatísticas de padrões
```

#### 2. Modal de Confirmação (`components/transactions/RecategorizeModal.tsx`)
- Lista todas as transações similares encontradas
- Checkbox para selecionar quais recategorizar
- Preview: `Categoria Atual → Nova Categoria`
- Confirmação antes de aplicar

#### 3. Integração no Import
Quando você corrige uma categoria durante o import:
```typescript
const result = await learnCategoryCorrection(merchant, description, categoryId)
// Returns: { learned: true, similarCount: 15, similarTransactionIds: [...] }

if (result.similarCount > 0) {
  // Mostrar modal perguntando se quer recategorizar
}
```

#### 4. Botão "Aplicar Padrões"
Localização: `/dashboard/transactions` (header)

**Quando aparece:**
- Só aparece se houver padrões aprendidos com confiança >=70%
- Mostra contador: "Aplicar Padrões (5)"

**O que faz:**
1. Busca todos os `learned_patterns` com `confidence_score >= 0.7`
2. Para cada padrão:
   - Busca transações com mesmo merchant/descrição
   - Atualiza categoria em lote
   - Incrementa `times_applied` no padrão
3. Mostra resultado: "X transações recategorizadas usando Y padrões!"

**Como usar:**
```bash
# Usuário clica no botão
→ Confirma: "Aplicar 5 padrões aprendidos às transações existentes?"
→ Sistema processa em lote
→ Página recarrega com transações atualizadas
```

---

### 🧠 Sistema de Aprendizado de Padrões

**Tabelas envolvidas:**
- `learned_patterns` - Merchant/Descrição → Categoria
- `learned_transfers` - Padrões de transferências internas

**Confidence Score:**
- Inicia em **1.0** (100% confiança)
- Diminui **0.1** cada vez que usuário corrige
- Mínimo **0.1** (10% confiança)
- Auto-apply se `>= 0.7` (70%+)

**Exemplo de aprendizado:**
```
1ª vez: "Continente" → IA sugere "Compras"
Você corrige → "Continente" = "Alimentação > Supermercado"
Sistema salva com confidence 1.0

2ª vez: "Continente" → Aplica automaticamente "Supermercado"

Se você corrigir novamente:
- Confidence cai para 0.9
- Sistema continua aplicando (ainda >= 0.7)

Após 4 correções:
- Confidence = 0.6
- Sistema para de auto-aplicar
- Passa a apenas sugerir
```

**Campos em `learned_patterns`:**
```sql
- merchant TEXT
- description_pattern TEXT
- category_id UUID
- times_applied INTEGER -- Quantas vezes foi aplicado
- times_corrected INTEGER -- Quantas vezes foi corrigido
- confidence_score DECIMAL(3,2) -- 0.00 a 1.00
- last_applied_at TIMESTAMP
```

**Funções helper no Supabase:**
```sql
-- Incrementar uso
SELECT increment_pattern_usage(pattern_id, 'category');

-- Registrar correção (diminui confidence)
SELECT record_pattern_correction(pattern_id, 'category');
```

---

### 📥 Sistema de Import de Extratos

**Bancos suportados:**
- ✅ Revolut (CSV) - 100% funcional
- ✅ Wise (CSV) - 100% funcional
- ✅ Nubank (OFX) - 100% funcional
- ⏳ ActivoBank (PDF) - A implementar
- ⏳ NovoBanco (PDF) - A implementar

**Fluxo completo:**
```
1. Upload arquivo (drag & drop)
2. Auto-detect banco pelo formato
3. Parse transações
4. Check duplicatas (Data + Valor + Descrição)
5. Categorização:
   a. Tenta padrões aprendidos primeiro
   b. Se não tiver, usa Claude AI (batch até 50)
6. Preview editável com stats
7. Usuário pode:
   - Editar categorias
   - Forçar import de duplicatas
   - Confirmar ou cancelar
8. Import em lote
9. Summary com estatísticas
```

**Detecção de duplicatas:**
- Data exata
- Valor exato (absoluto)
- Descrição exata (após normalização)
- Score >= 95% = duplicata

**Integração com aprendizado:**
Durante o import, quando você edita uma categoria:
```typescript
1. Sistema salva padrão em learned_patterns
2. Busca transações similares já importadas
3. Se encontrar >= 1, mostra modal:
   "Encontramos 15 transações de 'Continente'. Recategorizar todas?"
4. Usuário escolhe quais recategorizar
5. Aplica em lote
```

**Arquivos principais:**
```
lib/import/
├── parsers/
│   ├── revolut.ts
│   ├── wise.ts
│   ├── nubank.ts
│   └── index.ts (auto-detect)
├── actions.ts (server actions)
└── duplicate-detection.ts

components/import/
├── FileUpload.tsx
├── TransactionPreview.tsx
└── ...

app/dashboard/import/
├── page.tsx
└── ImportClient.tsx
```

---

### 🗃️ Migrations Executadas

```
001_initial_schema.sql       - Schema completo (20+ tabelas)
002_rls_policies.sql         - RLS policies (segurança)
003_templates_and_recurring.sql - Templates de transações
004_import_and_learning.sql  - Import + Sistema de aprendizado
005_hierarchical_categories_seed.sql - Categorias hierárquicas (71 categorias)
```

**Como executar nova migration:**
1. Criar arquivo SQL em `supabase/migrations/`
2. Acessar Supabase Dashboard → SQL Editor
3. Copiar e colar SQL
4. Run
5. Verificar sucesso

---

## 🔗 Links Importantes

- **Supabase Dashboard:** https://supabase.com/dashboard/project/hhsxppzpcbwxhpwszwqa
- **Anthropic Console:** https://console.anthropic.com
- **GitHub Repo:** https://github.com/vinybarreto/finance-ai-pwa
- **Telegram Bot:** https://t.me/finance_ai_vinycius_bot
- **Vercel Dashboard:** https://vercel.com/dashboard

---

## 📞 Suporte

Se algo não estiver funcionando:
1. Verificar logs no console
2. Consultar este documento
3. Verificar PROGRESS.md para detalhes técnicos
4. Perguntar no chat fornecendo contexto completo

---

**Última atualização:** 2025-10-19 - Adicionadas categorias hierárquicas + recategorização automática
