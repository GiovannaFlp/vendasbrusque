'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ContactButtonProps {
  listingId: string
  sellerId: string
}

export function ContactButton({ listingId, sellerId }: ContactButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleContact() {
    if (!session) {
      router.push(`/login?callbackUrl=/anuncios/${listingId}`)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/conversas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, sellerId }),
      })

      if (!res.ok) throw new Error()

      const data = await res.json()
      router.push(`/painel/mensagens/${data.id}`)
    } catch {
      alert('Erro ao iniciar conversa. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleContact}
        disabled={loading}
        className="btn-primary w-full text-sm py-3 flex items-center justify-center gap-2"
      >
        {loading ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
        Entrar em Contato
      </button>
      <p className="text-xs text-center text-gray-400">
        {session ? 'Negocie pelo chat da plataforma' : 'Faça login para enviar mensagem'}
      </p>
    </div>
  )
}
