import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminConversationPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const me = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!me?.isAdmin) redirect('/')

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      listing: { select: { id: true, title: true } },
      buyer: { select: { id: true, name: true, email: true } },
      seller: { select: { id: true, name: true, email: true } },
      messages: {
        include: { sender: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!conversation) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Conversa — Admin</h1>
      </div>

      <div className="card p-4 mb-4 text-sm text-gray-600 space-y-1">
        <p><span className="font-medium">Anúncio:</span>{' '}
          <Link href={`/anuncios/${conversation.listing.id}`} className="text-blue-600 hover:underline">
            {conversation.listing.title}
          </Link>
        </p>
        <p><span className="font-medium">Comprador:</span> {conversation.buyer.name} ({conversation.buyer.email})</p>
        <p><span className="font-medium">Vendedor:</span> {conversation.seller.name} ({conversation.seller.email})</p>
        <p><span className="font-medium">Total de mensagens:</span> {conversation.messages.length}</p>
      </div>

      <div className="card p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {conversation.messages.map((msg) => {
          const isBuyer = msg.senderId === conversation.buyerId
          return (
            <div key={msg.id} className={`flex gap-3 ${isBuyer ? '' : 'flex-row-reverse'}`}>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                {msg.sender.name.charAt(0).toUpperCase()}
              </div>
              <div className={`max-w-[75%] ${isBuyer ? '' : 'items-end'} flex flex-col`}>
                <span className="text-xs text-gray-400 mb-1">{msg.sender.name}</span>
                <div className={`px-4 py-2.5 rounded-2xl text-sm ${isBuyer ? 'bg-gray-100 text-gray-800' : 'bg-blue-600 text-white'}`}>
                  {msg.content}
                </div>
                <span className="text-xs text-gray-400 mt-1">{formatDateTime(msg.createdAt)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
