'use client'

import { useEffect, useRef, useCallback, createContext, useContext, useState } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

interface NotificationContextType {
  unreadCount: number
}

const NotificationContext = createContext<NotificationContextType>({ unreadCount: 0 })

export function useNotifications() {
  return useContext(NotificationContext)
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)
  const prevCountRef = useRef(0)
  const pathname = usePathname()
  const permissionRef = useRef<NotificationPermission>('default')

  // Pede permissão para notificações do browser
  useEffect(() => {
    if (!session) return
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((perm) => {
        permissionRef.current = perm
      })
    } else if ('Notification' in window) {
      permissionRef.current = Notification.permission
    }
  }, [session])

  const checkUnread = useCallback(async () => {
    if (!session) return
    try {
      const res = await fetch('/api/notificacoes/unread')
      if (!res.ok) return
      const data = await res.json()
      const count: number = data.count ?? 0

      // Dispara notificação nativa se chegou mensagem nova e não está na página de mensagens
      if (count > prevCountRef.current && !pathname.startsWith('/painel/mensagens')) {
        if ('Notification' in window && Notification.permission === 'granted') {
          const diff = count - prevCountRef.current
          new Notification('VendasBrusque', {
            body: `Você tem ${diff} nova${diff > 1 ? 's' : ''} mensagem${diff > 1 ? 's' : ''}`,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
          })
        }
      }

      prevCountRef.current = count
      setUnreadCount(count)
    } catch {}
  }, [session, pathname])

  useEffect(() => {
    if (!session) return
    checkUnread()
    const interval = setInterval(checkUnread, 10000) // a cada 10 segundos
    return () => clearInterval(interval)
  }, [session, checkUnread])

  // Zera contador quando está na página de mensagens
  useEffect(() => {
    if (pathname.startsWith('/painel/mensagens')) {
      setTimeout(checkUnread, 2000)
    }
  }, [pathname, checkUnread])

  return (
    <NotificationContext.Provider value={{ unreadCount }}>
      {children}
    </NotificationContext.Provider>
  )
}
