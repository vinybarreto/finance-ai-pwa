/**
 * Parser CSV - Wise (TransferWise)
 *
 * Formato esperado:
 * "TransferWise ID",Date,"Date Time",Amount,Currency,Description,"Payment Reference","Running Balance",...
 */

export interface WiseRow {
  'TransferWise ID': string
  Date: string
  'Date Time': string
  Amount: string
  Currency: string
  Description: string
  'Payment Reference': string
  'Running Balance': string
  'Exchange From': string
  'Exchange To': string
  'Exchange Rate': string
  'Payer Name': string
  'Payee Name': string
  'Payee Account Number': string
  Merchant: string
  'Card Last Four Digits': string
  'Card Holder Full Name': string
  Attachment: string
  Note: string
  'Total fees': string
  'Exchange To Amount': string
  'Transaction Type': string
  'Transaction Details Type': string
}

export interface ParsedTransaction {
  date: string
  description: string
  amount: number
  currency: string
  merchant?: string
  notes?: string
  type: 'income' | 'expense' | 'transfer'
  rawData: any
}

/**
 * Detectar se o arquivo é do Wise
 */
export function isWiseFormat(content: string): boolean {
  const firstLine = content.split('\n')[0]
  return (
    firstLine.includes('TransferWise ID') &&
    firstLine.includes('Date') &&
    firstLine.includes('Amount') &&
    firstLine.includes('Currency') &&
    firstLine.includes('Exchange Rate') &&
    firstLine.includes('Transaction Type')
  )
}

/**
 * Parsear CSV do Wise
 */
export function parseWiseCSV(content: string): ParsedTransaction[] {
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

    const parsed = parseWiseRow(row as WiseRow)
    if (parsed) {
      transactions.push(parsed)
    }
  }

  return transactions
}

/**
 * Parsear uma linha de CSV (suporta vírgulas e aspas)
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
 * Parsear uma linha do Wise
 */
function parseWiseRow(row: WiseRow): ParsedTransaction | null {
  try {
    // Parse date: "27-09-2025" → "2025-09-27"
    const dateParts = row.Date.split('-')
    const date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`

    // Parse amount
    const amount = parseFloat(row.Amount.replace(',', '.'))
    if (isNaN(amount)) return null

    // Determinar tipo baseado no Transaction Type
    let type: 'income' | 'expense' | 'transfer'
    if (row['Transaction Type'] === 'CREDIT') {
      type = 'income'
    } else if (row['Transaction Type'] === 'DEBIT') {
      type = 'expense'
    } else {
      type = amount > 0 ? 'income' : 'expense'
    }

    // Detectar transferências internas
    const description = row.Description
    if (isInternalTransfer(description, row)) {
      type = 'transfer'
    }

    // Extrair merchant
    const merchant = extractMerchant(row)

    // Notas adicionais
    const notes = buildNotes(row)

    return {
      date,
      description,
      amount: Math.abs(amount),
      currency: row.Currency,
      merchant,
      notes,
      type,
      rawData: row,
    }
  } catch (error) {
    console.error('Error parsing Wise row:', error, row)
    return null
  }
}

/**
 * Detectar se é transferência interna (entre contas próprias)
 */
function isInternalTransfer(description: string, row: WiseRow): boolean {
  const internalPatterns = [
    /enviou dinheiro para viny/i,
    /recebeu dinheiro de viny/i,
    /to viny/i,
    /from viny/i,
    /dinheiro adicionado/i, // Money added
    /money added/i,
  ]

  // Verificar padrões na descrição
  if (internalPatterns.some((pattern) => pattern.test(description))) {
    return true
  }

  // Se é "TRANSFER" para conta própria
  if (
    row['Transaction Details Type'] === 'TRANSFER' &&
    (row['Payee Name']?.toLowerCase().includes('viny') ||
      row['Payer Name']?.toLowerCase().includes('viny'))
  ) {
    return true
  }

  // Se é conversão de moeda interna (MONEY_ADDED)
  if (row['Transaction Details Type'] === 'MONEY_ADDED') {
    return true
  }

  return false
}

/**
 * Extrair merchant/beneficiário
 */
function extractMerchant(row: WiseRow): string | undefined {
  // 1. Usar campo Merchant se disponível
  if (row.Merchant && row.Merchant.trim()) {
    return row.Merchant.trim()
  }

  // 2. Se é DEBIT, usar Payee Name
  if (row['Transaction Type'] === 'DEBIT' && row['Payee Name']) {
    return row['Payee Name'].trim()
  }

  // 3. Se é CREDIT, usar Payer Name
  if (row['Transaction Type'] === 'CREDIT' && row['Payer Name']) {
    return row['Payer Name'].trim()
  }

  // 4. Extrair da descrição
  const descMatch = row.Description.match(/(?:para|de|to|from)\s+([^-]+)/i)
  if (descMatch && descMatch[1]) {
    return descMatch[1].trim()
  }

  return undefined
}

/**
 * Construir notas adicionais
 */
function buildNotes(row: WiseRow): string | undefined {
  const notes: string[] = []

  // Transaction Details Type
  if (row['Transaction Details Type']) {
    notes.push(`Tipo: ${row['Transaction Details Type']}`)
  }

  // Fees
  const fees = parseFloat(row['Total fees']?.replace(',', '.') || '0')
  if (fees > 0) {
    notes.push(`Taxa: ${row.Currency} ${fees.toFixed(2)}`)
  }

  // Exchange rate
  if (row['Exchange Rate'] && row['Exchange From'] && row['Exchange To']) {
    notes.push(
      `Câmbio: ${row['Exchange From']} → ${row['Exchange To']} (${row['Exchange Rate']})`
    )
    if (row['Exchange To Amount']) {
      notes.push(`Valor convertido: ${row['Exchange To Amount']}`)
    }
  }

  // Conta destino (se houver)
  if (row['Payee Account Number']) {
    notes.push(`Conta: ${row['Payee Account Number']}`)
  }

  // Payment Reference
  if (row['Payment Reference'] && row['Payment Reference'].trim()) {
    notes.push(`Ref: ${row['Payment Reference']}`)
  }

  // Note field
  if (row.Note && row.Note.trim()) {
    notes.push(`Nota: ${row.Note}`)
  }

  return notes.length > 0 ? notes.join(' | ') : undefined
}

/**
 * Validar estrutura do CSV
 */
export function validateWiseCSV(content: string): {
  valid: boolean
  error?: string
} {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Arquivo vazio' }
  }

  if (!isWiseFormat(content)) {
    return { valid: false, error: 'Formato não reconhecido como Wise' }
  }

  const lines = content.split('\n').filter((line) => line.trim())
  if (lines.length < 2) {
    return { valid: false, error: 'CSV não contém transações' }
  }

  return { valid: true }
}
