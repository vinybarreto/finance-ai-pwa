/**
 * ImportClient - Client Component para import de extratos
 */

'use client'

import { useState } from 'react'
import { Upload, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import FileUpload from '@/components/import/FileUpload'
import TransactionPreview from '@/components/import/TransactionPreview'
import { previewImport, confirmImport, learnCategoryCorrection, type ImportPreview, type PreviewTransaction } from '@/lib/import/actions'
import { getBankDisplayName, getBankIcon } from '@/lib/import/parsers'

interface ImportClientProps {
  accounts: Array<{ id: string; name: string; icon: string; currency: string }>
  categories: Array<{ id: string; name: string; icon: string; type: string }>
}

type Step = 'upload' | 'preview' | 'importing' | 'complete'

export default function ImportClient({ accounts, categories }: ImportClientProps) {
  const [step, setStep] = useState<Step>('upload')
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [transactions, setTransactions] = useState<PreviewTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<any>(null)

  // Step 1: Handle file upload
  const handleFileSelect = async (file: File) => {
    setSelectedFile(file)
    setError(null)

    if (!selectedAccount) {
      setError('Por favor, selecione uma conta primeiro')
      return
    }

    setLoading(true)

    try {
      // Read file content
      const content = await readFileContent(file)

      // Preview import
      const result = await previewImport(selectedAccount, file.name, content)

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      setPreview(result)
      setTransactions(result.transactions)
      setStep('preview')
    } catch (err: any) {
      setError(err.message || 'Erro ao processar arquivo')
    } finally {
      setLoading(false)
    }
  }

  // Read file as text
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  // Step 2: Update category
  const handleUpdateCategory = (index: number, categoryId: string) => {
    const updated = [...transactions]
    const oldCategoryId = updated[index].suggestedCategoryId

    updated[index].suggestedCategoryId = categoryId
    updated[index].suggestedCategoryName =
      categories.find((c) => c.id === categoryId)?.name || undefined

    setTransactions(updated)

    // Learn from user correction
    if (oldCategoryId && oldCategoryId !== categoryId) {
      learnCategoryCorrection(
        updated[index].merchant,
        updated[index].description,
        categoryId
      )
    }
  }

  // Toggle duplicate status
  const handleToggleDuplicate = (index: number) => {
    const updated = [...transactions]
    updated[index].isDuplicate = !updated[index].isDuplicate
    setTransactions(updated)
  }

  // Step 3: Confirm and import
  const handleConfirmImport = async () => {
    if (!preview) return

    setStep('importing')
    setError(null)

    try {
      const result = await confirmImport(
        selectedAccount,
        transactions,
        preview.fileName,
        preview.bank
      )

      setImportResult(result)
      setStep('complete')
    } catch (err: any) {
      setError(err.message || 'Erro ao importar transações')
      setStep('preview')
    }
  }

  // Reset
  const handleReset = () => {
    setStep('upload')
    setSelectedFile(null)
    setPreview(null)
    setTransactions([])
    setError(null)
    setImportResult(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Importar Extrato Bancário
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Importe transações de seus extratos bancários automaticamente
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-4">
        <div
          className={`flex items-center gap-2 ${
            step === 'upload' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              step === 'upload'
                ? 'bg-blue-600 text-white'
                : step === 'preview' || step === 'importing' || step === 'complete'
                ? 'bg-green-600 text-white'
                : 'bg-gray-300 text-gray-600'
            }`}
          >
            {step === 'preview' || step === 'importing' || step === 'complete' ? '✓' : '1'}
          </div>
          <span className="font-medium">Upload</span>
        </div>

        <div className="h-px flex-1 bg-gray-300 dark:bg-gray-600" />

        <div
          className={`flex items-center gap-2 ${
            step === 'preview' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              step === 'preview'
                ? 'bg-blue-600 text-white'
                : step === 'importing' || step === 'complete'
                ? 'bg-green-600 text-white'
                : 'bg-gray-300 text-gray-600'
            }`}
          >
            {step === 'importing' || step === 'complete' ? '✓' : '2'}
          </div>
          <span className="font-medium">Preview</span>
        </div>

        <div className="h-px flex-1 bg-gray-300 dark:bg-gray-600" />

        <div
          className={`flex items-center gap-2 ${
            step === 'complete' ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              step === 'complete'
                ? 'bg-green-600 text-white'
                : 'bg-gray-300 text-gray-600'
            }`}
          >
            {step === 'complete' ? '✓' : '3'}
          </div>
          <span className="font-medium">Completo</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="space-y-6">
          {/* Select Account */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Selecione a Conta *
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Escolha uma conta...</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.icon} {account.name} ({account.currency})
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          {selectedAccount && (
            <FileUpload onFileSelect={handleFileSelect} />
          )}

          {loading && (
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Processando arquivo...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 'preview' && preview && (
        <div className="space-y-6">
          {/* Bank Info */}
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getBankIcon(preview.bank)}</span>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-300">
                  {getBankDisplayName(preview.bank)}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {preview.fileName}
                </p>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <TransactionPreview
            transactions={transactions}
            categories={categories}
            onUpdateCategory={handleUpdateCategory}
            onToggleDuplicate={handleToggleDuplicate}
          />

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
            <button
              onClick={handleConfirmImport}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700"
            >
              <CheckCircle className="h-5 w-5" />
              Confirmar e Importar ({transactions.filter((t) => !t.isDuplicate).length}{' '}
              transações)
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Importing */}
      {step === 'importing' && (
        <div className="py-12 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Importando transações...
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Por favor aguarde, isso pode levar alguns segundos
          </p>
        </div>
      )}

      {/* Step 4: Complete */}
      {step === 'complete' && importResult && (
        <div className="space-y-6">
          {/* Success Message */}
          <div className="rounded-lg bg-green-50 p-6 text-center dark:bg-green-900/20">
            <CheckCircle className="mx-auto h-16 w-16 text-green-600 dark:text-green-400" />
            <h2 className="mt-4 text-2xl font-bold text-green-900 dark:text-green-300">
              Import Concluído!
            </h2>
            <p className="mt-2 text-green-700 dark:text-green-400">
              {importResult.importedCount} transações importadas com sucesso
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">Importadas</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {importResult.importedCount}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">Duplicadas</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {importResult.duplicateCount}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">Erros</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {importResult.errorCount}
              </p>
            </div>
          </div>

          {/* Errors */}
          {importResult.errors && importResult.errors.length > 0 && (
            <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              <h3 className="font-semibold text-red-900 dark:text-red-300">
                Erros Encontrados:
              </h3>
              <ul className="mt-2 list-inside list-disc text-sm text-red-700 dark:text-red-400">
                {importResult.errors.map((err: string, i: number) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className="flex-1 rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Importar Outro Arquivo
            </button>
            <a
              href="/dashboard/transactions"
              className="flex-1 rounded-lg bg-blue-600 px-6 py-2 text-center font-medium text-white transition hover:bg-blue-700"
            >
              Ver Transações
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
