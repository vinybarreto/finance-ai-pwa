/**
 * Template Card - Card de template de transação
 *
 * Mostra informações do template e permite usar ou deletar
 */

'use client'

import { useState } from 'react'
import { Zap, Trash2 } from 'lucide-react'
import { useTemplate as applyTemplate, deleteTemplate } from '@/lib/templates/actions'
import type { Template } from '@/lib/templates/actions'

interface TemplateCardProps {
  template: Template
  onUse?: () => void
  onDelete?: () => void
}

export default function TemplateCard({ template, onUse, onDelete }: TemplateCardProps) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Usar template para criar transação
  const handleUse = async () => {
    setLoading(true)

    const result = await applyTemplate(template.id)

    if (result.error) {
      alert('Erro ao criar transação: ' + result.error)
    } else {
      // Mostrar feedback de sucesso
      alert('✅ Transação criada com sucesso!')
      onUse?.()
    }

    setLoading(false)
  }

  // Deletar template
  const handleDelete = async () => {
    if (!confirm(`Deseja realmente deletar o template "${template.name}"?`)) return

    setDeleting(true)

    const result = await deleteTemplate(template.id)

    if (result.error) {
      alert('Erro ao deletar template: ' + result.error)
      setDeleting(false)
    } else {
      onDelete?.()
    }
  }

  // Formatar moeda
  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'EUR' ? '€' : currency === 'BRL' ? 'R$' : currency
    return `${symbol} ${amount.toFixed(2)}`
  }

  const isIncome = template.transaction_type === 'income'

  return (
    <div
      className={`group relative overflow-hidden rounded-lg border-2 transition-all hover:shadow-md ${
        deleting ? 'opacity-50' : ''
      } ${
        isIncome
          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
          : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4">
        <div className="flex items-start gap-3">
          {/* Ícone */}
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl ${
              isIncome
                ? 'bg-green-100 dark:bg-green-900/40'
                : 'bg-red-100 dark:bg-red-900/40'
            }`}
          >
            {template.icon || (template.category?.icon) || '💳'}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {template.name}
            </h3>
            {template.description && (
              <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                {template.description}
              </p>
            )}
            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{template.category?.icon} {template.category?.name}</span>
              <span>•</span>
              <span>{template.account?.icon} {template.account?.name}</span>
              {template.merchant && (
                <>
                  <span>•</span>
                  <span>{template.merchant}</span>
                </>
              )}
            </div>
            {template.times_used > 0 && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Usado {template.times_used}x
              </p>
            )}
          </div>
        </div>

        {/* Valor */}
        <div className="text-right">
          <p
            className={`text-xl font-bold ${
              isIncome
                ? 'text-green-700 dark:text-green-400'
                : 'text-red-700 dark:text-red-400'
            }`}
          >
            {isIncome ? '+' : '-'}
            {formatCurrency(template.amount, template.currency)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-gray-200 bg-white/50 p-2 dark:border-gray-700 dark:bg-gray-800/50">
        <button
          onClick={handleUse}
          disabled={loading || deleting}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition disabled:opacity-50 ${
            isIncome
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          <Zap className="h-4 w-4" />
          {loading ? 'Criando...' : 'Usar Template'}
        </button>

        <button
          onClick={handleDelete}
          disabled={loading || deleting}
          className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-200 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"
          title="Deletar template"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
