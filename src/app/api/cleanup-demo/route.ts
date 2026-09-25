import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@vendasbrusque.com.br' },
    })

    if (!demoUser) {
      return NextResponse.json({ message: 'Usuário demo não encontrado' })
    }

    // Deleta tudo em cascata (mensagens, conversas, anúncios, usuário)
    await prisma.user.delete({ where: { id: demoUser.id } })

    return NextResponse.json({ success: true, message: 'Usuário demo e todos os dados removidos!' })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
