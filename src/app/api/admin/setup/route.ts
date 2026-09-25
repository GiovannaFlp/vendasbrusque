import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Rota única para tornar giovannagabiflp@gmail.com admin
// Acesse uma vez: /api/admin/setup
export async function GET() {
  try {
    const user = await prisma.user.update({
      where: { email: 'giovannagabiflp@gmail.com' },
      data: { isAdmin: true },
    })
    return NextResponse.json({ success: true, message: `${user.name} agora é admin!` })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
