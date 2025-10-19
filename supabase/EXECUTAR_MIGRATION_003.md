# Como Executar Migration 003

## Passo a Passo

1. Acesse o Supabase Dashboard:
   https://supabase.com/dashboard/project/hhsxppzpcbwxhpwszwqa

2. Vá em **SQL Editor** (no menu lateral esquerdo)

3. Clique em **New Query**

4. Copie o conteúdo do arquivo `supabase/migrations/003_templates_and_recurring.sql`

5. Cole no editor e clique em **Run** (ou pressione Ctrl/Cmd + Enter)

6. Aguarde a confirmação "Success. No rows returned"

## O que essa migration faz:

- ✅ Cria tabela `transaction_templates` para templates de transações
- ✅ Adiciona campos de recorrência na tabela `transactions`
- ✅ Cria RLS policies para segurança
- ✅ Adiciona função `increment_template_usage()`
- ✅ Adiciona função `create_default_templates()` (templates de exemplo)

## Verificar se funcionou:

No SQL Editor, execute:
```sql
SELECT * FROM public.transaction_templates LIMIT 1;
```

Se não der erro, a migration foi executada com sucesso!
