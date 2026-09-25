import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      user: { select: { id: true, name: true, phone: true, createdAt: true } },
    },
  })

  if (!listing || listing.status === 'deleted') {
    return NextResponse.json({ error: 'Anúncio não encontrado' }, { status: 404 })
  }

  return NextResponse.json(listing)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const listing = await prisma.listing.findUnique({ where: { id: params.id } })
  if (!listing || listing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { title, description, price, priceType, condition, location, status, images } = body

    const updated = await prisma.listing.update({
      where: { id: params.id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description && { description: description.trim() }),
        ...(price !== undefined && { price: price ? parseFloat(price) : null }),
        ...(priceType && { priceType }),
        ...(condition !== undefined && { condition }),
        ...(location && { location }),
        ...(status && { status }),
        ...(images && { images: JSON.stringify(images) }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update listing error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const listing = await prisma.listing.findUnique({ where: { id: params.id } })
  if (!listing || listing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  // Soft delete
  await prisma.listing.update({
    where: { id: params.id },
    data: { status: 'deleted' },
  })

  return NextResponse.json({ success: true })
}
