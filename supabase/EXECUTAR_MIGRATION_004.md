# Como Executar Migration 004

## Passo a Passo

1. Acesse o Supabase Dashboard:
   https://supabase.com/dashboard/project/hhsxppzpcbwxhpwszwqa

2. Vá em **SQL Editor** (no menu lateral esquerdo)

3. Clique em **New Query**

4. Copie o conteúdo do arquivo `supabase/migrations/004_import_and_learning.sql`

5. Cole no editor e clique em **Run** (ou pressione Ctrl/Cmd + Enter)

6. Aguarde a confirmação "Success. No rows returned"

## O que essa migration faz:

### 📊 Tabelas criadas:

1. **`import_batches`** - Histórico de imports
   - Registra cada import de extrato
   - Stats: total importado, duplicatas, erros
   - Status: pending → processing → completed/failed

2. **`learned_patterns`** - Aprendizado de Categorização
   - Merchant/Descrição → Categoria
   - Sistema de confiança (confidence score)
   - Aprende com suas correções

3. **`learned_transfers`** - Aprendizado de Transferências
   - Padrão de descrição → É transferência interna?
   - Detecta automaticamente transferências
   - Aprende com suas correções

### 🧠 Sistema de Aprendizado:

- **Confidence Score:** 0.00 a 1.00
  - Começa em 1.00 (100% confiança)
  - Diminui 0.10 cada vez que você corrige
  - Mínimo 0.10 (10% confiança)

- **Aplicação de Padrões:**
  - Se confidence ≥ 0.70 → aplica automaticamente
  - Se confidence < 0.70 → sugere mas pede confirmação

## Verificar se funcionou:

No SQL Editor, execute:
```sql
SELECT * FROM public.import_batches LIMIT 1;
SELECT * FROM public.learned_patterns LIMIT 1;
SELECT * FROM public.learned_transfers LIMIT 1;
```

Se não der erro, a migration foi executada com sucesso! ✅
