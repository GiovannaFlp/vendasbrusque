'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { CategoryIcon } from '@/components/CategoryIcon'

interface Listing {
  id: string
  title: string
  price: number | null
  priceType: string
  status: string
  images: string
  views: number
  createdAt: string
  category: { name: string; icon: string; slug: string }
}

export function MyListingsClient({ listings: initial }: { listings: Listing[] }) {
  const router = useRouter()
  const [listings, setListings] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)

  async function updateStatus(id: string, status: string) {
    setLoading(id)
    try {
      await fetch(`/api/anuncios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
    } finally {
      setLoading(null)
    }
  }

  async function deleteListing(id: string) {
    if (!confirm('Tem certeza que deseja excluir este anúncio?')) return
    setLoading(id)
    try {
      await fetch(`/api/anuncios/${id}`, { method: 'DELETE' })
      setListings((prev) => prev.filter((l) => l.id !== id))
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-600">Você ainda não tem anúncios</p>
        <p className="text-sm mt-1">Que tal publicar o seu primeiro?</p>
        <Link href="/anuncios/novo" className="btn-primary mt-4 inline-flex">
          Publicar Anúncio
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {listings.map((listing) => {
        let imgs: string[] = []
        try { imgs = JSON.parse(listing.images) } catch {}
        const isLoading = loading === listing.id

        return (
          <div key={listing.id} className="card p-4 flex gap-4 items-start">
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
              {imgs[0] ? (
                <Image src={imgs[0]} alt={listing.title} width={80} height={80} className="object-cover w-full h-full" />
              ) : (
                <div className="text-gray-400">
                  <CategoryIcon name={listing.category.slug} className="w-8 h-8" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 truncate flex-1">{listing.title}</h3>
                <span className={`badge flex-shrink-0 ${
                  listing.status === 'active' ? 'bg-green-100 text-green-700' :
                  listing.status === 'sold' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {listing.status === 'active' ? 'Ativo' :
                   listing.status === 'sold' ? 'Vendido' : 'Pausado'}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
                <span className="font-semibold text-blue-600">
                  {listing.priceType === 'free' ? 'Grátis' :
                   listing.priceType === 'exchange' ? 'Troca' :
                   listing.price ? formatPrice(listing.price) : 'A combinar'}
                </span>
                <span>{listing.views} visualizações</span>
                <span>{listing.category.name}</span>
                <span>{formatDate(listing.createdAt)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0">
              <Link href={`/anuncios/${listing.id}`} className="btn-secondary text-xs py-1.5 px-3 text-center">
                Ver
              </Link>
              <Link href={`/anuncios/${listing.id}/editar`} className="btn-secondary text-xs py-1.5 px-3 text-center">
                Editar
              </Link>
              {listing.status === 'active' ? (
                <button onClick={() => updateStatus(listing.id, 'paused')} disabled={isLoading}
                  className="text-xs py-1.5 px-3 rounded-lg border border-yellow-300 text-yellow-700 hover:bg-yellow-50 transition-colors">
                  Pausar
                </button>
              ) : listing.status === 'paused' ? (
                <button onClick={() => updateStatus(listing.id, 'active')} disabled={isLoading}
                  className="text-xs py-1.5 px-3 rounded-lg border border-green-300 text-green-700 hover:bg-green-50 transition-colors">
                  Ativar
                </button>
              ) : null}
              {listing.status !== 'sold' && (
                <button onClick={() => updateStatus(listing.id, 'sold')} disabled={isLoading}
                  className="text-xs py-1.5 px-3 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors">
                  Vendido
                </button>
              )}
              <button onClick={() => deleteListing(listing.id)} disabled={isLoading}
                className="text-xs py-1.5 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                Excluir
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
