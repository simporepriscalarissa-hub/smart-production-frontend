'use client'

import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Departement {
  id: number
  nom: string
  responsable: string
  nombreOuvriers: number
}

export default function Departements() {
  const [departements, setDepartements] = useState<Departement[]>([])
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ nom: '', responsable: '', nombreOuvriers: '' })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/departements`)
        setDepartements(res.data)
      } catch (err) {
        console.log('Erreur:', err)
      }
    }
    fetchData()
  }, [])

  const ajouterDepartement = async () => {
    try {
      await axios.post(`/departements`, {
        nom: form.nom,
        responsable: form.responsable,
        nombreOuvriers: parseInt(form.nombreOuvriers),
      })
      setMessage('Département ajouté !')
      setForm({ nom: '', responsable: '', nombreOuvriers: '' })
      setShowForm(false)
      const res = await axios.get(`/departements`)
      setDepartements(res.data)
    } catch (err) {
      console.log('Erreur:', err)
    }
  }

  const supprimerDepartement = async (id: number) => {
    if (confirm('Supprimer ce département ?')) {
      try {
        await axios.delete(`/departements/${id}`)
        setDepartements(departements.filter(d => d.id !== id))
      } catch (err) {
        console.log('Erreur:', err)
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800">Départements</h2>
          <p className="text-sm text-zinc-500">Gestion des départements de production</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm">
          + Ajouter un département
        </button>
      </div>

      {message && <div className="bg-green-100 text-green-700 p-4 rounded-lg text-sm">✅ {message}</div>}

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Nouveau département</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">Nom</label>
                <input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="ex: Coupe" />
              </div>
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">Responsable</label>
                <input type="text" value={form.responsable} onChange={(e) => setForm({ ...form, responsable: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nom du responsable" />
              </div>
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">Nombre d&apos;ouvriers</label>
                <input type="number" value={form.nombreOuvriers} onChange={(e) => setForm({ ...form, nombreOuvriers: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="0" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={ajouterDepartement} className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-green-700">Enregistrer</button>
              <button onClick={() => setShowForm(false)} className="bg-zinc-400 text-white px-6 py-2 rounded-lg text-sm">Annuler</button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        {departements.length === 0 ? (
          <p className="text-zinc-400 text-sm">Aucun département enregistré</p>
        ) : (
          departements.map((d) => (
            <Card key={d.id} className="shadow-none border border-zinc-100">
              <CardContent className="pt-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-zinc-800">{d.nom}</p>
                    <p className="text-xs text-zinc-400 mt-1">Responsable : {d.responsable}</p>
                    <p className="text-xs text-zinc-400">Ouvriers : {d.nombreOuvriers}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className="bg-green-100 text-green-700">Actif</Badge>
                    <button onClick={() => supprimerDepartement(d.id)} className="text-red-500 text-xs border border-red-200 px-3 py-1 rounded hover:bg-red-50">Supprimer</button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

    </div>
  )
}