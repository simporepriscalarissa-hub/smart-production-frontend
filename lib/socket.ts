import { io } from 'socket.io-client'
import { APP_CONFIG } from './config'

const URL = APP_CONFIG.apiUrl.replace('https://', 'wss://').replace('http://', 'ws://')

export const socket = io(APP_CONFIG.apiUrl, {
  transports: ['polling', 'websocket'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  timeout: 20000,
  forceNew: false,
  path: '/socket.io',
})

socket.on('connect', () => {
  console.log('✅ WebSocket connecté:', socket.id)
})

socket.on('connect_error', (err) => {
  console.log('❌ WebSocket erreur:', err.message)
})

socket.on('disconnect', (reason) => {
  console.log('⚠️ WebSocket déconnecté:', reason)
})