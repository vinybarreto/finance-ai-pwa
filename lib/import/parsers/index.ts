/**
 * Auto-detector de formato de extrato bancário
 */

import { isRevolutFormat, parseRevolutCSV, validateRevolutCSV } from './revolut'
import { isWiseFormat, parseWiseCSV, validateWiseCSV } from './wise'
import { isNubankFormat, parseNubankOFX, validateNubankOFX } from './nubank'

export type BankName = 'revolut' | 'activo' | 'novobanco' | 'wise' | 'nubank' | 'unknown'

export interface ParsedTransaction {
  date: string // YYYY-MM-DD
  description: string
  amount: number
  currency: string
  merchant?: string
  notes?: string
  type: 'income' | 'expense' | 'transfer'
  rawData: any
}

export interface DetectionResult {
  bank: BankName
  confidence: number // 0.0 to 1.0
  fileType: 'csv' | 'ofx' | 'pdf' | 'unknown'
}

/**
 * Auto-detectar banco baseado no conteúdo do arquivo
 */
export function detectBank(content: string, fileName: string): DetectionResult {
  // 1. Tentar Nubank OFX
  if (isNubankFormat(content)) {
    return {
      bank: 'nubank',
      confidence: 1.0,
      fileType: 'ofx',
    }
  }

  // 2. Tentar Revolut CSV
  if (isRevolutFormat(content)) {
    return {
      bank: 'revolut',
      confidence: 1.0,
      fileType: 'csv',
    }
  }

  // 3. Tentar Wise CSV
  if (isWiseFormat(content)) {
    return {
      bank: 'wise',
      confidence: 1.0,
      fileType: 'csv',
    }
  }

  // 4. Detectar por nome do arquivo
  const lowerFileName = fileName.toLowerCase()

  if (lowerFileName.includes('revolut') || lowerFileName.includes('account-statement')) {
    return {
      bank: 'revolut',
      confidence: 0.7,
      fileType: 'csv',
    }
  }

  if (lowerFileName.includes('wise') || lowerFileName.includes('transferwise') || lowerFileName.includes('balance_statement')) {
    return {
      bank: 'wise',
      confidence: 0.7,
      fileType: 'csv',
    }
  }

  if (lowerFileName.includes('nubank') || lowerFileName.includes('nu_') || lowerFileName.includes('.ofx')) {
    return {
      bank: 'nubank',
      confidence: 0.7,
      fileType: 'ofx',
    }
  }

  if (lowerFileName.includes('activo')) {
    return {
      bank: 'activo',
      confidence: 0.7,
      fileType: fileName.endsWith('.pdf') ? 'pdf' : 'csv',
    }
  }

  if (lowerFileName.includes('novo') || lowerFileName.includes('novobanco')) {
    return {
      bank: 'novobanco',
      confidence: 0.7,
      fileType: 'pdf',
    }
  }

  return {
    bank: 'unknown',
    confidence: 0.0,
    fileType: 'unknown',
  }
}

/**
 * Parsear arquivo de qualquer banco
 */
export function parseFile(
  content: string,
  bank: BankName
): ParsedTransaction[] {
  switch (bank) {
    case 'revolut':
      return parseRevolutCSV(content)
    case 'wise':
      return parseWiseCSV(content)
    case 'nubank':
      return parseNubankOFX(content)
    case 'activo':
      // TODO: Implementar parser PDF
      throw new Error('ActivoBank PDF parser ainda não implementado')
    case 'novobanco':
      // TODO: Implementar parser PDF
      throw new Error('NovoBanco PDF parser ainda não implementado')
    default:
      throw new Error('Banco não suportado: ' + bank)
  }
}

/**
 * Validar arquivo
 */
export function validateFile(
  content: string,
  bank: BankName
): { valid: boolean; error?: string } {
  switch (bank) {
    case 'revolut':
      return validateRevolutCSV(content)
    case 'wise':
      return validateWiseCSV(content)
    case 'nubank':
      return validateNubankOFX(content)
    case 'activo':
      return { valid: false, error: 'ActivoBank PDF ainda não suportado' }
    case 'novobanco':
      return { valid: false, error: 'NovoBanco PDF ainda não suportado' }
    default:
      return { valid: false, error: 'Banco desconhecido' }
  }
}

/**
 * Obter nome amigável do banco
 */
export function getBankDisplayName(bank: BankName): string {
  const names: Record<BankName, string> = {
    revolut: 'Revolut',
    activo: 'ActivoBank',
    novobanco: 'Novo Banco',
    wise: 'Wise',
    nubank: 'Nubank',
    unknown: 'Desconhecido',
  }
  return names[bank] || bank
}

/**
 * Obter ícone do banco
 */
export function getBankIcon(bank: BankName): string {
  const icons: Record<BankName, string> = {
    revolut: '💳',
    activo: '🏦',
    novobanco: '🏛️',
    wise: '🌍',
    nubank: '💜',
    unknown: '❓',
  }
  return icons[bank] || '🏦'
}

// Re-export tipos
export type { ParsedTransaction as Transaction }
