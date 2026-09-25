import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Mensagens' }

export default async function MessagesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login?callbackUrl=/painel/mensagens')

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { buyerId: session.user.id },
        { sellerId: session.user.id },
      ],
    },
    include: {
      listing: { select: { id: true, title: true, images: true } },
      buyer: { select: { id: true, name: true } },
      seller: { select: { id: true, name: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { sender: { select: { name: true } } },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  // Contagem de não lidas por conversa
  const unreadCounts = await Promise.all(
    conversations.map(async (conv) => {
      const count = await prisma.message.count({
        where: {
          conversationId: conv.id,
          read: false,
          senderId: { not: session.user.id },
        },
      })
      return { id: conv.id, count }
    })
  )

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mensagens</h1>
        <p className="text-gray-500 mt-1">{conversations.length} conversa{conversations.length !== 1 ? 's' : ''}</p>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-lg font-medium text-gray-600">Nenhuma conversa ainda</p>
          <p className="text-sm mt-1">Entre em contato com anunciantes para negociar</p>
          <Link href="/anuncios" className="btn-primary mt-4 inline-flex">
            Ver Anúncios
          </Link>
        </div>
      ) : (
        <div className="card divide-y divide-gray-50">
          {conversations.map((conv) => {
            const unread = unreadCounts.find((u) => u.id === conv.id)?.count || 0
            const otherUser = conv.buyerId === session.user.id ? conv.seller : conv.buyer
            const lastMessage = conv.messages[0]
            let imgs: string[] = []
            try { imgs = JSON.parse(conv.listing.images) } catch {}

            return (
              <Link
                key={conv.id}
                href={`/painel/mensagens/${conv.id}`}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors ${
                  unread > 0 ? 'bg-blue-50/30' : ''
                }`}
              >
                {/* Imagem do anúncio */}
                <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {imgs[0] ? (
                    <Image src={imgs[0]} alt="" width={56} height={56} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-gray-900 truncate">{otherUser.name}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {lastMessage && (
                        <span className="text-xs text-gray-400">
                          {formatDate(lastMessage.createdAt)}
                        </span>
                      )}
                      {unread > 0 && (
                        <span className="bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-0.5">{conv.listing.title}</p>
                  {lastMessage && (
                    <p className={`text-sm mt-0.5 truncate ${unread > 0 ? 'font-medium text-gray-800' : 'text-gray-400'}`}>
                      {lastMessage.sender.name.split(' ')[0]}: {lastMessage.content}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
