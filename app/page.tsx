import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-4xl px-6 py-12 text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
          Finance AI
        </h1>

        <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
          Sistema completo de gestão financeira pessoal com IA integrada
        </p>

        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              💰 Controle Total
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Gerencie gastos, receitas e investimentos em um só lugar
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              🤖 IA Inteligente
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Categorização automática e insights personalizados
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              📊 Análises
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Dashboards completos e relatórios dinâmicos
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Entrar
          </Link>

          <Link
            href="/signup"
            className="rounded-lg border border-gray-300 bg-white px-8 py-3 font-semibold text-gray-900 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          >
            Criar Conta
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          Em desenvolvimento • Versão 0.1.0
        </p>
      </div>
    </div>
  )
}
