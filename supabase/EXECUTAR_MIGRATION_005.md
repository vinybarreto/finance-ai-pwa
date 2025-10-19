# Como Executar Migration 005

## Passo a Passo

1. Acesse o Supabase Dashboard:
   https://supabase.com/dashboard/project/hhsxppzpcbwxhpwszwqa

2. Vá em **SQL Editor** (no menu lateral esquerdo)

3. Clique em **New Query**

4. Copie o conteúdo do arquivo `supabase/migrations/005_hierarchical_categories_seed.sql`

5. Cole no editor e clique em **Run** (ou pressione Ctrl/Cmd + Enter)

6. Aguarde a confirmação "Success. No rows returned"

## O que essa migration faz:

### 📊 Estrutura Hierárquica criada:

**DESPESAS:**
- 🚗 **Transporte** (6 subcategorias)
  - Combustível, Pedágio, Estacionamento, Manutenção, Transporte Público, Uber/Bolt

- 🛒 **Alimentação** (5 subcategorias)
  - Supermercado, Restaurantes, Cafés, Delivery, Bar/Bebidas

- 🏠 **Habitação** (8 subcategorias)
  - Aluguel, Condomínio, Energia, Água, Gás, Internet, Telefone, Manutenção

- 🏥 **Saúde** (6 subcategorias)
  - Farmácia, Consultas, Exames, Plano de Saúde, Academia, Dentista

- 📚 **Educação** (5 subcategorias)
  - Mensalidade, Material, Livros, Cursos Online, Idiomas

- 🎮 **Lazer** (6 subcategorias)
  - Cinema/Teatro, Streaming, Viagens, Hobbies, Games, Eventos

- 🛍️ **Compras** (6 subcategorias)
  - Roupas, Eletrônicos, Casa, Presentes, Beleza, Pet Shop

- 💼 **Serviços** (5 subcategorias)
  - Seguros, Impostos, Taxas Bancárias, Advogado, Contabilidade

**RECEITAS:**
- 💰 **Trabalho** (5 subcategorias)
  - Salário, Freelance, Bônus, Comissões, 13º Salário

- 📈 **Investimentos** (4 subcategorias)
  - Dividendos, Juros, Rendimento, Venda de Ativos

- 🎁 **Outras Receitas** (4 subcategorias)
  - Presente, Reembolso, Prêmio, Venda

**Total:** 11 categorias pai + 60 subcategorias = 71 categorias!

## Verificar se funcionou:

No SQL Editor, execute:
```sql
-- Ver todas as categorias pai
SELECT id, name, icon, type
FROM public.categories
WHERE parent_category_id IS NULL
ORDER BY type, name;

-- Ver exemplo de hierarquia (Transporte)
SELECT
  p.name as categoria_pai,
  c.name as subcategoria,
  c.icon,
  c.type
FROM public.categories c
LEFT JOIN public.categories p ON c.parent_category_id = p.id
WHERE p.name = 'Transporte'
ORDER BY c.name;
```

Se ver as categorias hierárquicas, funcionou! ✅
