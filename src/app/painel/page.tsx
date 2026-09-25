import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/utils'
import Image from 'next/image'
import { CategoryIcon } from '@/components/CategoryIcon'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Meu Painel' }

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login?callbackUrl=/painel')

  const [listingsCount, activeListings, unreadMessages, recentListings] = await Promise.all([
    prisma.listing.count({
      where: { userId: session.user.id, status: { not: 'deleted' } },
    }),
    prisma.listing.count({
      where: { userId: session.user.id, status: 'active' },
    }),
    prisma.message.count({
      where: {
        read: false,
        senderId: { not: session.user.id },
        conversation: {
          OR: [
            { buyerId: session.user.id },
            { sellerId: session.user.id },
          ],
        },
      },
    }),
    prisma.listing.findMany({
      where: { userId: session.user.id, status: { not: 'deleted' } },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {session.user.name?.split(' ')[0]}
        </h1>
        <p className="text-gray-500 mt-1">Bem-vindo ao seu painel de controle</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{listingsCount}</p>
              <p className="text-xs text-gray-500">Total de anúncios</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeListings}</p>
              <p className="text-xs text-gray-500">Ativos</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{unreadMessages}</p>
              <p className="text-xs text-gray-500">Mensagens novas</p>
            </div>
          </div>
        </div>

        <Link href="/anuncios/novo" className="card p-5 hover:shadow-md transition-shadow bg-blue-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-bold">Novo Anúncio</p>
              <p className="text-xs text-blue-200">Publicar agora</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link href="/painel/anuncios" className="card p-5 hover:shadow-md transition-shadow flex items-center gap-4 group">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-blue-600">Meus Anúncios</p>
            <p className="text-sm text-gray-500">{listingsCount} anúncio{listingsCount !== 1 ? 's' : ''}</p>
          </div>
          <svg className="w-5 h-5 text-gray-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link href="/painel/mensagens" className="card p-5 hover:shadow-md transition-shadow flex items-center gap-4 group">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-blue-600">Mensagens</p>
            <p className="text-sm text-gray-500">
              {unreadMessages > 0 ? (
                <span className="text-blue-600 font-medium">{unreadMessages} nova{unreadMessages !== 1 ? 's' : ''}</span>
              ) : 'Nenhuma nova'}
            </p>
          </div>
          <svg className="w-5 h-5 text-gray-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Anúncios recentes */}
      {recentListings.length > 0 && (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Meus últimos anúncios</h2>
            <Link href="/painel/anuncios" className="text-sm text-blue-600 hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentListings.map((listing) => {
              let imgs: string[] = []
              try { imgs = JSON.parse(listing.images) } catch {}
              return (
                <Link
                  key={listing.id}
                  href={`/anuncios/${listing.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {imgs[0] ? (
                      <Image src={imgs[0]} alt="" width={56} height={56} className="object-cover w-full h-full" />
                    ) : (
                      <div className="text-gray-400">
                        <CategoryIcon name={listing.category.slug} className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{listing.title}</p>
                    <p className="text-sm text-gray-500">
                      {listing.price ? formatPrice(listing.price) : 'A combinar'} · {formatDate(listing.createdAt)}
                    </p>
                  </div>
                  <span className={`badge flex-shrink-0 ${
                    listing.status === 'active' ? 'bg-green-100 text-green-700' :
                    listing.status === 'sold' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {listing.status === 'active' ? 'Ativo' :
                     listing.status === 'sold' ? 'Vendido' : 'Pausado'}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
