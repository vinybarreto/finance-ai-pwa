/**
 * RecategorizeModal - Modal para confirmar recategorização em lote
 */

'use client'

import { useState } from 'react'
import { X, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'
import type { SimilarTransaction } from '@/lib/transactions/recategorize'

interface RecategorizeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (transactionIds: string[]) => Promise<void>
  similarTransactions: SimilarTransaction[]
  newCategoryName: string
  newCategoryIcon: string
  merchant?: string | null
}

export default function RecategorizeModal({
  isOpen,
  onClose,
  onConfirm,
  similarTransactions,
  newCategoryName,
  newCategoryIcon,
  merchant,
}: RecategorizeModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(similarTransactions.map((t) => t.id))
  )

  if (!isOpen) return null

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm(Array.from(selectedIds))
      onClose()
    } catch (error) {
      console.error('Error recategorizing:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTransaction = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleAll = () => {
    if (selectedIds.size === similarTransactions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(similarTransactions.map((t) => t.id)))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recategorizar Transações
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {/* Warning */}
          <div className="mb-6 flex items-start gap-3 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-300">
                Encontramos {similarTransactions.length} transações similares
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                {merchant ? (
                  <>
                    Todas as transações de <strong>{merchant}</strong> serão
                    recategorizadas para{' '}
                    <strong>
                      {newCategoryIcon} {newCategoryName}
                    </strong>
                  </>
                ) : (
                  <>
                    Transações com descrição similar serão recategorizadas para{' '}
                    <strong>
                      {newCategoryIcon} {newCategoryName}
                    </strong>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Select All */}
          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedIds.size === similarTransactions.length}
              onChange={toggleAll}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Selecionar todas ({selectedIds.size}/{similarTransactions.length})
            </label>
          </div>

          {/* Transactions List */}
          <div className="space-y-2">
            {similarTransactions.map((tx) => (
              <div
                key={tx.id}
                className={`flex items-center gap-3 rounded-lg border p-3 transition ${
                  selectedIds.has(tx.id)
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(tx.id)}
                  onChange={() => toggleTransaction(tx.id)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {tx.description.substring(0, 60)}
                        {tx.description.length > 60 && '...'}
                      </p>
                      {tx.merchant && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {tx.merchant}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        €{tx.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(tx.date).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </div>
                  {tx.category_name && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <span>Atual:</span>
                      <span>
                        {tx.category_icon} {tx.category_name}
                      </span>
                      <span>→</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {newCategoryIcon} {newCategoryName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-gray-200 p-6 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || selectedIds.size === 0}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Recategorizando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Recategorizar {selectedIds.size}{' '}
                {selectedIds.size === 1 ? 'transação' : 'transações'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
