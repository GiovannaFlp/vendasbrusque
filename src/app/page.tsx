import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ListingCard } from '@/components/ListingCard'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [categories, recentListings] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.listing.findMany({
      where: { status: 'active' },
      include: { category: true, user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
  ])

  const stats = await prisma.listing.count({ where: { status: 'active' } })

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Compre e Venda em{' '}
            <span className="text-yellow-300">Brusque</span>
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            O marketplace da sua cidade. Anuncie grátis, negocie pelo chat e feche negócio com vizinhos.
          </p>

          {/* Busca hero */}
          <form action="/anuncios" method="get" className="max-w-2xl mx-auto">
            <div className="flex gap-0 shadow-xl rounded-xl overflow-hidden">
              <input
                type="text"
                name="q"
                placeholder="O que você está buscando?"
                className="flex-1 px-5 py-4 text-gray-900 text-base focus:outline-none"
              />
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar
              </button>
            </div>
          </form>

          <p className="text-blue-200 text-sm mt-4">
            <span className="font-semibold text-white">{stats.toLocaleString('pt-BR')}</span> anúncios ativos agora
          </p>
        </div>
      </section>

      {/* Categorias */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Categorias</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/anuncios?categoria=${cat.slug}`}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-300 hover:shadow-sm transition-all group text-center"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600 leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Anúncios recentes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Anúncios Recentes</h2>
          <Link href="/anuncios" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
            Ver todos
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {recentListings.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-lg font-medium">Nenhum anúncio ainda</p>
            <p className="text-sm mt-1">Seja o primeiro a anunciar em Brusque!</p>
            <Link href="/anuncios/novo" className="btn-primary mt-4 inline-flex">
              Publicar Anúncio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {recentListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={{
                  ...listing,
                  createdAt: listing.createdAt.toISOString(),
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-blue-50 border-t border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Tem algo para vender?
          </h2>
          <p className="text-gray-500 mb-6">
            Publique seu anúncio grátis e alcance milhares de pessoas em Brusque e região.
          </p>
          <Link href="/anuncios/novo" className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Anunciar Gratuitamente
          </Link>
        </div>
      </section>
    </div>
  )
}
