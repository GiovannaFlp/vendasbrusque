const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Categorias
  const categories = [
    { name: 'Veículos', slug: 'veiculos', icon: '🚗', color: 'bg-blue-500' },
    { name: 'Imóveis', slug: 'imoveis', icon: '🏠', color: 'bg-green-500' },
    { name: 'Eletrônicos', slug: 'eletronicos', icon: '📱', color: 'bg-purple-500' },
    { name: 'Móveis e Decoração', slug: 'moveis', icon: '🛋️', color: 'bg-yellow-500' },
    { name: 'Roupas e Calçados', slug: 'roupas', icon: '👕', color: 'bg-pink-500' },
    { name: 'Serviços', slug: 'servicos', icon: '🔧', color: 'bg-orange-500' },
    { name: 'Alimentos', slug: 'alimentos', icon: '🍽️', color: 'bg-red-500' },
    { name: 'Esportes', slug: 'esportes', icon: '⚽', color: 'bg-teal-500' },
    { name: 'Outros', slug: 'outros', icon: '📦', color: 'bg-gray-500' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log('✅ Categorias criadas')

  // Usuário de demonstração
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
  console.log('✅ Usuário demo criado: demo@vendasbrusque.com.br / demo123')

  // Anúncios de exemplo
  const veiculos = await prisma.category.findUnique({ where: { slug: 'veiculos' } })
  const imoveis = await prisma.category.findUnique({ where: { slug: 'imoveis' } })
  const eletronicos = await prisma.category.findUnique({ where: { slug: 'eletronicos' } })
  const servicos = await prisma.category.findUnique({ where: { slug: 'servicos' } })

  const sampleListings = [
    {
      title: 'Honda Civic 2019 - Excelente estado',
      description: 'Vendo Honda Civic 2019, único dono, 45.000 km rodados. IPVA pago, revisões em dia. Aceito troca.',
      price: 89900,
      priceType: 'negotiable',
      condition: 'used',
      categoryId: veiculos.id,
    },
    {
      title: 'Apartamento 2 quartos Centro Brusque',
      description: 'Lindo apartamento no centro de Brusque, 2 quartos, sala, cozinha, banheiro. Prédio com elevador.',
      price: 280000,
      priceType: 'fixed',
      condition: null,
      categoryId: imoveis.id,
    },
    {
      title: 'iPhone 14 128GB - Semi novo',
      description: 'iPhone 14 128GB cor preta. Comprado há 8 meses, tela perfeita, bateria 94%. Acompanha carregador original.',
      price: 3200,
      priceType: 'negotiable',
      condition: 'used',
      categoryId: eletronicos.id,
    },
    {
      title: 'Conserto de eletrodomésticos em geral',
      description: 'Técnico com 15 anos de experiência. Conserto de geladeira, máquina de lavar, fogão e muito mais. Atendo em Brusque e região.',
      price: null,
      priceType: 'negotiable',
      condition: null,
      categoryId: servicos.id,
    },
  ]

  for (const listing of sampleListings) {
    await prisma.listing.create({
      data: {
        ...listing,
        userId: demoUser.id,
        images: '[]',
      },
    })
  }
  console.log('✅ Anúncios de exemplo criados')

  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
