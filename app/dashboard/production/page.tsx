'use client'

import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { APP_CONFIG } from '@/lib/config'

interface Production {
  id: number
  ouvrier: { prenom: string; nom: string }
  reference: string
  quantiteProduite: number
  quantiteConforme: number
  quantiteNonConforme: number
  createdAt: string
}

interface Ouvrier {
  id: number
  nom: string
  prenom: string
}

export default function Production() {
  const [productions, setProductions] = useState<Production[]>([])
  const [ouvriers, setOuvriers] = useState<Ouvrier[]>([])
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    ouvrierId: '',
    reference: '',
    quantiteProduite: '',
    quantiteConforme: '',
    quantiteNonConforme: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, ouvrierRes] = await Promise.all([
          axios.get(`/production`),
          axios.get(`/ouvriers`),
        ])
        setProductions(prodRes.data)
        setOuvriers(ouvrierRes.data)
      } catch (err) {
        console.log('Erreur:', err)
      }
    }
    fetchData()
  }, [])

  const ajouterProduction = async () => {
    try {
      await axios.post(`/production`, {
        ouvrierId: parseInt(form.ouvrierId),
        reference: form.reference,
        quantiteProduite: parseInt(form.quantiteProduite),
        quantiteConforme: parseInt(form.quantiteConforme),
        quantiteNonConforme: parseInt(form.quantiteNonConforme),
      })
      setMessage('Production ajoutée !')
      setShowForm(false)
      setForm({ ouvrierId: '', reference: '', quantiteProduite: '', quantiteConforme: '', quantiteNonConforme: '' })
      const res = await axios.get(`/production`)
      setProductions(res.data)
    } catch (err) {
      console.log('Erreur:', err)
    }
  }

  const supprimerProduction = async (id: number) => {
    if (confirm('Supprimer cette production ?')) {
      try {
        await axios.delete(`/production/${id}`)
        setProductions(productions.filter(p => p.id !== id))
      } catch (err) {
        console.log('Erreur:', err)
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800">Entrée en Production</h2>
          <p className="text-sm text-zinc-500">Gestion des productions par ouvrier</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm">
          + Ajouter une production
        </button>
      </div>

      {message && (
        <div className="bg-green-100 text-green-700 p-4 rounded-lg text-sm">✅ {message}</div>
      )}

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Nouvelle production</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">Ouvrier</label>
                <select value={form.ouvrierId} onChange={(e) => setForm({ ...form, ouvrierId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">Sélectionner un ouvrier</option>
                  {ouvriers.map((o) => (
                    <option key={o.id} value={o.id}>{o.prenom} {o.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">Référence produit</label>
                <input type="text" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="ex: JEAN-001" />
              </div>
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">Quantité produite</label>
                <input type="number" value={form.quantiteProduite} onChange={(e) => setForm({ ...form, quantiteProduite: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="0" />
              </div>
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">Quantité conforme</label>
                <input type="number" value={form.quantiteConforme} onChange={(e) => setForm({ ...form, quantiteConforme: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="0" />
              </div>
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">Quantité non conforme</label>
                <input type="number" value={form.quantiteNonConforme} onChange={(e) => setForm({ ...form, quantiteNonConforme: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="0" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={ajouterProduction} className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-green-700">Enregistrer</button>
              <button onClick={() => setShowForm(false)} className="bg-zinc-400 text-white px-6 py-2 rounded-lg text-sm">Annuler</button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Liste des productions</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-zinc-500">
                <th className="text-left py-2">Ouvrier</th>
                <th className="text-left py-2">Référence</th>
                <th className="text-left py-2">Total</th>
                <th className="text-left py-2">Conformes</th>
                <th className="text-left py-2">Non Conformes</th>
                <th className="text-left py-2">État</th>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productions.map((p) => (
                <tr key={p.id} className="border-b hover:bg-zinc-50">
                  <td className="py-3 font-medium">{p.ouvrier?.prenom} {p.ouvrier?.nom}</td>
                  <td className="py-3 text-zinc-500">{p.reference}</td>
                  <td className="py-3 font-bold">{p.quantiteProduite}</td>
                  <td className="py-3 text-green-600 font-bold">{p.quantiteConforme}</td>
                  <td className="py-3 text-red-500 font-bold">{p.quantiteNonConforme}</td>
                  <td className="py-3">
                    {p.quantiteNonConforme === 0
                      ? <Badge className="bg-green-100 text-green-700">OK</Badge>
                      : <Badge className="bg-red-100 text-red-700">NOK</Badge>
                    }
                  </td>
                  <td className="py-3 text-zinc-500">{new Date(p.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3">
                    <button onClick={() => supprimerProduction(p.id)} className="text-red-500 hover:text-red-700 text-xs border border-red-200 px-3 py-1 rounded hover:bg-red-50">Supprimer</button>
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