/**
 * Parser OFX - Nubank
 *
 * Formato OFX (XML-like)
 */

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

interface OFXTransaction {
  TRNTYPE: string // CREDIT or DEBIT
  DTPOSTED: string // 20250901000000[-3:BRT]
  TRNAMT: string // amount
  FITID: string // unique ID
  MEMO: string // description
}

/**
 * Detectar se o arquivo é OFX do Nubank
 */
export function isNubankFormat(content: string): boolean {
  return (
    content.includes('OFXHEADER') &&
    content.includes('NU PAGAMENTOS') &&
    content.includes('<STMTTRN>') &&
    content.includes('<BANKTRANLIST>')
  )
}

/**
 * Parsear OFX do Nubank
 */
export function parseNubankOFX(content: string): ParsedTransaction[] {
  try {
    // Extrair moeda
    const currencyMatch = content.match(/<CURDEF>([A-Z]{3})<\/CURDEF>/)
    const currency = currencyMatch ? currencyMatch[1] : 'BRL'

    // Extrair todas as transações <STMTTRN>...</STMTTRN>
    const transactionBlocks = extractTransactionBlocks(content)

    const transactions: ParsedTransaction[] = []

    for (const block of transactionBlocks) {
      const parsed = parseOFXTransaction(block, currency)
      if (parsed) {
        transactions.push(parsed)
      }
    }

    return transactions
  } catch (error) {
    console.error('Error parsing Nubank OFX:', error)
    return []
  }
}

/**
 * Extrair blocos <STMTTRN>...</STMTTRN>
 */
function extractTransactionBlocks(content: string): string[] {
  const blocks: string[] = []
  const regex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g
  let match

  while ((match = regex.exec(content)) !== null) {
    blocks.push(match[1])
  }

  return blocks
}

/**
 * Parsear um bloco de transação OFX
 */
function parseOFXTransaction(
  block: string,
  currency: string
): ParsedTransaction | null {
  try {
    // Extrair campos
    const trnType = extractOFXField(block, 'TRNTYPE')
    const dtPosted = extractOFXField(block, 'DTPOSTED')
    const trnAmt = extractOFXField(block, 'TRNAMT')
    const fitId = extractOFXField(block, 'FITID')
    const memo = extractOFXField(block, 'MEMO')

    if (!dtPosted || !trnAmt || !memo) return null

    // Parse date: "20250901000000[-3:BRT]" → "2025-09-01"
    const date = parseOFXDate(dtPosted)

    // Parse amount
    const amount = parseFloat(trnAmt)
    if (isNaN(amount)) return null

    // Determinar tipo
    let type: 'income' | 'expense' | 'transfer'
    if (trnType === 'CREDIT' || amount > 0) {
      type = 'income'
    } else {
      type = 'expense'
    }

    // Detectar transferências internas
    if (isInternalTransfer(memo)) {
      type = 'transfer'
    }

    // Extrair merchant
    const merchant = extractMerchant(memo)

    // Notas
    const notes = buildNotes(trnType || '', fitId || '')

    return {
      date,
      description: memo.trim(),
      amount: Math.abs(amount),
      currency,
      merchant,
      notes,
      type,
      rawData: { trnType, dtPosted, trnAmt, fitId, memo },
    }
  } catch (error) {
    console.error('Error parsing OFX transaction block:', error, block)
    return null
  }
}

/**
 * Extrair campo de um bloco OFX
 */
function extractOFXField(block: string, fieldName: string): string | null {
  // Formato: <FIELDNAME>value</FIELDNAME> ou <FIELDNAME>value (sem tag de fechamento)
  const regex1 = new RegExp(`<${fieldName}>([^<]+)</${fieldName}>`, 'i')
  const regex2 = new RegExp(`<${fieldName}>([^\\n<]+)`, 'i')

  const match1 = block.match(regex1)
  if (match1) return match1[1].trim()

  const match2 = block.match(regex2)
  if (match2) return match2[1].trim()

  return null
}

/**
 * Parse OFX date: "20250901000000[-3:BRT]" → "2025-09-01"
 */
function parseOFXDate(dateStr: string): string {
  // Remove timezone info
  const cleanDate = dateStr.split('[')[0]

  // Extract YYYYMMDD
  const year = cleanDate.substring(0, 4)
  const month = cleanDate.substring(4, 6)
  const day = cleanDate.substring(6, 8)

  return `${year}-${month}-${day}`
}

/**
 * Detectar se é transferência interna
 */
function isInternalTransfer(memo: string): boolean {
  const internalPatterns = [
    /pix.*vinycius/i,
    /pix.*barreto/i,
    /wise brasil/i, // Transferências Wise → Nubank
    /crédito em conta/i, // Crédito seguido de reversal
    /transferência enviada pelo pix.*reversal/i,
  ]

  return internalPatterns.some((pattern) => pattern.test(memo))
}

/**
 * Extrair merchant do MEMO
 */
function extractMerchant(memo: string): string | undefined {
  // Padrões comuns no Nubank:
  // "Transferência recebida pelo Pix - Wise Brasil Corretora..."
  // "Transferência enviada pelo Pix - Pâmela Viana Fernandes..."
  // "Pagamento de fatura"

  const patterns = [
    // Pix recebido/enviado
    { regex: /pix\s*-\s*([^-]+?)(?:\s*-|$)/i, group: 1 },
    // Pagamento de fatura
    { regex: /pagamento.*?(?:de|da)\s+(.+)/i, group: 1 },
  ]

  for (const pattern of patterns) {
    const match = memo.match(pattern.regex)
    if (match && match[pattern.group]) {
      let merchant = match[pattern.group].trim()

      // Limpar CPF/CNPJ
      merchant = merchant.replace(/•••\.\d{3}\.\d{3}-••/g, '').trim()
      merchant = merchant.replace(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g, '').trim()

      // Limpar banco/agência
      merchant = merchant.replace(/\([^)]+\)\s*Agência:.*$/i, '').trim()

      if (merchant.length > 0 && merchant.length < 100) {
        return merchant
      }
    }
  }

  return undefined
}

/**
 * Construir notas adicionais
 */
function buildNotes(trnType: string, fitId: string): string | undefined {
  const notes: string[] = []

  if (trnType) {
    notes.push(`Tipo: ${trnType}`)
  }

  if (fitId) {
    notes.push(`ID: ${fitId}`)
  }

  return notes.length > 0 ? notes.join(' | ') : undefined
}

/**
 * Validar OFX
 */
export function validateNubankOFX(content: string): {
  valid: boolean
  error?: string
} {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Arquivo vazio' }
  }

  if (!isNubankFormat(content)) {
    return { valid: false, error: 'Formato não reconhecido como Nubank OFX' }
  }

  if (!content.includes('<STMTTRN>')) {
    return { valid: false, error: 'OFX não contém transações' }
  }

  return { valid: true }
}
