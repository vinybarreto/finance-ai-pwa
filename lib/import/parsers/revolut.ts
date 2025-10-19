/**
 * Parser CSV - Revolut
 *
 * Formato esperado:
 * Tipo,Produto,Data de início,Data de Conclusão,Descrição,Montante,Comissão,Moeda,Estado,Saldo
 */

export interface RevolutRow {
  Tipo: string
  Produto: string
  'Data de início': string
  'Data de Conclusão': string
  Descrição: string
  Montante: string
  Comissão: string
  Moeda: string
  Estado: string
  Saldo: string
}

export interface ParsedTransaction {
  date: string // YYYY-MM-DD
  description: string
  amount: number
  currency: string
  merchant?: string
  notes?: string
  type: 'income' | 'expense' | 'transfer'
  rawData: any // dados originais para debug
}

/**
 * Detectar se o arquivo é do Revolut
 */
export function isRevolutFormat(content: string): boolean {
  const firstLine = content.split('\n')[0]
  return (
    firstLine.includes('Tipo') &&
    firstLine.includes('Produto') &&
    firstLine.includes('Data de Conclusão') &&
    firstLine.includes('Descrição') &&
    firstLine.includes('Montante') &&
    firstLine.includes('Saldo')
  )
}

/**
 * Parsear CSV do Revolut
 */
export function parseRevolutCSV(content: string): ParsedTransaction[] {
  const lines = content.split('\n').filter((line) => line.trim())
  if (lines.length < 2) return []

  // Header
  const headers = parseCSVLine(lines[0])

  // Rows
  const transactions: ParsedTransaction[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length !== headers.length) continue

    const row: any = {}
    headers.forEach((header, index) => {
      row[header] = values[index]
    })

    // Só importar transações CONCLUÍDAS
    if (row['Estado'] !== 'CONCLUÍDA') continue

    const parsed = parseRevolutRow(row as RevolutRow)
    if (parsed) {
      transactions.push(parsed)
    }
  }

  return transactions
}

/**
 * Parsear uma linha de CSV (suporta vírgulas dentro de aspas)
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

/**
 * Parsear uma linha do Revolut
 */
function parseRevolutRow(row: RevolutRow): ParsedTransaction | null {
  try {
    // Parse date: "2025-09-01 06:10:18" → "2025-09-01"
    const date = row['Data de Conclusão'].split(' ')[0]

    // Parse amount
    const amount = parseFloat(row.Montante.replace(',', '.'))
    if (isNaN(amount)) return null

    // Determinar tipo baseado no montante
    let type: 'income' | 'expense' | 'transfer'
    if (amount > 0) {
      type = 'income'
    } else {
      type = 'expense'
    }

    // Detectar transferências internas
    const description = row.Descrição
    if (isInternalTransfer(description, row.Tipo)) {
      type = 'transfer'
    }

    // Extrair merchant da descrição
    const merchant = extractMerchant(description, row.Tipo)

    // Notas adicionais
    const notes = buildNotes(row)

    return {
      date,
      description,
      amount: Math.abs(amount), // sempre positivo
      currency: row.Moeda,
      merchant,
      notes,
      type,
      rawData: row,
    }
  } catch (error) {
    console.error('Error parsing Revolut row:', error, row)
    return null
  }
}

/**
 * Detectar se é transferência interna
 */
function isInternalTransfer(description: string, tipo: string): boolean {
  const internalPatterns = [
    /to\s+.*viny/i, // To Vinycius, To Activo Viny
    /from\s+.*viny/i, // From Vinycius
    /arredondamento/i, // Arredondamento de trocos
    /revolut.*revolut/i,
    /transfer to revolut/i,
  ]

  return internalPatterns.some((pattern) => pattern.test(description))
}

/**
 * Extrair merchant da descrição
 */
function extractMerchant(description: string, tipo: string): string | undefined {
  // Padrões conhecidos
  const patterns = [
    // Pagamentos com cartão geralmente têm o merchant no final
    { regex: /pagamento.*?-\s*(.+)$/i, group: 1 },
    // Transferências podem ter "To X" ou "From X"
    { regex: /(?:to|from)\s+([^-]+)/i, group: 1 },
  ]

  for (const pattern of patterns) {
    const match = description.match(pattern.regex)
    if (match && match[pattern.group]) {
      return match[pattern.group].trim()
    }
  }

  // Se é pagamento com cartão, extrair nome do estabelecimento
  if (tipo === 'Pagamento com cartão') {
    // "Bolt" → Bolt
    // "Continente" → Continente
    const words = description.split(/[,\-]/)
    if (words.length > 0) {
      const firstWord = words[0].trim()
      if (firstWord.length > 0 && firstWord.length < 50) {
        return firstWord
      }
    }
  }

  return undefined
}

/**
 * Construir notas adicionais
 */
function buildNotes(row: RevolutRow): string | undefined {
  const notes: string[] = []

  // Adicionar tipo da transação
  if (row.Tipo) {
    notes.push(`Tipo: ${row.Tipo}`)
  }

  // Adicionar comissão se houver
  const comissao = parseFloat(row.Comissão?.replace(',', '.') || '0')
  if (comissao > 0) {
    notes.push(`Comissão: €${comissao.toFixed(2)}`)
  }

  // Adicionar produto
  if (row.Produto && row.Produto !== 'Atual') {
    notes.push(`Produto: ${row.Produto}`)
  }

  return notes.length > 0 ? notes.join(' | ') : undefined
}

/**
 * Validar estrutura do CSV
 */
export function validateRevolutCSV(content: string): {
  valid: boolean
  error?: string
} {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Arquivo vazio' }
  }

  if (!isRevolutFormat(content)) {
    return { valid: false, error: 'Formato não reconhecido como Revolut' }
  }

  const lines = content.split('\n').filter((line) => line.trim())
  if (lines.length < 2) {
    return { valid: false, error: 'CSV não contém transações' }
  }

  return { valid: true }
}
