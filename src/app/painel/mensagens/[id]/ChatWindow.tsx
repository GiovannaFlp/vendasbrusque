'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Message {
  id: string
  content: string
  read: boolean
  createdAt: string
  senderId: string
  sender: { id: string; name: string }
}

interface ChatWindowProps {
  conversationId: string
  currentUserId: string
  initialMessages: Message[]
}

export function ChatWindow({ conversationId, currentUserId, initialMessages }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Scroll apenas dentro do container do chat — não afeta a página
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const container = chatContainerRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior })
  }, [])

  // Scroll imediato ao carregar
  useEffect(() => {
    scrollToBottom('instant')
  }, [scrollToBottom])

  // Scroll suave ao receber nova mensagem
  useEffect(() => {
    scrollToBottom('smooth')
  }, [messages, scrollToBottom])

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/conversas/${conversationId}/mensagens`)
      if (!res.ok) return
      const data: Message[] = await res.json()
      setMessages(data)
    } catch {}
  }, [conversationId])

  useEffect(() => {
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return

    const content = input.trim()
    setInput('')
    setSending(true)

    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      content,
      read: false,
      createdAt: new Date().toISOString(),
      senderId: currentUserId,
      sender: { id: currentUserId, name: 'Você' },
    }
    setMessages((prev) => [...prev, tempMsg])

    try {
      const res = await fetch(`/api/conversas/${conversationId}/mensagens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (res.ok) {
        const saved: Message = await res.json()
        setMessages((prev) => prev.map((m) => (m.id === tempMsg.id ? saved : m)))
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id))
        setInput(content)
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id))
      setInput(content)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(e as unknown as React.FormEvent)
    }
  }

  function formatTime(dateStr: string) {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr))
  }

  function formatDateGroup(dateStr: string) {
    const d = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === today.toDateString()) return 'Hoje'
    if (d.toDateString() === yesterday.toDateString()) return 'Ontem'
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long' }).format(d)
  }

  const groupedMessages: { date: string; messages: Message[] }[] = []
  messages.forEach((msg) => {
    const dateKey = new Date(msg.createdAt).toDateString()
    const group = groupedMessages.find((g) => g.date === dateKey)
    if (group) group.messages.push(msg)
    else groupedMessages.push({ date: dateKey, messages: [msg] })
  })

  const myMessages = messages.filter((m) => m.senderId === currentUserId && !m.id.startsWith('temp-'))
  const lastMyMsgId = myMessages[myMessages.length - 1]?.id

  return (
    <div className="card flex flex-col" style={{ height: '520px' }}>
      {/* Container de mensagens com scroll próprio */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-1"
        style={{ overscrollBehavior: 'contain' }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="font-medium text-gray-600">Inicie a conversa!</p>
            <p className="text-sm">Envie uma mensagem para negociar</p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              <div className="flex items-center justify-center my-4">
                <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                  {formatDateGroup(group.messages[0].createdAt)}
                </div>
              </div>

              {group.messages.map((msg, i) => {
                const isMe = msg.senderId === currentUserId
                const isTemp = msg.id.startsWith('temp-')
                const prevMsg = group.messages[i - 1]
                const sameSender = prevMsg?.senderId === msg.senderId
                const showName = !isMe && !sameSender
                const isLastMine = msg.id === lastMyMsgId

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${sameSender ? 'mt-0.5' : 'mt-3'}`}
                  >
                    {!isMe && !sameSender && (
                      <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mr-2 mt-1 flex-shrink-0">
                        {msg.sender.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {!isMe && sameSender && <div className="w-7 mr-2 flex-shrink-0" />}

                    <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      {showName && (
                        <span className="text-xs text-gray-500 mb-1 ml-1">{msg.sender.name}</span>
                      )}
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      } ${isTemp ? 'opacity-70' : ''}`}>
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                      <span className={`text-xs mt-1 ${isMe ? 'text-right' : ''} text-gray-400`}>
                        {formatTime(msg.createdAt)}
                        {isTemp && <span className="ml-1 opacity-50"> · enviando</span>}
                        {isMe && !isTemp && isLastMine && (
                          <span className={`ml-1 ${msg.read ? 'text-blue-500' : 'opacity-50'}`}>
                            {msg.read ? ' · lido' : ' · enviado'}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-4 flex-shrink-0">
        <form onSubmit={sendMessage} className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma mensagem..."
            rows={1}
            maxLength={1000}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
            style={{ minHeight: '44px', maxHeight: '120px' }}
            onInput={(e) => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = Math.min(el.scrollHeight, 120) + 'px'
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl p-2.5 flex-shrink-0 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-1.5 text-center">Enter para enviar · Shift+Enter para quebrar linha</p>
      </div>
    </div>
  )
}
