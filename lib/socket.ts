import { io } from 'socket.io-client'
import { APP_CONFIG } from './config'

let socketInstance: ReturnType<typeof io> | null = null

function getSocket() {
  if (!socketInstance) {
    socketInstance = io(APP_CONFIG.apiUrl, {
      transports: ['polling', 'websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 20000,
    })
  }
  return socketInstance
}

export const socket = getSocket()