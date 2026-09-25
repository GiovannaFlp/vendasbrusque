export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { RegisterForm } from './RegisterForm'
import { Logo } from '@/components/Logo'

export const metadata = { title: 'Criar Conta' }

export default async function RegisterPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/painel')

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Crie sua conta</h1>
          <p className="text-gray-500 mt-1">É grátis e rápido</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
