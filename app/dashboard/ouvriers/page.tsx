'use client'

import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { APP_CONFIG } from '@/lib/config'

interface Ouvrier {
  id: number
  nom: string
  prenom: string
  telephone: string
  rfid: string
  departement: string
}

interface User {
  id: number
  nom: string
  prenom: string
  role: string
  departement?: string
}

export default function Ouvriers() {
  const [ouvriers, setOuvriers] = useState<Ouvrier[]>([])
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    rfid: '',
    departement: '',
  })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData && userData !== 'undefined') {
      const parsed: User = JSON.parse(userData)
      setUser(parsed)
      // eslint-disable-next-line react-hooks/immutability
      fetchOuvriers(parsed)
    }
  }, [])

  const fetchOuvriers = async (currentUser: User) => {
    try {
      let url = `/ouvriers`
      if (currentUser.role === 'superviseur' && currentUser.departement) {
        url += `?departement=${currentUser.departement}`
      }
      const res = await axios.get(url)
      setOuvriers(res.data)
    } catch (err) {
      console.log('Erreur:', err)
    }
  }

  const ajouterOuvrier = async () => {
    try {
      await axios.post(`/ouvriers`, form)
      setMessage('Ouvrier ajouté !')
      setForm({ nom: '', prenom: '', telephone: '', rfid: '', departement: '' })
      setShowForm(false)
      if (user) fetchOuvriers(user)
    } catch (err) {
      console.log('Erreur:', err)
    }
  }

  const supprimerOuvrier = async (id: number) => {
    if (confirm('Supprimer cet ouvrier ?')) {
      try {
        await axios.delete(`/ouvriers/${id}`)
        setOuvriers(ouvriers.filter(o => o.id !== id))
      } catch (err) {
        console.log('Erreur:', err)
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800">Gestion des Ouvriers</h2>
          <p className="text-sm text-zinc-500">
            {user?.role === 'superviseur'
              ? `Département : ${user.departement}`
              : 'Tous les départements'
            }
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            + Ajouter un ouvrier
          </button>
        )}
      </div>

      {message && (
        <div className="bg-green-100 text-green-700 p-4 rounded-lg text-sm">
          ✅ {message}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nouvel ouvrier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">Nom</label>
                <input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nom" />
              </div>
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">Prénom</label>
                <input type="text" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Prénom" />
              </div>
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">Téléphone</label>
                <input type="text" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Téléphone" />
              </div>
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">RFID</label>
                <input type="text" value={form.rfid} onChange={(e) => setForm({ ...form, rfid: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Identifiant RFID" />
              </div>
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">Département</label>
                <select value={form.departement} onChange={(e) => setForm({ ...form, departement: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">Sélectionner un département</option>
                  <option value="Coupe">Coupe</option>
                  <option value="Couture">Couture</option>
                  <option value="Lavage">Lavage</option>
                  <option value="Finition">Finition</option>
                  <option value="Contrôle Qualité">Contrôle Qualité</option>
                  <option value="Emballage">Emballage</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={ajouterOuvrier} className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-green-700">Enregistrer</button>
              <button onClick={() => setShowForm(false)} className="bg-zinc-400 text-white px-6 py-2 rounded-lg text-sm">Annuler</button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Liste des ouvriers ({ouvriers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-zinc-500">
                <th className="text-left py-2">Ouvrier</th>
                <th className="text-left py-2">Département</th>
                <th className="text-left py-2">Téléphone</th>
                <th className="text-left py-2">RFID</th>
                <th className="text-left py-2">Statut</th>
                {user?.role === 'admin' && <th className="text-left py-2">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {ouvriers.map((o) => (
                <tr key={o.id} className="border-b hover:bg-zinc-50">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-zinc-100 rounded-full flex items-center justify-center">
                        <span className="text-zinc-600 font-bold text-xs">{o.prenom[0]}{o.nom[0]}</span>
                      </div>
                      <p className="font-medium">{o.prenom} {o.nom}</p>
                    </div>
                  </td>
                  <td className="py-3">
                    <Badge className="bg-blue-50 text-blue-600 border border-blue-100">{o.departement ?? '—'}</Badge>
                  </td>
                  <td className="py-3 text-zinc-500">{o.telephone}</td>
                  <td className="py-3">
                    <span className="bg-zinc-50 text-zinc-600 px-3 py-1 rounded-full text-xs border border-zinc-200">{o.rfid}</span>
                  </td>
                  <td className="py-3">
                    <Badge className="bg-green-100 text-green-700">Actif</Badge>
                  </td>
                  {user?.role === 'admin' && (
                    <td className="py-3">
                      <button onClick={() => supprimerOuvrier(o.id)} className="text-red-500 hover:text-red-700 text-xs border border-red-200 px-3 py-1 rounded hover:bg-red-50">Supprimer</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

    </div>
  )
}