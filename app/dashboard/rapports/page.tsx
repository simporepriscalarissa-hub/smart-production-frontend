'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import axios from '@/lib/axios'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, Activity, CheckCircle, Gauge } from 'lucide-react'

interface OEE {
  oee: string
  qualite: string
  disponibilite: string
  performance: string
  totalProduit: number
  totalConforme: number
  totalNonConforme: number
}

interface Production {
  id: number
  ouvrier: { prenom: string; nom: string }
  quantiteProduite: number
  quantiteConforme: number
}

interface OuvrierStat {
  name: string
  produit: number
  conforme: number
}

export default function Rapports() {
  const [oee, setOee] = useState<OEE | null>(null)
  const [productions, setProductions] = useState<Production[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [oeeRes, prodRes] = await Promise.all([
          axios.get('/oee'),
          axios.get('/production'),
        ])
        setOee(oeeRes.data)
        setProductions(prodRes.data)
      } catch (err) {
        console.log('Erreur:', err)
      }
    }
    fetchData()
  }, [])

  const dataProduction = [
    { jour: 'Lun', produit: 120, conforme: 110 },
    { jour: 'Mar', produit: 180, conforme: 165 },
    { jour: 'Mer', produit: 150, conforme: 140 },
    { jour: 'Jeu', produit: 200, conforme: 190 },
    { jour: 'Ven', produit: 170, conforme: 155 },
  ]

  const dataOEE = [
    { jour: 'Lun', oee: 68 },
    { jour: 'Mar', oee: 72 },
    { jour: 'Mer', oee: 65 },
    { jour: 'Jeu', oee: 75 },
    { jour: 'Ven', oee: 70 },
  ]

  const dataOuvriers = productions.reduce((acc: OuvrierStat[], p: Production) => {
    if (!p.ouvrier) return acc
    const nom = `${p.ouvrier.prenom} ${p.ouvrier.nom}`
    const existing = acc.find(a => a.name === nom)
    if (existing) {
      existing.produit += p.quantiteProduite
      existing.conforme += p.quantiteConforme
    } else {
      acc.push({ name: nom, produit: p.quantiteProduite, conforme: p.quantiteConforme })
    }
    return acc
  }, [])

  const kpis = [
    { label: 'OEE Global', value: oee?.oee ?? '—', icon: TrendingUp, color: 'blue', bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
    { label: 'Disponibilité', value: oee?.disponibilite ?? '—', icon: Activity, color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    { label: 'Performance', value: oee?.performance ?? '—', icon: Gauge, color: 'yellow', bg: 'bg-yellow-50', text: 'text-yellow-700', iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
    { label: 'Qualité', value: oee?.qualite ?? '—', icon: CheckCircle, color: 'purple', bg: 'bg-purple-50', text: 'text-purple-700', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  ]

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-zinc-800">Rapports</h2>
        <p className="text-sm text-zinc-500">Analyse des performances de production</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, bg, text, iconBg, iconColor }) => (
          <Card key={label} className={`border-0 shadow-sm ${bg}`}>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <p className={`text-xs uppercase tracking-wide font-semibold ${text} opacity-70`}>{label}</p>
                <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center`}>
                  <Icon size={18} className={iconColor} />
                </div>
              </div>
              <p className={`text-3xl font-bold ${text}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-sm border border-zinc-100">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-blue-600" />
              <CardTitle className="text-base">Production par jour</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dataProduction}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="jour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="produit" fill="#3b82f6" name="Total produit" radius={4} />
                <Bar dataKey="conforme" fill="#22c55e" name="Conformes" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-zinc-100">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" />
              <CardTitle className="text-base">Évolution OEE</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dataOEE}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="jour" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="oee" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} name="OEE %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tableau performance */}
      <Card className="shadow-sm border border-zinc-100">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-zinc-600" />
            <CardTitle className="text-base">Performance par ouvrier</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {dataOuvriers.length === 0 ? (
            <p className="text-zinc-400 text-sm text-center py-8">Aucune donnée disponible</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-zinc-400">
                  <th className="text-left py-3 font-medium">Ouvrier</th>
                  <th className="text-left py-3 font-medium">Total Produit</th>
                  <th className="text-left py-3 font-medium">Conformes</th>
                  <th className="text-left py-3 font-medium">Non Conformes</th>
                  <th className="text-left py-3 font-medium">Taux Qualité</th>
                </tr>
              </thead>
              <tbody>
                {dataOuvriers.map((o, index) => {
                  const taux = o.produit > 0 ? (o.conforme / o.produit) * 100 : 0
                  return (
                    <tr key={index} className="border-b hover:bg-zinc-50 transition-colors">
                      <td className="py-3 font-medium">{o.name}</td>
                      <td className="py-3 font-bold">{o.produit}</td>
                      <td className="py-3 text-emerald-600 font-bold">{o.conforme}</td>
                      <td className="py-3 text-red-500 font-bold">{o.produit - o.conforme}</td>
                      <td className="py-3">
                        <Badge className={
                          taux >= 90 ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' :
                          taux >= 70 ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' :
                          'bg-red-100 text-red-700 hover:bg-red-100'
                        }>
                          {taux.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

    </div>
  )
}