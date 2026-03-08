'use client'

import { useEffect, useState } from 'react'
import axios from '@/lib/axios'

interface OEE {
  oee: string
  qualite: string
  totalProduit: number
  totalNonConforme: number
}

interface Production {
  id: number
  ouvrier: { prenom: string; nom: string; departement: string }
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
  departement: string
}

export default function EcranTV() {
  const [oee, setOee] = useState<OEE | null>(null)
  const [top5, setTop5] = useState<OuvrierStat[]>([])
  const [productions, setProductions] = useState<Production[]>([])
  const [heure, setHeure] = useState('')
  const [date, setDate] = useState('')

  const fetchData = async () => {
    try {
      const [oeeRes, prodRes] = await Promise.all([
        axios.get('/oee'),
        axios.get('/production'),
      ])
      setOee(oeeRes.data)
      const prods: Production[] = prodRes.data

      setProductions(prods.slice(0, 6))

      const stats: Record<string, OuvrierStat> = {}
      prods.forEach((p) => {
        if (!p.ouvrier) return
        const nom = `${p.ouvrier.prenom} ${p.ouvrier.nom}`
        if (!stats[nom]) {
          stats[nom] = { nom, produit: 0, nonConforme: 0, taux: 0, departement: p.ouvrier.departement }
        }
        stats[nom].produit += p.quantiteProduite
        stats[nom].nonConforme += p.quantiteNonConforme
      })

      Object.values(stats).forEach((s) => {
        s.taux = s.produit > 0 ? ((s.produit - s.nonConforme) / s.produit) * 100 : 0
      })

      const sorted = Object.values(stats).sort((a, b) => b.taux - a.taux)
      setTop5(sorted.slice(0, 5))
    } catch (err) {
      console.log('Erreur:', err)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
    const dataInterval = setInterval(fetchData, 30000)

    const heureInterval = setInterval(() => {
      const now = new Date()
      setHeure(now.toLocaleTimeString('fr-FR'))
      setDate(now.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }))
    }, 1000)

    return () => {
      clearInterval(dataInterval)
      clearInterval(heureInterval)
    }
  }, [])

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6 flex flex-col gap-6">

      {/* Header */}
      <div className="flex justify-between items-center bg-zinc-800 rounded-2xl px-8 py-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <div>
            <p className="text-xl font-bold text-white">Smart Production Counter</p>
            <p className="text-sm text-zinc-400">Surveillance en temps réel</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-mono font-bold text-blue-400">{heure}</p>
          <p className="text-sm text-zinc-400 capitalize">{date}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-zinc-800 rounded-2xl p-6 text-center border border-zinc-700">
          <p className="text-zinc-400 text-sm uppercase tracking-widest mb-2">OEE Global</p>
          <p className="text-5xl font-bold text-blue-400">{oee?.oee ?? '—'}</p>
        </div>
        <div className="bg-zinc-800 rounded-2xl p-6 text-center border border-zinc-700">
          <p className="text-zinc-400 text-sm uppercase tracking-widest mb-2">Total Produit</p>
          <p className="text-5xl font-bold text-white">{oee?.totalProduit ?? '—'}</p>
        </div>
        <div className="bg-zinc-800 rounded-2xl p-6 text-center border border-zinc-700">
          <p className="text-zinc-400 text-sm uppercase tracking-widest mb-2">Qualité</p>
          <p className="text-5xl font-bold text-emerald-400">{oee?.qualite ?? '—'}</p>
        </div>
        <div className="bg-zinc-800 rounded-2xl p-6 text-center border border-zinc-700">
          <p className="text-zinc-400 text-sm uppercase tracking-widest mb-2">Non Conformes</p>
          <p className="text-5xl font-bold text-red-400">{oee?.totalNonConforme ?? '—'}</p>
        </div>
      </div>

      {/* TOP 5 + Productions récentes */}
      <div className="grid grid-cols-2 gap-4 flex-1">

        {/* TOP 5 */}
        <div className="bg-zinc-800 rounded-2xl p-6 border border-zinc-700">
          <p className="text-lg font-bold text-yellow-400 mb-4">🏆 TOP 5 — Les plus performants</p>
          <div className="flex flex-col gap-3">
            {top5.map((o, i) => (
              <div key={i} className="flex items-center justify-between bg-zinc-700 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-zinc-300' : i === 2 ? 'text-orange-400' : 'text-zinc-500'}`}>
                    #{i + 1}
                  </span>
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {o.nom.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{o.nom}</p>
                    <p className="text-xs text-zinc-400">{o.departement}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-emerald-400">{o.taux.toFixed(1)}%</p>
                  <p className="text-xs text-zinc-400">{o.produit} prod.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Productions récentes */}
        <div className="bg-zinc-800 rounded-2xl p-6 border border-zinc-700">
          <p className="text-lg font-bold text-blue-400 mb-4">⚡ Productions récentes</p>
          <div className="flex flex-col gap-3">
            {productions.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-zinc-700 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-600 rounded-full flex items-center justify-center">
                    <span className="text-zinc-300 text-xs font-bold">
                      {p.ouvrier?.prenom?.[0]}{p.ouvrier?.nom?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{p.ouvrier?.prenom} {p.ouvrier?.nom}</p>
                    <p className="text-xs text-zinc-400">{p.reference}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{p.quantiteProduite} pcs</p>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.quantiteNonConforme === 0 ? 'bg-emerald-900 text-emerald-400' : 'bg-red-900 text-red-400'}`}>
                    {p.quantiteNonConforme === 0 ? '✅ OK' : `❌ ${p.quantiteNonConforme} NOK`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="bg-zinc-800 rounded-2xl px-8 py-3 flex justify-between items-center border border-zinc-700">
        <p className="text-zinc-500 text-sm">Données actualisées toutes les 30 secondes</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <p className="text-emerald-400 text-sm font-medium">Système actif</p>
        </div>
      </div>

    </div>
  )
}