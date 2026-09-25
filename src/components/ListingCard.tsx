import Link from 'next/link'
import Image from 'next/image'
import { formatPrice, formatDate, getConditionLabel } from '@/lib/utils'
import { CategoryIcon } from './CategoryIcon'

interface ListingCardProps {
  listing: {
    id: string
    title: string
    price: number | null
    priceType: string
    condition: string | null
    location: string
    images: string
    createdAt: string | Date
    views: number
    category: {
      name: string
      slug: string
      icon: string
      color: string
    }
    user: {
      name: string
    }
  }
}

export function ListingCard({ listing }: ListingCardProps) {
  let images: string[] = []
  try {
    images = JSON.parse(listing.images)
  } catch {}

  const mainImage = images[0]
  const condition = getConditionLabel(listing.condition)

  return (
    <Link href={`/anuncios/${listing.id}`} className="group">
      <div className="card hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
        {/* Imagem */}
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
              <CategoryIcon name={listing.category.slug} className="w-10 h-10" />
              <span className="text-xs mt-2 text-gray-400">{listing.category.name}</span>
            </div>
          )}
          {condition && (
            <span className="absolute top-2 left-2 badge bg-white text-gray-700 shadow-sm">
              {condition}
            </span>
          )}
        </div>

        {/* Conteúdo */}
        <div className="p-3 flex flex-col flex-1">
          <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
            {listing.title}
          </p>

          <div className="mt-auto">
            <p className="text-blue-600 font-bold text-base">
              {listing.priceType === 'free'
                ? 'Grátis'
                : listing.priceType === 'exchange'
                ? 'Troca'
                : listing.price
                ? formatPrice(listing.price)
                : 'A combinar'}
              {listing.priceType === 'negotiable' && listing.price && (
                <span className="text-xs text-gray-400 font-normal ml-1">negociável</span>
              )}
            </p>

            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {listing.location.split(',')[0]}
              </span>
              <span className="text-xs text-gray-400">{formatDate(listing.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
