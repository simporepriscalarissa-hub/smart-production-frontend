'use client'

import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Package, CheckCircle, XCircle, ClipboardList } from 'lucide-react'

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
          axios.get('/production'),
          axios.get('/ouvriers'),
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
      await axios.post('/production', {
        ouvrierId: parseInt(form.ouvrierId),
        reference: form.reference,
        quantiteProduite: parseInt(form.quantiteProduite),
        quantiteConforme: parseInt(form.quantiteConforme),
        quantiteNonConforme: parseInt(form.quantiteNonConforme),
      })
      setMessage('Production ajoutée avec succès !')
      setShowForm(false)
      setForm({ ouvrierId: '', reference: '', quantiteProduite: '', quantiteConforme: '', quantiteNonConforme: '' })
      const res = await axios.get('/production')
      setProductions(res.data)
      setTimeout(() => setMessage(''), 3000)
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

  const totalProduit = productions.reduce((acc, p) => acc + p.quantiteProduite, 0)
  const totalConforme = productions.reduce((acc, p) => acc + p.quantiteConforme, 0)
  const totalNonConforme = productions.reduce((acc, p) => acc + p.quantiteNonConforme, 0)

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800">Entrée en Production</h2>
          <p className="text-sm text-zinc-500">Gestion des productions par ouvrier</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Ajouter une production
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-zinc-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Total produit</p>
                <p className="text-3xl font-bold text-zinc-800 mt-1">{totalProduit}</p>
              </div>
              <div className="w-10 h-10 bg-zinc-200 rounded-xl flex items-center justify-center">
                <Package size={20} className="text-zinc-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-emerald-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-500 uppercase tracking-wide font-semibold">Conformes</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">{totalConforme}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle size={20} className="text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-red-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-500 uppercase tracking-wide font-semibold">Non conformes</p>
                <p className="text-3xl font-bold text-red-700 mt-1">{totalNonConforme}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle size={20} className="text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message */}
      {message && (
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-4 rounded-xl text-sm flex items-center gap-2">
          <span>✅</span> {message}
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <Card className="border border-blue-100 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Plus size={18} className="text-blue-600" />
              <CardTitle className="text-base">Nouvelle production</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm text-zinc-600 mb-1.5 block font-medium">Ouvrier</label>
                <select
                  value={form.ouvrierId}
                  onChange={(e) => setForm({ ...form, ouvrierId: e.target.value })}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un ouvrier</option>
                  {ouvriers.map((o) => (
                    <option key={o.id} value={o.id}>{o.prenom} {o.nom}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-zinc-600 mb-1.5 block font-medium">Référence produit</label>
                <input
                  type="text"
                  value={form.reference}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  placeholder="ex: JEAN-001"
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {[
                { label: 'Quantité produite', key: 'quantiteProduite' },
                { label: 'Quantité conforme', key: 'quantiteConforme' },
                { label: 'Quantité non conforme', key: 'quantiteNonConforme' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="text-sm text-zinc-600 mb-1.5 block font-medium">{label}</label>
                  <input
                    type="number"
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder="0"
                    min="0"
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={ajouterProduction} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-emerald-700 font-medium transition-colors">
                Enregistrer
              </button>
              <button onClick={() => setShowForm(false)} className="bg-zinc-100 text-zinc-600 px-6 py-2.5 rounded-xl text-sm hover:bg-zinc-200 font-medium transition-colors">
                Annuler
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tableau */}
      <Card className="shadow-sm border border-zinc-100">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-zinc-600" />
            <CardTitle className="text-base">Liste des productions ({productions.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {productions.length === 0 ? (
            <p className="text-zinc-400 text-sm text-center py-8">Aucune production enregistrée</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-zinc-400">
                  <th className="text-left py-3 font-medium">Ouvrier</th>
                  <th className="text-left py-3 font-medium">Référence</th>
                  <th className="text-left py-3 font-medium">Total</th>
                  <th className="text-left py-3 font-medium">Conformes</th>
                  <th className="text-left py-3 font-medium">Non Conformes</th>
                  <th className="text-left py-3 font-medium">État</th>
                  <th className="text-left py-3 font-medium">Date</th>
                  <th className="text-left py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {productions.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-zinc-50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center">
                          <span className="text-zinc-600 text-xs font-bold">
                            {p.ouvrier?.prenom?.[0]}{p.ouvrier?.nom?.[0]}
                          </span>
                        </div>
                        <span className="font-medium">{p.ouvrier?.prenom} {p.ouvrier?.nom}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 font-normal">
                        {p.reference}
                      </Badge>
                    </td>
                    <td className="py-3 font-bold">{p.quantiteProduite}</td>
                    <td className="py-3 text-emerald-600 font-bold">{p.quantiteConforme}</td>
                    <td className="py-3">
                      <span className={p.quantiteNonConforme > 0 ? 'text-red-500 font-bold' : 'text-zinc-400'}>
                        {p.quantiteNonConforme}
                      </span>
                    </td>
                    <td className="py-3">
                      {p.quantiteNonConforme === 0
                        ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">✅ OK</Badge>
                        : <Badge className="bg-red-100 text-red-700 hover:bg-red-100">❌ NOK</Badge>
                      }
                    </td>
                    <td className="py-3 text-zinc-400 text-xs">
                      {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => supprimerProduction(p.id)}
                        className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-xs border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={12} />
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

    </div>
  )
}