'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Category {
  id: string
  name: string
  slug: string
  icon: string
}

export function NewListingForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    priceType: 'fixed',
    condition: 'used',
    categoryId: '',
    location: 'Brusque, SC',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 8) {
      setError('Máximo de 8 fotos por anúncio')
      return
    }
    const newPreviews = files.map((f) => URL.createObjectURL(f))
    setImages((prev) => [...prev, ...files])
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx))
    setPreviews((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.categoryId) {
      setError('Selecione uma categoria')
      return
    }

    setLoading(true)

    try {
      // Upload de imagens
      const imagePaths: string[] = []
      for (const file of images) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!res.ok) throw new Error('Erro ao enviar imagem')
        const data = await res.json()
        imagePaths.push(data.path)
      }

      // Cria o anúncio
      const res = await fetch('/api/anuncios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: form.price ? parseFloat(form.price) : null,
          images: imagePaths,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao criar anúncio')
      }

      const listing = await res.json()
      router.push(`/anuncios/${listing.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Fotos */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">📷 Fotos</h2>
        <div className="grid grid-cols-4 gap-3">
          {previews.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden group bg-gray-100">
              <Image src={src} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
              >
                ×
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">
                  Capa
                </span>
              )}
            </div>
          ))}
          {previews.length < 8 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs mt-1">Adicionar</span>
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImages}
        />
        <p className="text-xs text-gray-400 mt-2">Máx. 8 fotos • JPG, PNG até 5MB cada</p>
      </div>

      {/* Informações básicas */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">📝 Informações</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            maxLength={100}
            placeholder="Ex: iPhone 13 128GB Preto"
            className="input-field"
          />
          <p className="text-xs text-gray-400 mt-1">{form.title.length}/100 caracteres</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setForm({ ...form, categoryId: cat.id })}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm transition-colors ${
                  form.categoryId === cat.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={5}
            maxLength={2000}
            placeholder="Descreva o que está vendendo: estado, características, motivo da venda..."
            className="input-field resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{form.description.length}/2000 caracteres</p>
        </div>
      </div>

      {/* Preço */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">💰 Preço</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de preço</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'fixed', label: '💲 Preço fixo' },
              { value: 'negotiable', label: '🤝 Negociável' },
              { value: 'free', label: '🎁 Grátis' },
              { value: 'exchange', label: '🔄 Troca' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm({ ...form, priceType: opt.value })}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  form.priceType === opt.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {(form.priceType === 'fixed' || form.priceType === 'negotiable') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor (R$) {form.priceType === 'fixed' && <span className="text-red-500">*</span>}
            </label>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required={form.priceType === 'fixed'}
              placeholder="0,00"
              className="input-field"
            />
          </div>
        )}
      </div>

      {/* Detalhes */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">🔍 Detalhes</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Condição do item</label>
          <div className="flex gap-3">
            {[
              { value: 'new', label: '✨ Novo' },
              { value: 'used', label: '📦 Usado' },
              { value: 'reconditioned', label: '🔧 Recondicionado' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm({ ...form, condition: opt.value })}
                className={`flex-1 p-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  form.condition === opt.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Localização
          </label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Brusque, SC"
            className="input-field"
          />
        </div>
      </div>

      {/* Botões */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary flex-1"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Publicando...
            </>
          ) : (
            '✅ Publicar Anúncio'
          )}
        </button>
      </div>
    </form>
  )
}
