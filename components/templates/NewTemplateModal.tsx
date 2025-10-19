/**
 * New Template Modal - Modal para criar novo template
 *
 * Permite criar um template de transação rápida
 */

'use client'

import { useState } from 'react'
import { X, Sparkles } from 'lucide-react'
import { createTemplate } from '@/lib/templates/actions'

interface Account {
  id: string
  name: string
  icon: string
  currency: string
}

interface Category {
  id: string
  name: string
  icon: string
  type: 'income' | 'expense'
}

interface NewTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  accounts: Account[]
  categories: Category[]
  onTemplateCreated?: () => void
}

const TEMPLATE_ICONS = [
  '💳', '🏠', '🚗', '🛒', '⛽', '💡', '💧', '📱', '🍔',
  '🎬', '🎮', '📚', '💊', '✈️', '🏋️', '💰', '💼', '🎯',
]

export default function NewTemplateModal({
  isOpen,
  onClose,
  accounts,
  categories,
  onTemplateCreated,
}: NewTemplateModalProps) {
  const [loading, setLoading] = useState(false)
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('💳')
  const [accountId, setAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [merchant, setMerchant] = useState('')
  const [notes, setNotes] = useState('')

  // Filtrar categorias por tipo
  const filteredCategories = categories.filter((cat) => cat.type === transactionType)

  // Moeda da conta selecionada
  const selectedAccount = accounts.find((acc) => acc.id === accountId)
  const currency = selectedAccount?.currency || 'EUR'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createTemplate({
        name,
        description: description || undefined,
        icon,
        account_id: accountId,
        category_id: categoryId,
        transaction_type: transactionType,
        amount: parseFloat(amount),
        currency,
        merchant: merchant || undefined,
        notes: notes || undefined,
      })

      if (result.error) {
        alert('Erro ao criar template: ' + result.error)
      } else {
        // Resetar formulário
        setName('')
        setDescription('')
        setIcon('💳')
        setAccountId('')
        setCategoryId('')
        setAmount('')
        setMerchant('')
        setNotes('')
        onTemplateCreated?.()
        onClose()
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao criar template')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 dark:bg-gray-800">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Novo Template
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Transação */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTransactionType('expense')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  transactionType === 'expense'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Despesa
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('income')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  transactionType === 'income'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Receita
              </button>
            </div>
          </div>

          {/* Nome */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nome do Template *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Aluguel, Netflix, Supermercado..."
            />
          </div>

          {/* Ícone */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ícone
            </label>
            <div className="grid grid-cols-9 gap-2">
              {TEMPLATE_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`flex h-12 w-12 items-center justify-center rounded-lg text-2xl transition ${
                    icon === emoji
                      ? 'bg-blue-100 ring-2 ring-blue-600 dark:bg-blue-900/30'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Conta */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Conta *
            </label>
            <select
              required
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Selecione uma conta</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.icon} {account.name} ({account.currency})
                </option>
              ))}
            </select>
          </div>

          {/* Categoria */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Categoria *
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Selecione uma categoria</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Valor */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Valor ({currency}) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="0.00"
            />
          </div>

          {/* Descrição (opcional) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Descrição (opcional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Pagamento mensal"
            />
          </div>

          {/* Estabelecimento (opcional) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Estabelecimento (opcional)
            </label>
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Netflix, Continente..."
            />
          </div>

          {/* Notas (opcional) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Observações sobre este template..."
            />
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
