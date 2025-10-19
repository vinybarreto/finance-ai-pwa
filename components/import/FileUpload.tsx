/**
 * FileUpload - Drag & Drop para upload de extratos
 */

'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, X } from 'lucide-react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  acceptedFormats?: string[]
}

export default function FileUpload({
  onFileSelect,
  acceptedFormats = ['.csv', '.ofx', '.pdf'],
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        const file = files[0]
        setSelectedFile(file)
        onFileSelect(file)
      }
    },
    [onFileSelect]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        const file = files[0]
        setSelectedFile(file)
        onFileSelect(file)
      }
    },
    [onFileSelect]
  )

  const handleRemove = useCallback(() => {
    setSelectedFile(null)
  }, [])

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500'
          }`}
        >
          <Upload
            className={`mx-auto mb-4 h-12 w-12 ${
              isDragging
                ? 'text-blue-500 dark:text-blue-400'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          />
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            {isDragging ? 'Solte o arquivo aqui' : 'Arraste seu extrato aqui'}
          </h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            ou clique para selecionar
          </p>
          <input
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileInput}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Formatos aceitos: {acceptedFormats.join(', ')}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-green-500 bg-green-50 p-6 dark:border-green-400 dark:bg-green-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-10 w-10 text-green-600 dark:text-green-400" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {selectedFile.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
              title="Remover arquivo"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
