import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { EditListingForm } from './EditListingForm'

export const metadata = { title: 'Editar Anúncio' }

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const [listing, categories] = await Promise.all([
    prisma.listing.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!listing || listing.userId !== session.user.id || listing.status === 'deleted') {
    notFound()
  }

  let images: string[] = []
  try { images = JSON.parse(listing.images) } catch {}

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Editar Anúncio</h1>
        <p className="text-gray-500 mt-1">Atualize as informações do seu anúncio</p>
      </div>

      <EditListingForm
        listing={{
          id: listing.id,
          title: listing.title,
          description: listing.description,
          price: listing.price,
          priceType: listing.priceType,
          condition: listing.condition,
          categoryId: listing.categoryId,
          location: listing.location,
          images,
        }}
        categories={categories}
      />
    </div>
  )
}
