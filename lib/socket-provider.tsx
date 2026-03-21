'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { socket } from '@/lib/socket'

const SocketContext = createContext({ connected: false })

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.connect()

    return () => {
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [])

  return (
    <SocketContext.Provider value={{ connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)