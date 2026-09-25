import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
  })

  if (
    !conversation ||
    (conversation.buyerId !== session.user.id && conversation.sellerId !== session.user.id)
  ) {
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  }

  // Marca mensagens como lidas
  await prisma.message.updateMany({
    where: {
      conversationId: params.id,
      senderId: { not: session.user.id },
      read: false,
    },
    data: { read: true },
  })

  const messages = await prisma.message.findMany({
    where: { conversationId: params.id },
    include: { sender: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(messages)
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
  })

  if (
    !conversation ||
    (conversation.buyerId !== session.user.id && conversation.sellerId !== session.user.id)
  ) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    const { content } = await req.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Mensagem vazia' }, { status: 400 })
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: 'Mensagem muito longa' }, { status: 400 })
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        conversationId: params.id,
        senderId: session.user.id,
      },
      include: { sender: { select: { id: true, name: true } } },
    })

    // Atualiza updatedAt da conversa
    await prisma.conversation.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 })
  }
}
