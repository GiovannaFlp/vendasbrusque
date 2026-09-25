'use client'

interface SortSelectProps {
  currentOrder?: string
  baseUrl: string
}

export function SortSelect({ currentOrder, baseUrl }: SortSelectProps) {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const url = new URL(baseUrl, window.location.origin)
    url.searchParams.delete('ordem')
    url.searchParams.delete('pagina')
    if (e.target.value) {
      url.searchParams.set('ordem', e.target.value)
    }
    window.location.href = url.toString()
  }

  return (
    <select
      defaultValue={currentOrder || ''}
      onChange={handleChange}
      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Mais recentes</option>
      <option value="preco_asc">Menor preço</option>
      <option value="preco_desc">Maior preço</option>
      <option value="mais_vistos">Mais vistos</option>
    </select>
  )
}
