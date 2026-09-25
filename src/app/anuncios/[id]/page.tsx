import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate, getConditionLabel, getPriceLabel } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ContactButton } from './ContactButton'
import { ImageGallery } from './ImageGallery'

export const dynamic = 'force-dynamic'

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      user: { select: { id: true, name: true, phone: true, createdAt: true } },
    },
  })

  if (!listing || listing.status === 'deleted') {
    notFound()
  }

  // Incrementa views
  await prisma.listing.update({
    where: { id: params.id },
    data: { views: { increment: 1 } },
  })

  let images: string[] = []
  try {
    images = JSON.parse(listing.images)
  } catch {}

  const isOwner = session?.user?.id === listing.userId
  const condition = getConditionLabel(listing.condition)

  // Outros anúncios do vendedor
  const otherListings = await prisma.listing.findMany({
    where: {
      userId: listing.userId,
      status: 'active',
      id: { not: listing.id },
    },
    include: { category: true, user: { select: { name: true } } },
    take: 4,
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">Início</Link>
        <span>/</span>
        <Link href="/anuncios" className="hover:text-blue-600">Anúncios</Link>
        <span>/</span>
        <Link href={`/anuncios?categoria=${listing.category.slug}`} className="hover:text-blue-600">
          {listing.category.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-xs">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Galeria */}
          <ImageGallery images={images} title={listing.title} icon={listing.category.icon} />

          {/* Info do anúncio */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge bg-blue-50 text-blue-700">
                    {listing.category.icon} {listing.category.name}
                  </span>
                  {condition && (
                    <span className="badge bg-gray-100 text-gray-600">{condition}</span>
                  )}
                  <span className={`badge ${
                    listing.status === 'active' ? 'bg-green-100 text-green-700' :
                    listing.status === 'sold' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {listing.status === 'active' ? 'Disponível' :
                     listing.status === 'sold' ? 'Vendido' : 'Pausado'}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
              </div>
            </div>

            {/* Preço */}
            <div className="flex items-baseline gap-3 py-4 border-y border-gray-100 mb-4">
              <span className="text-3xl font-extrabold text-blue-600">
                {listing.priceType === 'free'
                  ? 'Grátis'
                  : listing.priceType === 'exchange'
                  ? 'Troca'
                  : listing.price
                  ? formatPrice(listing.price)
                  : 'A combinar'}
              </span>
              {listing.priceType !== 'fixed' && (
                <span className="text-sm text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  {getPriceLabel(listing.priceType)}
                </span>
              )}
            </div>

            {/* Localização e data */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {listing.location}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Publicado {formatDate(listing.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {listing.views} visualizações
              </span>
            </div>

            {/* Descrição */}
            <div>
              <h2 className="font-semibold text-gray-900 mb-3">Descrição</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Vendedor */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Anunciante</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                {listing.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{listing.user.name}</p>
                <p className="text-sm text-gray-500">
                  Na plataforma desde {new Date(listing.user.createdAt).getFullYear()}
                </p>
              </div>
            </div>

            {isOwner ? (
              <div className="space-y-2">
                <Link
                  href={`/anuncios/${listing.id}/editar`}
                  className="btn-secondary w-full text-center text-sm py-2.5 block"
                >
                  ✏️ Editar Anúncio
                </Link>
                <Link
                  href="/painel/anuncios"
                  className="btn-secondary w-full text-center text-sm py-2.5 block"
                >
                  📋 Meus Anúncios
                </Link>
              </div>
            ) : (
              <ContactButton listingId={listing.id} sellerId={listing.userId} />
            )}
          </div>

          {/* Outros anúncios do vendedor */}
          {otherListings.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4">
                Outros anúncios de {listing.user.name.split(' ')[0]}
              </h2>
              <div className="space-y-3">
                {otherListings.map((other) => {
                  let imgs: string[] = []
                  try { imgs = JSON.parse(other.images) } catch {}
                  return (
                    <Link
                      key={other.id}
                      href={`/anuncios/${other.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {imgs[0] ? (
                          <Image src={imgs[0]} alt={other.title} width={56} height={56} className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-xl">{other.category.icon}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 line-clamp-2 leading-tight">
                          {other.title}
                        </p>
                        <p className="text-sm text-blue-600 font-semibold mt-0.5">
                          {other.price ? formatPrice(other.price) : 'A combinar'}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
