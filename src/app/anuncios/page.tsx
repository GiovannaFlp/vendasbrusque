import { prisma } from '@/lib/prisma'
import { ListingCard } from '@/components/ListingCard'
import { CategoryIcon } from '@/components/CategoryIcon'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface SearchParams {
  q?: string
  categoria?: string
  preco_min?: string
  preco_max?: string
  condicao?: string
  ordem?: string
  pagina?: string
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const page = parseInt(searchParams.pagina || '1')
  const perPage = 16
  const skip = (page - 1) * perPage

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })

  const where: Record<string, unknown> = { status: 'active' }

  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q } },
      { description: { contains: searchParams.q } },
    ]
  }

  if (searchParams.categoria) {
    const cat = categories.find((c) => c.slug === searchParams.categoria)
    if (cat) where.categoryId = cat.id
  }

  if (searchParams.condicao) {
    where.condition = searchParams.condicao
  }

  const priceFilter: Record<string, number> = {}
  if (searchParams.preco_min) priceFilter.gte = parseFloat(searchParams.preco_min)
  if (searchParams.preco_max) priceFilter.lte = parseFloat(searchParams.preco_max)
  if (Object.keys(priceFilter).length > 0) where.price = priceFilter

  let orderBy: Record<string, string> = { createdAt: 'desc' }
  if (searchParams.ordem === 'preco_asc') orderBy = { price: 'asc' }
  if (searchParams.ordem === 'preco_desc') orderBy = { price: 'desc' }
  if (searchParams.ordem === 'mais_vistos') orderBy = { views: 'desc' }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: { category: true, user: { select: { name: true } } },
      orderBy,
      skip,
      take: perPage,
    }),
    prisma.listing.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)
  const activeCategory = categories.find((c) => c.slug === searchParams.categoria)

  const buildUrl = (params: Record<string, string | undefined>) => {
    const p = new URLSearchParams()
    const merged = { ...searchParams, ...params }
    Object.entries(merged).forEach(([k, v]) => {
      if (v) p.set(k, v)
    })
    p.delete('pagina')
    return `/anuncios?${p.toString()}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filtros */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="card p-4 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Filtros</h2>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Categoria</h3>
              <div className="space-y-1">
                <Link
                  href={buildUrl({ categoria: undefined })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    !searchParams.categoria
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Todas as categorias
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={buildUrl({ categoria: cat.slug })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      searchParams.categoria === cat.slug
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <CategoryIcon name={cat.slug} className="w-4 h-4 flex-shrink-0" />
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Condição</h3>
              <div className="space-y-1">
                {[
                  { value: '', label: 'Todas' },
                  { value: 'new', label: 'Novo' },
                  { value: 'used', label: 'Usado' },
                  { value: 'reconditioned', label: 'Recondicionado' },
                ].map((opt) => (
                  <Link
                    key={opt.value}
                    href={buildUrl({ condicao: opt.value || undefined })}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      (searchParams.condicao || '') === opt.value
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Preço</h3>
              <form action="/anuncios" method="get" className="space-y-2">
                {searchParams.q && <input type="hidden" name="q" value={searchParams.q} />}
                {searchParams.categoria && <input type="hidden" name="categoria" value={searchParams.categoria} />}
                <input
                  type="number"
                  name="preco_min"
                  placeholder="Mínimo (R$)"
                  defaultValue={searchParams.preco_min}
                  className="input-field text-sm"
                />
                <input
                  type="number"
                  name="preco_max"
                  placeholder="Máximo (R$)"
                  defaultValue={searchParams.preco_max}
                  className="input-field text-sm"
                />
                <button type="submit" className="btn-primary w-full text-sm py-2">
                  Aplicar
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Lista */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {searchParams.q
                  ? `Resultados para "${searchParams.q}"`
                  : activeCategory
                  ? activeCategory.name
                  : 'Todos os Anúncios'}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {total.toLocaleString('pt-BR')} anúncio{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Ordenar:</label>
              <select
                onChange={(e) => {
                  window.location.href = buildUrl({ ordem: e.target.value || undefined })
                }}
                defaultValue={searchParams.ordem || ''}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Mais recentes</option>
                <option value="preco_asc">Menor preço</option>
                <option value="preco_desc">Maior preço</option>
                <option value="mais_vistos">Mais vistos</option>
              </select>
            </div>
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-600">Nenhum anúncio encontrado</p>
              <p className="text-sm mt-1">Tente outros termos ou remova os filtros</p>
              <Link href="/anuncios" className="btn-secondary mt-4 inline-flex">
                Limpar filtros
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={{
                      ...listing,
                      createdAt: listing.createdAt.toISOString(),
                    }}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {page > 1 && (
                    <Link href={buildUrl({ pagina: String(page - 1) })} className="btn-secondary px-4 py-2 text-sm">
                      Anterior
                    </Link>
                  )}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                    return (
                      <Link
                        key={p}
                        href={buildUrl({ pagina: String(p) })}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          p === page ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </Link>
                    )
                  })}
                  {page < totalPages && (
                    <Link href={buildUrl({ pagina: String(page + 1) })} className="btn-secondary px-4 py-2 text-sm">
                      Próximo
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
