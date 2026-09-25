export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LoginForm } from './LoginForm'

export const metadata = { title: 'Entrar' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string }
}) {
  const session = await getServerSession(authOptions)
  if (session) redirect(searchParams.callbackUrl || '/painel')

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 text-white font-bold text-2xl w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
            VB
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bem-vindo de volta!</h1>
          <p className="text-gray-500 mt-1">Entre na sua conta VendasBrusque</p>
        </div>

        <LoginForm callbackUrl={searchParams.callbackUrl} error={searchParams.error} />
      </div>
    </div>
  )
}
