import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Rota de setup inicial - cria tabelas e dados de exemplo
// Acesse: /api/setup para inicializar o banco
export async function GET() {
  try {
    // Testa conexão
    await prisma.$connect()

    // Cria categorias
    const categories = [
      { name: 'Veículos', slug: 'veiculos', icon: 'veiculos', color: 'bg-blue-500' },
      { name: 'Imóveis', slug: 'imoveis', icon: 'imoveis', color: 'bg-green-500' },
      { name: 'Eletrônicos', slug: 'eletronicos', icon: 'eletronicos', color: 'bg-purple-500' },
      { name: 'Móveis e Decoração', slug: 'moveis', icon: 'moveis', color: 'bg-yellow-500' },
      { name: 'Roupas e Calçados', slug: 'roupas', icon: 'roupas', color: 'bg-pink-500' },
      { name: 'Serviços', slug: 'servicos', icon: 'servicos', color: 'bg-orange-500' },
      { name: 'Alimentos', slug: 'alimentos', icon: 'alimentos', color: 'bg-red-500' },
      { name: 'Esportes', slug: 'esportes', icon: 'esportes', color: 'bg-teal-500' },
      { name: 'Outros', slug: 'outros', icon: 'outros', color: 'bg-gray-500' },
    ]

    for (const cat of categories) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      })
    }

    // Cria usuário demo
    const hashedPassword = await bcrypt.hash('demo123', 10)
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@vendasbrusque.com.br' },
      update: {},
      create: {
        name: 'Demo Usuário',
        email: 'demo@vendasbrusque.com.br',
        password: hashedPassword,
        phone: '(47) 99999-9999',
      },
    })

    // Cria anúncios de exemplo
    const veiculos = await prisma.category.findUnique({ where: { slug: 'veiculos' } })
    const imoveis = await prisma.category.findUnique({ where: { slug: 'imoveis' } })
    const eletronicos = await prisma.category.findUnique({ where: { slug: 'eletronicos' } })
    const servicos = await prisma.category.findUnique({ where: { slug: 'servicos' } })

    const existing = await prisma.listing.count({ where: { userId: demoUser.id } })

    if (existing === 0 && veiculos && imoveis && eletronicos && servicos) {
      await prisma.listing.createMany({
        data: [
          {
            title: 'Honda Civic 2019 - Excelente estado',
            description: 'Vendo Honda Civic 2019, único dono, 45.000 km rodados. IPVA pago, revisões em dia. Aceito troca.',
            price: 89900,
            priceType: 'negotiable',
            condition: 'used',
            categoryId: veiculos.id,
            userId: demoUser.id,
            images: '[]',
          },
          {
            title: 'Apartamento 2 quartos Centro Brusque',
            description: 'Lindo apartamento no centro de Brusque, 2 quartos, sala, cozinha, banheiro. Prédio com elevador.',
            price: 280000,
            priceType: 'fixed',
            condition: null,
            categoryId: imoveis.id,
            userId: demoUser.id,
            images: '[]',
          },
          {
            title: 'iPhone 14 128GB - Semi novo',
            description: 'iPhone 14 128GB cor preta. Comprado há 8 meses, tela perfeita, bateria 94%. Acompanha carregador original.',
            price: 3200,
            priceType: 'negotiable',
            condition: 'used',
            categoryId: eletronicos.id,
            userId: demoUser.id,
            images: '[]',
          },
          {
            title: 'Conserto de eletrodomésticos em geral',
            description: 'Técnico com 15 anos de experiência. Conserto de geladeira, máquina de lavar, fogão e muito mais.',
            price: null,
            priceType: 'negotiable',
            condition: null,
            categoryId: servicos.id,
            userId: demoUser.id,
            images: '[]',
          },
        ],
      })
    }

    return NextResponse.json({
      success: true,
      message: '✅ Banco configurado com sucesso!',
      info: 'Login demo: demo@vendasbrusque.com.br / demo123',
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
