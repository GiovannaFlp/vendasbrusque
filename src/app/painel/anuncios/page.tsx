import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { MyListingsClient } from './MyListingsClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Meus Anúncios' }

export default async function MyListingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login?callbackUrl=/painel/anuncios')

  const listings = await prisma.listing.findMany({
    where: { userId: session.user.id, status: { not: 'deleted' } },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Anúncios</h1>
          <p className="text-gray-500 mt-1">{listings.length} anúncio{listings.length !== 1 ? 's' : ''}</p>
        </div>
        <a href="/anuncios/novo" className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Anúncio
        </a>
      </div>

      <MyListingsClient
        listings={listings.map((l) => ({
          ...l,
          createdAt: l.createdAt.toISOString(),
          updatedAt: l.updatedAt.toISOString(),
        }))}
      />
    </div>
  )
}
