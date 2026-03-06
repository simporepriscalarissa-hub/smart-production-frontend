'use client'

import { useState } from 'react'
import axios from 'axios'
import { APP_CONFIG } from '@/lib/config'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erreur, setErreur] = useState('')
  const [loading, setLoading] = useState(false)

  const seConnecter = async () => {
    setLoading(true)
    setErreur('')
    try {
      const response = await axios.post(`${APP_CONFIG.apiUrl}/auth/login`, { email, password })
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      document.cookie = `token=${response.data.access_token}; path=/`

      const role = response.data.user.role
      if (role === 'admin' || role === 'superviseur') {
        window.location.href = '/dashboard'
      } else {
        setErreur('Accès non autorisé')
      }
    } catch (err) {
      setErreur('Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-8 w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-800">{APP_CONFIG.entreprise}</h1>
          <p className="text-sm text-zinc-400 mt-1">Connectez vous à votre espace</p>
        </div>

        {erreur && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-100">
            {erreur}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-zinc-600 mb-1 block font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              placeholder="email@production.com"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-600 mb-1 block font-medium">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && seConnecter()}
              className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              placeholder="••••••••"
            />
          </div>
          <button
            onClick={seConnecter}
            disabled={loading}
            className="bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-zinc-400">Vous êtes un opérateur ?</p>
          <a href="/rfid-login" className="text-sm text-blue-600 hover:underline font-medium">
            Connexion via RFID
          </a>
        </div>

      </div>
    </div>
  )
}