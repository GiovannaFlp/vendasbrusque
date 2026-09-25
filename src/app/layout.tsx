import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: {
    default: 'VendasBrusque – Compre e Venda em Brusque',
    template: '%s | VendasBrusque',
  },
  description:
    'O maior marketplace de Brusque e região. Compre, venda e negocie carros, imóveis, eletrônicos, serviços e muito mais.',
  keywords: ['brusque', 'compra e venda', 'classificados', 'marketplace', 'santa catarina'],
  openGraph: {
    title: 'VendasBrusque',
    description: 'Compre e venda em Brusque, SC',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
