import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-500 text-white font-bold text-lg px-3 py-1.5 rounded-lg">
                VB
              </div>
              <span className="font-bold text-white text-xl">VendasBrusque</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              O marketplace local de Brusque e região. Compre, venda e negocie com segurança perto de você.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Categorias</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/anuncios?categoria=veiculos" className="hover:text-white transition-colors">Veículos</Link></li>
              <li><Link href="/anuncios?categoria=imoveis" className="hover:text-white transition-colors">Imóveis</Link></li>
              <li><Link href="/anuncios?categoria=eletronicos" className="hover:text-white transition-colors">Eletrônicos</Link></li>
              <li><Link href="/anuncios?categoria=servicos" className="hover:text-white transition-colors">Serviços</Link></li>
              <li><Link href="/anuncios?categoria=alimentos" className="hover:text-white transition-colors">Alimentos</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Links Úteis</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/anuncios/novo" className="hover:text-white transition-colors">Publicar Anúncio</Link></li>
              <li><Link href="/cadastro" className="hover:text-white transition-colors">Criar Conta</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Entrar</Link></li>
              <li><Link href="/painel" className="hover:text-white transition-colors">Meu Painel</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} VendasBrusque. Todos os direitos reservados.</p>
          <p>Feito em Brusque, SC</p>
        </div>
      </div>
    </footer>
  )
}
