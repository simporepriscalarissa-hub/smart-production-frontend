'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import axios from '@/lib/axios'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

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
          axios.get(`/oee`),
          axios.get(`/production`),
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
    const nom = `${p.ouvrier?.prenom} ${p.ouvrier?.nom}`
    const existing = acc.find((a: OuvrierStat) => a.name === nom)
    if (existing) {
      existing.produit += p.quantiteProduite
      existing.conforme += p.quantiteConforme
    } else {
      acc.push({ name: nom, produit: p.quantiteProduite, conforme: p.quantiteConforme })
    }
    return acc
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-800">Rapports</h2>
        <p className="text-sm text-zinc-500">Analyse des performances de production</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-zinc-500">OEE Moyen</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-blue-600">{oee?.oee ?? '70%'}</p></CardContent>
        </Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-zinc-500">Disponibilité</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-600">{oee?.disponibilite ?? '85%'}</p></CardContent>
        </Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-zinc-500">Performance</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-yellow-600">{oee?.performance ?? '90%'}</p></CardContent>
        </Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-zinc-500">Qualité</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-purple-600">{oee?.qualite ?? '92%'}</p></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Production par jour</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dataProduction}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="jour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip /><Legend />
                <Bar dataKey="produit" fill="#3b82f6" name="Total produit" radius={4} />
                <Bar dataKey="conforme" fill="#22c55e" name="Conformes" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Evolution OEE</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dataOEE}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="jour" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="oee" stroke="#3b82f6" strokeWidth={2} name="OEE %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Performance par ouvrier</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-zinc-500">
                <th className="text-left py-2">Ouvrier</th>
                <th className="text-left py-2">Total Produit</th>
                <th className="text-left py-2">Conformes</th>
                <th className="text-left py-2">Non Conformes</th>
                <th className="text-left py-2">Taux Qualité</th>
              </tr>
            </thead>
            <tbody>
              {dataOuvriers.map((o: OuvrierStat, index: number) => (
                <tr key={index} className="border-b hover:bg-zinc-50">
                  <td className="py-3 font-medium">{o.name}</td>
                  <td className="py-3">{o.produit}</td>
                  <td className="py-3 text-green-600 font-bold">{o.conforme}</td>
                  <td className="py-3 text-red-500 font-bold">{o.produit - o.conforme}</td>
                  <td className="py-3">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                      {((o.conforme / o.produit) * 100).toFixed(1)}%
                    </span>
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