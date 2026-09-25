import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { NewListingForm } from './NewListingForm'

export const metadata = { title: 'Publicar Anúncio' }

export default async function NewListingPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login?callbackUrl=/anuncios/novo')

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Publicar Anúncio</h1>
        <p className="text-gray-500 mt-1">Preencha os dados do que você quer vender</p>
      </div>
      <NewListingForm categories={categories} />
    </div>
  )
}
