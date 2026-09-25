import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatDate, formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Painel Admin' }

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const me = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!me?.isAdmin) redirect('/')

  const [users, listings, conversations, totalMessages] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.listing.findMany({
      where: { status: { not: 'deleted' } },
      include: { user: { select: { name: true, email: true } }, category: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.conversation.findMany({
      include: {
        listing: { select: { id: true, title: true } },
        buyer: { select: { name: true, email: true } },
        seller: { select: { name: true, email: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.message.count(),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-sm text-gray-500">Acesso total à plataforma</p>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Usuários', value: users.length, color: 'bg-blue-50 text-blue-600' },
          { label: 'Anúncios', value: listings.length, color: 'bg-green-50 text-green-600' },
          { label: 'Conversas', value: conversations.length, color: 'bg-purple-50 text-purple-600' },
          { label: 'Mensagens', value: totalMessages, color: 'bg-orange-50 text-orange-600' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <p className={`text-2xl font-bold ${stat.color.split(' ')[1]}`}>{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Usuários */}
      <div className="card mb-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Usuários ({users.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cadastro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-3 text-gray-500">{user.email}</td>
                  <td className="px-6 py-3 text-gray-500">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-3">
                    {user.isAdmin ? (
                      <span className="badge bg-red-100 text-red-700">Admin</span>
                    ) : (
                      <span className="badge bg-gray-100 text-gray-500">Usuário</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <Link href={`/admin/usuarios/${user.id}`} className="text-blue-600 hover:underline text-xs">
                      Ver detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Anúncios */}
      <div className="card mb-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Anúncios ({listings.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900 max-w-[200px] truncate">{listing.title}</td>
                  <td className="px-6 py-3 text-gray-500">{listing.user.name}</td>
                  <td className="px-6 py-3 text-gray-500">{listing.category.name}</td>
                  <td className="px-6 py-3 text-gray-900">{listing.price ? formatPrice(listing.price) : 'A combinar'}</td>
                  <td className="px-6 py-3">
                    <span className={`badge ${
                      listing.status === 'active' ? 'bg-green-100 text-green-700' :
                      listing.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {listing.status === 'active' ? 'Ativo' : listing.status === 'sold' ? 'Vendido' : 'Pausado'}
                    </span>
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    <Link href={`/anuncios/${listing.id}`} className="text-blue-600 hover:underline text-xs">Ver</Link>
                    <AdminDeleteListing id={listing.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversas */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Conversas ({conversations.length})</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {conversations.map((conv) => (
            <div key={conv.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{conv.listing.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {conv.buyer.name} → {conv.seller.name} · {conv._count.messages} mensagens
                  </p>
                  {conv.messages[0] && (
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      Última: {conv.messages[0].content}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-gray-400">{formatDate(conv.updatedAt)}</span>
                  <Link
                    href={`/admin/conversas/${conv.id}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Ver conversa
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Componente inline para deletar anúncio
function AdminDeleteListing({ id }: { id: string }) {
  return (
    <form action={`/api/admin/listings/${id}/delete`} method="POST">
      <button type="submit" className="text-red-600 hover:underline text-xs"
        onClick={(e) => { if (!confirm('Excluir este anúncio?')) e.preventDefault() }}>
        Excluir
      </button>
    </form>
  )
}
