export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LoginForm } from './LoginForm'
import { Logo } from '@/components/Logo'

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
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Bem-vindo de volta!</h1>
          <p className="text-gray-500 mt-1">Entre na sua conta</p>
        </div>
        <LoginForm callbackUrl={searchParams.callbackUrl} error={searchParams.error} />
      </div>
    </div>
  )
}
