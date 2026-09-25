import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-black text-blue-600 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Página não encontrada</h1>
        <p className="text-gray-500 mb-8">
          O que você está procurando não está aqui.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary">
            Voltar ao início
          </Link>
          <Link href="/anuncios" className="btn-secondary">
            Ver anúncios
          </Link>
        </div>
      </div>
    </div>
  )
}
