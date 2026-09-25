import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ChatWindow } from './ChatWindow'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function ChatPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      listing: {
        include: { category: true },
      },
      buyer: { select: { id: true, name: true } },
      seller: { select: { id: true, name: true } },
    },
  })

  if (
    !conversation ||
    (conversation.buyerId !== session.user.id && conversation.sellerId !== session.user.id)
  ) {
    notFound()
  }

  // Marca como lidas
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

  const otherUser =
    conversation.buyerId === session.user.id ? conversation.seller : conversation.buyer

  let imgs: string[] = []
  try { imgs = JSON.parse(conversation.listing.images) } catch {}

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/painel/mensagens" className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-blue-600 font-bold">{otherUser.name.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{otherUser.name}</p>
          <p className="text-xs text-gray-500">Conversa sobre o anúncio</p>
        </div>
      </div>

      {/* Card do anúncio */}
      <Link href={`/anuncios/${conversation.listing.id}`} className="card flex items-center gap-4 p-4 mb-4 hover:shadow-md transition-shadow">
        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
          {imgs[0] ? (
            <Image src={imgs[0]} alt="" width={64} height={64} className="object-cover w-full h-full" />
          ) : (
            <span className="text-2xl">{conversation.listing.category.icon}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{conversation.listing.title}</p>
          <p className="text-blue-600 font-bold text-sm">
            {conversation.listing.price
              ? formatPrice(conversation.listing.price)
              : 'A combinar'}
          </p>
          <p className={`text-xs mt-0.5 ${
            conversation.listing.status === 'active' ? 'text-green-600' : 'text-gray-400'
          }`}>
            {conversation.listing.status === 'active' ? '● Disponível' : '● Indisponível'}
          </p>
        </div>
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </Link>

      {/* Chat */}
      <ChatWindow
        conversationId={params.id}
        currentUserId={session.user.id}
        initialMessages={messages.map((m) => ({
          ...m,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
