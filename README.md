# 💰 Finance AI - Gestão Financeira Inteligente

Sistema completo de gestão financeira pessoal com IA integrada (Claude) para insights automáticos, categorização inteligente e chat interativo sobre suas finanças.

## 🚀 Status do Projeto

**Versão:** 0.1.0 (Em desenvolvimento ativo)

**Progresso Atual:**
- ✅ Setup inicial do projeto
- ⏳ Configuração Supabase (em andamento)
- 🔜 Autenticação
- 🔜 Dashboard e funcionalidades core

Consulte [PROGRESS.md](./PROGRESS.md) para progresso detalhado em tempo real.

## 🎯 Funcionalidades Planejadas

### Core
- 💸 **Lançamentos Simplificados**: Voz, foto de nota, upload extratos, chat IA
- 🏦 **Multi-Contas**: 5 contas (EUR + BRL) com transferências internas
- 📊 **Dashboards Customizáveis**: Gráficos, calendário, fluxo de caixa
- 🎯 **Orçamentos Inteligentes**: Alertas multi-nível, projeções IA

### IA Integrada (Claude)
- 🤖 **Categorização Automática**: Aprende seus padrões
- 💬 **Chat Interativo**: Perguntas em linguagem natural
- 📈 **Insights Proativos**: Análises semanais e mensais
- 🔮 **Previsões**: Simulações e planejamento financeiro

### Investimentos
- 📈 **Ações, ETFs, Cripto**: Cotações automáticas (Binance, Yahoo Finance)
- 💰 **Dividendos**: Controle detalhado de rendimentos
- 🎯 **Caixinhas**: Objetivos com milestones
- 🔥 **Calculadora FIRE**: Independência financeira

### Avançado
- 🇵🇹 **IRS Portugal**: Categorias dedutíveis, cálculo automático
- 🎮 **Gamificação**: XP, badges, desafios
- 📱 **PWA**: Instalável, notificações push, widgets
- 📲 **Telegram**: Lançar gastos via bot

## 🛠 Stack Tecnológica

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Real-time)
- **IA**: Anthropic Claude API
- **Deploy**: Vercel
- **Integrações**: Binance, Yahoo Finance, CoinGecko, Telegram

## 📚 Documentação

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Documentação completa para desenvolvedores
- **[PROGRESS.md](./PROGRESS.md)** - Log detalhado do desenvolvimento
- **[.env.example](./.env.example)** - Template de variáveis de ambiente

## 🏃‍♂️ Como Rodar Localmente

### Pré-requisitos
- Node.js 18+
- Conta Supabase
- Anthropic API Key

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/vinybarreto/finance-ai-pwa.git
cd finance-ai-pwa
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:
- Anthropic API Key
- Supabase URL + Keys
- Telegram Bot Token (opcional)
- Binance API (opcional)

4. **Execute o servidor de desenvolvimento**
```bash
npm run dev
```

5. **Acesse** http://localhost:3000

## 📖 Comandos Disponíveis

```bash
npm run dev       # Servidor desenvolvimento
npm run build     # Build produção
npm run start     # Servidor produção
npm run lint      # Lint código
```

## 🔐 Segurança

- ✅ Credenciais em `.env.local` (não commitado)
- ✅ GitHub Secret Scanning habilitado
- ✅ Binance API em modo READ ONLY
- ✅ Row Level Security no Supabase

## 🤝 Contribuindo

Este é um projeto pessoal em desenvolvimento. Sugestões e feedback são bem-vindos via Issues!

## 📝 Licença

Privado - © 2025

## 🔗 Links Importantes

- **Repositório**: https://github.com/vinybarreto/finance-ai-pwa
- **Supabase Dashboard**: https://supabase.com/dashboard/project/hhsxppzpcbwxhpwszwqa
- **Telegram Bot**: https://t.me/finance_ai_vinycius_bot

---

**Desenvolvido com ❤️ por Viny Barreto + Claude Code**
