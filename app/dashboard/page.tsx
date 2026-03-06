'use client'

import { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface OEE {
  oee: string
  qualite: string
  disponibilite: string
  performance: string
  totalProduit: number
  totalNonConforme: number
}

interface Production {
  id: number
  ouvrier: { prenom: string; nom: string }
  quantiteProduite: number
  quantiteConforme: number
  quantiteNonConforme: number
  reference: string
  createdAt: string
}

interface OuvrierStat {
  nom: string
  produit: number
  nonConforme: number
  taux: number
}

export default function Dashboard() {
  const [oee, setOee] = useState<OEE | null>(null)
  const [productions, setProductions] = useState<Production[]>([])
  const [top5, setTop5] = useState<OuvrierStat[]>([])
  const [moins5, setMoins5] = useState<OuvrierStat[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [oeeRes, prodRes] = await Promise.all([
          axios.get('/oee'),
          axios.get('/production'),
        ])
        setOee(oeeRes.data)
        const prods: Production[] = prodRes.data
        setProductions(prods)

        // Calcul stats par ouvrier
        const stats: Record<string, OuvrierStat> = {}
        prods.forEach((p) => {
          if (!p.ouvrier) return
          const nom = `${p.ouvrier.prenom} ${p.ouvrier.nom}`
          if (!stats[nom]) {
            stats[nom] = { nom, produit: 0, nonConforme: 0, taux: 0 }
          }
          stats[nom].produit += p.quantiteProduite
          stats[nom].nonConforme += p.quantiteNonConforme
        })

        Object.values(stats).forEach((s) => {
          s.taux = s.produit > 0 ? ((s.produit - s.nonConforme) / s.produit) * 100 : 0
        })

        const sorted = Object.values(stats).sort((a, b) => b.taux - a.taux)
        setTop5(sorted.slice(0, 5))
        setMoins5([...sorted].sort((a, b) => a.taux - b.taux).slice(0, 5))
      } catch (err) {
        console.log('Erreur:', err)
      }
    }
    fetchData()
  }, [])

  const dataProduction = productions.slice(0, 7).map((p) => ({
    nom: p.ouvrier ? `${p.ouvrier.prenom[0]}.${p.ouvrier.nom}` : '?',
    produit: p.quantiteProduite,
    conforme: p.quantiteConforme,
  }))

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h2 className="text-2xl font-bold text-zinc-800">Tableau de bord</h2>
        <p className="text-sm text-zinc-500">Vue d&apos;ensemble de la production</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="shadow-none border border-zinc-100">
          <CardContent className="pt-5 text-center">
            <p className="text-xs text-zinc-400 uppercase tracking-wide">OEE</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{oee?.oee ?? '—'}</p>
          </CardContent>
        </Card>
        <Card className="shadow-none border border-zinc-100">
          <CardContent className="pt-5 text-center">
            <p className="text-xs text-zinc-400 uppercase tracking-wide">Total produit</p>
            <p className="text-3xl font-bold text-zinc-800 mt-1">{oee?.totalProduit ?? '—'}</p>
          </CardContent>
        </Card>
        <Card className="shadow-none border border-zinc-100">
          <CardContent className="pt-5 text-center">
            <p className="text-xs text-zinc-400 uppercase tracking-wide">Qualité</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">{oee?.qualite ?? '—'}</p>
          </CardContent>
        </Card>
        <Card className="shadow-none border border-zinc-100">
          <CardContent className="pt-5 text-center">
            <p className="text-xs text-zinc-400 uppercase tracking-wide">Non conformes</p>
            <p className="text-3xl font-bold text-red-500 mt-1">{oee?.totalNonConforme ?? '—'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphique */}
      <Card className="shadow-none border border-zinc-100">
        <CardHeader>
          <CardTitle className="text-base">Productions récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {dataProduction.length === 0 ? (
            <p className="text-zinc-400 text-sm text-center py-8">Aucune production enregistrée</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dataProduction}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nom" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="produit" fill="#3b82f6" name="Total produit" radius={4} />
                <Bar dataKey="conforme" fill="#22c55e" name="Conformes" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* TOP 5 et moins performants */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-none border border-zinc-100">
          <CardHeader>
            <CardTitle className="text-base">🏆 Top 5 — Les plus performants</CardTitle>
          </CardHeader>
          <CardContent>
            {top5.length === 0 ? (
              <p className="text-zinc-400 text-sm text-center py-4">Aucune donnée</p>
            ) : (
              <div className="flex flex-col gap-3">
                {top5.map((o, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-400 text-sm w-5">{i + 1}</span>
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-bold">
                          {o.nom.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{o.nom}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">{o.taux.toFixed(1)}%</p>
                      <p className="text-xs text-zinc-400">{o.produit} prod.</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none border border-zinc-100">
          <CardHeader>
            <CardTitle className="text-base">⚠️ Les moins performants</CardTitle>
          </CardHeader>
          <CardContent>
            {moins5.length === 0 ? (
              <p className="text-zinc-400 text-sm text-center py-4">Aucune donnée</p>
            ) : (
              <div className="flex flex-col gap-3">
                {moins5.map((o, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 text-xs font-bold">
                          {o.nom.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{o.nom}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-500">{o.taux.toFixed(1)}%</p>
                      <p className="text-xs text-zinc-400">{o.nonConforme} NOK</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dernières productions */}
      <Card className="shadow-none border border-zinc-100">
        <CardHeader>
          <CardTitle className="text-base">Dernières productions</CardTitle>
        </CardHeader>
        <CardContent>
          {productions.length === 0 ? (
            <p className="text-zinc-400 text-sm text-center py-8">Aucune production enregistrée</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-zinc-400">
                  <th className="text-left py-2">Ouvrier</th>
                  <th className="text-left py-2">Référence</th>
                  <th className="text-left py-2">Total</th>
                  <th className="text-left py-2">Conformes</th>
                  <th className="text-left py-2">Non conformes</th>
                  <th className="text-left py-2">Heure</th>
                </tr>
              </thead>
              <tbody>
                {productions.slice(0, 10).map((p) => (
                  <tr key={p.id} className="border-b hover:bg-zinc-50">
                    <td className="py-3 font-medium">{p.ouvrier?.prenom} {p.ouvrier?.nom}</td>
                    <td className="py-3 text-zinc-500">{p.reference}</td>
                    <td className="py-3 font-bold">{p.quantiteProduite}</td>
                    <td className="py-3 text-emerald-600 font-bold">{p.quantiteConforme}</td>
                    <td className="py-3 text-red-500 font-bold">{p.quantiteNonConforme}</td>
                    <td className="py-3 text-zinc-400 text-xs">
                      {new Date(p.createdAt).toLocaleTimeString('fr-FR')}
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