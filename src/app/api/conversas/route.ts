import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { buyerId: session.user.id },
        { sellerId: session.user.id },
      ],
    },
    include: {
      listing: {
        select: { id: true, title: true, images: true, status: true },
      },
      buyer: { select: { id: true, name: true } },
      seller: { select: { id: true, name: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  // Conta mensagens não lidas
  const unreadCounts = await Promise.all(
    conversations.map(async (conv) => {
      const count = await prisma.message.count({
        where: {
          conversationId: conv.id,
          read: false,
          senderId: { not: session.user.id },
        },
      })
      return { id: conv.id, unread: count }
    })
  )

  const result = conversations.map((conv) => ({
    ...conv,
    unreadCount: unreadCounts.find((u) => u.id === conv.id)?.unread || 0,
  }))

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { listingId, sellerId } = await req.json()

    if (!listingId || !sellerId) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    if (session.user.id === sellerId) {
      return NextResponse.json({ error: 'Você não pode conversar consigo mesmo' }, { status: 400 })
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } })
    if (!listing || listing.status === 'deleted') {
      return NextResponse.json({ error: 'Anúncio não encontrado' }, { status: 404 })
    }

    // Verifica se conversa já existe
    const existing = await prisma.conversation.findUnique({
      where: { listingId_buyerId: { listingId, buyerId: session.user.id } },
    })

    if (existing) return NextResponse.json(existing)

    const conversation = await prisma.conversation.create({
      data: {
        listingId,
        buyerId: session.user.id,
        sellerId,
      },
    })

    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    console.error('Create conversation error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
