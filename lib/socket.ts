import { io } from 'socket.io-client'
import { APP_CONFIG } from './config'

export const socket = io(APP_CONFIG.apiUrl, {
  transports: ['websocket'],
  autoConnect: true,
})