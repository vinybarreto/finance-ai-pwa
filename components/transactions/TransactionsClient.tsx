'use client'

/**
 * Componente Client para Transações
 *
 * Features:
 * - Lista de transações
 * - Filtros (conta, categoria, tipo, data, busca)
 * - Modal de nova transação
 * - Deletar transação
 * - Estatísticas básicas
 */

import { useState } from 'react'
import { Plus, Search, Filter, Trash2, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react'
import NewTransactionModal from './NewTransactionModal'
import { deleteTransaction } from '@/lib/transactions/actions'

interface Account {
  id: string
  name: string
  icon: string
  color: string
  currency: string
}

interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: 'income' | 'expense'
}

interface Transaction {
  id: string
  transaction_type: 'income' | 'expense' | 'transfer'
  amount: number
  currency: string
  description: string
  date: string
  merchant?: string
  notes?: string
  tags?: string[]
  is_internal_transfer: boolean
  account: Account
  category: Category
}

interface TransactionsClientProps {
  accounts: Account[]
  categories: Category[]
  initialTransactions: Transaction[]
}

export default function TransactionsClient({
  accounts,
  categories,
  initialTransactions,
}: TransactionsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [transactions, setTransactions] = useState(initialTransactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAccount, setFilterAccount] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterType, setFilterType] = useState('')

  // Filtrar transações
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      !searchTerm ||
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.merchant?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesAccount = !filterAccount || tx.account.id === filterAccount
    const matchesCategory = !filterCategory || tx.category.id === filterCategory
    const matchesType = !filterType || tx.transaction_type === filterType

    return matchesSearch && matchesAccount && matchesCategory && matchesType
  })

  // Calcular estatísticas
  const stats = filteredTransactions.reduce(
    (acc, tx) => {
      if (tx.is_internal_transfer) return acc

      if (tx.transaction_type === 'income') {
        acc.totalIncome += tx.amount
      } else if (tx.transaction_type === 'expense') {
        acc.totalExpense += tx.amount
      }

      return acc
    },
    { totalIncome: 0, totalExpense: 0 }
  )

  const balance = stats.totalIncome - stats.totalExpense

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente deletar esta transação?')) return

    const result = await deleteTransaction(id)

    if (result.success) {
      setTransactions(transactions.filter((tx) => tx.id !== id))
    } else {
      alert('Erro ao deletar transação: ' + result.error)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'EUR' ? '€' : 'R$'
    return `${symbol} ${amount.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Transações
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gerencie todas as suas receitas e despesas
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Nova Transação
        </button>
      </div>

      {/* Estatísticas */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm font-medium">Receitas</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            € {stats.totalIncome.toFixed(2)}
          </p>
        </div>

        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <TrendingDown className="h-5 w-5" />
            <span className="text-sm font-medium">Despesas</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            € {stats.totalExpense.toFixed(2)}
          </p>
        </div>

        <div className={`rounded-lg p-4 ${balance >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
          <div className={`flex items-center gap-2 ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
            <ArrowRightLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Saldo</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            € {balance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 space-y-4 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Filter className="h-5 w-5" />
          <h3 className="font-semibold">Filtros</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Busca */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Descrição ou estabelecimento..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Conta */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Conta
            </label>
            <select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todas</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.icon} {account.name}
                </option>
              ))}
            </select>
          </div>

          {/* Categoria */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Categoria
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todas</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
              <option value="transfer">Transferências</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="space-y-2">
        {filteredTransactions.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-800/50">
            <p className="text-gray-600 dark:text-gray-400">
              Nenhuma transação encontrada
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Criar sua primeira transação
            </button>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md dark:bg-gray-800"
            >
              <div className="flex items-center gap-4">
                {/* Ícone da categoria */}
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
                  style={{ backgroundColor: tx.category.color + '20' }}
                >
                  {tx.category.icon}
                </div>

                {/* Informações */}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {tx.description}
                    </h4>
                    {tx.is_internal_transfer && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        Transferência
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>{tx.account.icon} {tx.account.name}</span>
                    <span>•</span>
                    <span>{tx.category.name}</span>
                    <span>•</span>
                    <span>{formatDate(tx.date)}</span>
                    {tx.merchant && (
                      <>
                        <span>•</span>
                        <span>{tx.merchant}</span>
                      </>
                    )}
                  </div>
                  {tx.tags && tx.tags.length > 0 && (
                    <div className="mt-1 flex gap-1">
                      {tx.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Valor */}
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${
                      tx.transaction_type === 'income'
                        ? 'text-green-600 dark:text-green-400'
                        : tx.transaction_type === 'expense'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {tx.transaction_type === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amount, tx.currency)}
                  </p>
                </div>

                {/* Deletar */}
                <button
                  onClick={() => handleDelete(tx.id)}
                  className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <NewTransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          // Recarregar página para atualizar lista
          window.location.reload()
        }}
        accounts={accounts}
        categories={categories}
      />
    </div>
  )
}
