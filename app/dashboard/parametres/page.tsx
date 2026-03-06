'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { APP_CONFIG } from '@/lib/config'

export default function Parametres() {
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    entreprise: APP_CONFIG.entreprise,
    apiUrl: APP_CONFIG.apiUrl,
    unite: APP_CONFIG.unite,
  })

  const sauvegarder = () => {
    localStorage.setItem('parametres', JSON.stringify(form))
    setMessage('Paramètres sauvegardés !')
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h2 className="text-2xl font-bold text-zinc-800">Paramètres</h2>
        <p className="text-sm text-zinc-500">Configuration du système</p>
      </div>

      {message && (
        <div className="bg-green-100 text-green-700 p-4 rounded-lg text-sm">
          ✅ {message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-zinc-600 mb-1 block">Nom de l&apos;entreprise</label>
            <input
              type="text"
              value={form.entreprise}
              onChange={(e) => setForm({ ...form, entreprise: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-600 mb-1 block">URL de l&apos;API</label>
            <input
              type="text"
              value={form.apiUrl}
              onChange={(e) => setForm({ ...form, apiUrl: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-600 mb-1 block">Unité de mesure</label>
            <input
              type="text"
              value={form.unite}
              onChange={(e) => setForm({ ...form, unite: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={sauvegarder}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 w-fit"
          >
            Enregistrer les modifications
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Références produits</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {APP_CONFIG.references.map((ref, index) => (
            <input
              key={index}
              type="text"
              defaultValue={ref}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          ))}
          <button
            onClick={sauvegarder}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 w-fit mt-2"
          >
            Enregistrer
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Départements</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {APP_CONFIG.departements.map((dep, index) => (
            <input
              key={index}
              type="text"
              defaultValue={dep}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          ))}
          <button
            onClick={sauvegarder}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 w-fit mt-2"
          >
            Enregistrer
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comptes utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500 mb-3">
            Pour gérer les comptes allez dans
            <a href="/dashboard/users" className="text-blue-600 hover:underline ml-1">
              Gestion des utilisateurs
            </a>
          </p>
        </CardContent>
      </Card>

    </div>
  )
}