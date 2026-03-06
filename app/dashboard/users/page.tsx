'use client'

import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface User {
  id: number
  nom: string
  prenom: string
  email: string
  role: string
  departement?: string
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', password: '', role: 'superviseur', departement: '',
  })

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`/users`)
        setUsers(res.data)
      } catch (err) {
        console.log('Erreur:', err)
      }
    }
    fetchUsers()
  }, [])

  const ajouterUser = async () => {
    try {
      await axios.post(`/auth/register`, form)
      setMessage('Utilisateur ajouté !')
      setForm({ nom: '', prenom: '', email: '', password: '', role: 'superviseur', departement: '' })
      setShowForm(false)
      const res = await axios.get(`/users`)
      setUsers(res.data)
    } catch (err) {
      console.log('Erreur:', err)
    }
  }

  const supprimerUser = async (id: number) => {
    if (confirm('Supprimer cet utilisateur ?')) {
      try {
        await axios.delete(`/users/${id}`)
        setUsers(users.filter(u => u.id !== id))
      } catch (err) {
        console.log('Erreur:', err)
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800">Gestion des Utilisateurs</h2>
          <p className="text-sm text-zinc-500">Administrateurs et superviseurs</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm">
          + Ajouter un utilisateur
        </button>
      </div>

      {message && <div className="bg-green-100 text-green-700 p-4 rounded-lg text-sm">✅ {message}</div>}

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Nouvel utilisateur</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">Nom</label>
                <input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">Prénom</label>
                <input type="text" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">Mot de passe</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">Rôle</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="superviseur">Superviseur</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">Département</label>
                <select value={form.departement} onChange={(e) => setForm({ ...form, departement: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">Sélectionner</option>
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
              <button onClick={ajouterUser} className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-green-700">Enregistrer</button>
              <button onClick={() => setShowForm(false)} className="bg-zinc-400 text-white px-6 py-2 rounded-lg text-sm">Annuler</button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Liste des utilisateurs ({users.length})</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-zinc-500">
                <th className="text-left py-2">Utilisateur</th>
                <th className="text-left py-2">Email</th>
                <th className="text-left py-2">Rôle</th>
                <th className="text-left py-2">Département</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-zinc-50">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-zinc-100 rounded-full flex items-center justify-center">
                        <span className="text-zinc-600 font-bold text-xs">{u.prenom[0]}{u.nom[0]}</span>
                      </div>
                      <p className="font-medium">{u.prenom} {u.nom}</p>
                    </div>
                  </td>
                  <td className="py-3 text-zinc-500">{u.email}</td>
                  <td className="py-3">
                    <Badge className={u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="py-3 text-zinc-500">{u.departement ?? '—'}</td>
                  <td className="py-3">
                    <button onClick={() => supprimerUser(u.id)} className="text-red-500 hover:text-red-700 text-xs border border-red-200 px-3 py-1 rounded hover:bg-red-50">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

    </div>
  )
}