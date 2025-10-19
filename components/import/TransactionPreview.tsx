/**
 * TransactionPreview - Preview de transações antes de importar
 */

'use client'

import { useState } from 'react'
import { Check, X, AlertCircle, Edit2, Save } from 'lucide-react'
import type { PreviewTransaction } from '@/lib/import/actions'

interface TransactionPreviewProps {
  transactions: PreviewTransaction[]
  categories: Array<{ id: string; name: string; icon: string; type: string }>
  onUpdateCategory: (index: number, categoryId: string) => void
  onToggleDuplicate: (index: number) => void
}

export default function TransactionPreview({
  transactions,
  categories,
  onUpdateCategory,
  onToggleDuplicate,
}: TransactionPreviewProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editCategory, setEditCategory] = useState<string>('')

  const handleStartEdit = (index: number, currentCategoryId?: string) => {
    setEditingIndex(index)
    setEditCategory(currentCategoryId || '')
  }

  const handleSaveEdit = (index: number) => {
    if (editCategory) {
      onUpdateCategory(index, editCategory)
    }
    setEditingIndex(null)
    setEditCategory('')
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditCategory('')
  }

  // Filtrar categorias por tipo
  const getCategoriesForType = (type: string) => {
    if (type === 'transfer') return []
    return categories.filter((c) => c.type === type)
  }

  // Stats
  const totalCount = transactions.length
  const duplicateCount = transactions.filter((t) => t.isDuplicate).length
  const toImportCount = totalCount - duplicateCount

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-sm text-blue-700 dark:text-blue-400">Total</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
            {totalCount}
          </p>
        </div>
        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm text-green-700 dark:text-green-400">
            Para Importar
          </p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-300">
            {toImportCount}
          </p>
        </div>
        <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            Duplicadas
          </p>
          <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">
            {duplicateCount}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => {
              const isEditing = editingIndex === index
              const txCategories = getCategoriesForType(tx.type)
              const category = categories.find(
                (c) => c.id === tx.suggestedCategoryId
              )

              return (
                <tr
                  key={index}
                  className={`border-b border-gray-200 dark:border-gray-700 ${
                    tx.isDuplicate
                      ? 'bg-yellow-50 dark:bg-yellow-900/10'
                      : 'bg-white dark:bg-gray-900'
                  }`}
                >
                  {/* Data */}
                  <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">
                    {new Date(tx.date).toLocaleDateString('pt-PT')}
                  </td>

                  {/* Descrição */}
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {tx.description.substring(0, 50)}
                        {tx.description.length > 50 && '...'}
                      </p>
                      {tx.merchant && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {tx.merchant}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Valor */}
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`font-semibold ${
                        tx.type === 'income'
                          ? 'text-green-600 dark:text-green-400'
                          : tx.type === 'expense'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : '↔'}
                      {tx.currency === 'EUR' ? '€' : 'R$'}
                      {tx.amount.toFixed(2)}
                    </span>
                  </td>

                  {/* Categoria */}
                  <td className="px-4 py-3">
                    {tx.type === 'transfer' ? (
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        Transferência
                      </span>
                    ) : isEditing ? (
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">Selecione...</option>
                        {txCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                    ) : category ? (
                      <div className="flex items-center gap-2">
                        <span>
                          {category.icon} {category.name}
                        </span>
                        {tx.confidence && tx.confidence < 0.7 && (
                          <span title="Baixa confiança">
                            <AlertCircle
                              className="h-4 w-4 text-yellow-600"
                            />
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">
                        Sem categoria
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    {tx.isDuplicate ? (
                      <span className="flex items-center gap-1 rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                        <X className="h-3 w-3" />
                        Duplicada
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900/40 dark:text-green-300">
                        <Check className="h-3 w-3" />
                        Importar
                      </span>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {tx.type !== 'transfer' && (
                        <>
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(index)}
                                className="rounded p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/40"
                                title="Salvar"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                                title="Cancelar"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() =>
                                handleStartEdit(index, tx.suggestedCategoryId)
                              }
                              className="rounded p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                              title="Editar categoria"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                      {tx.isDuplicate && (
                        <button
                          onClick={() => onToggleDuplicate(index)}
                          className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                          title="Importar mesmo assim"
                        >
                          Forçar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
