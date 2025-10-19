/**
 * Quick Commands - Botões de atalho
 *
 * Comandos rápidos para perguntas comuns
 */

'use client'

import { TrendingUp, PieChart, Target, HelpCircle } from 'lucide-react'

interface QuickCommandsProps {
  onCommand: (command: string) => void
}

export default function QuickCommands({ onCommand }: QuickCommandsProps) {
  const commands = [
    {
      icon: PieChart,
      label: 'Resumo',
      command: '/resumo',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    },
    {
      icon: TrendingUp,
      label: 'Insights',
      command: '/insights',
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    },
    {
      icon: Target,
      label: 'Planejar Meta',
      command: '/meta 1000',
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    },
    {
      icon: HelpCircle,
      label: 'Ajuda',
      command: '/help',
      color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    },
  ]

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Comandos rápidos:
      </p>
      <div className="flex flex-wrap gap-2">
        {commands.map((cmd) => (
          <button
            key={cmd.command}
            onClick={() => onCommand(cmd.command)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition hover:opacity-80 ${cmd.color}`}
          >
            <cmd.icon className="h-4 w-4" />
            {cmd.label}
          </button>
        ))}
      </div>
    </div>
  )
}
