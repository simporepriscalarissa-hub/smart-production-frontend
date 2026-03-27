'use client'

import { useEffect, useState, useRef } from 'react'
import axios from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Download, TrendingUp, Package, CheckCircle, XCircle, FileText } from 'lucide-react'

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

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b']

export default function Rapports() {
  const [oee, setOee] = useState<OEE | null>(null)
  const [productions, setProductions] = useState<Production[]>([])
  const [loading, setLoading] = useState(true)
  const [exportDate, setExportDate] = useState<string | null>(null)
  const reportRef = useRef<HTMLDivElement>(null)

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
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const exportPDF = async () => {
    if (typeof window === 'undefined') return
    const element = reportRef.current
    if (!element) return

    setExportDate(
      `${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`
    )

    // Délai pour que le DOM se mette à jour avant la capture
    await new Promise(resolve => setTimeout(resolve, 100))

    const html2pdf = (await import('html2pdf.js')).default

    const opt = {
      margin: 1,
      filename: `rapport-production-${new Date().toLocaleDateString('fr-FR')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'cm' as const, format: 'a4', orientation: 'portrait' as const }
    }

    html2pdf().set(opt).from(element).save()

    // Réinitialiser la date après export
    setTimeout(() => setExportDate(null), 500)
  }

  const dataProduction = productions.slice(0, 10).map(p => ({
    nom: p.ouvrier ? `${p.ouvrier.prenom[0]}.${p.ouvrier.nom}` : '?',
    produit: p.quantiteProduite,
    conforme: p.quantiteConforme,
    nonConforme: p.quantiteNonConforme,
  }))

  const dataQualite = [
    { name: 'Conformes', value: productions.reduce((s, p) => s + p.quantiteConforme, 0) },
    { name: 'Non conformes', value: productions.reduce((s, p) => s + p.quantiteNonConforme, 0) },
  ]

  const dataOEE = [
    { name: 'Disponibilité', value: parseFloat(oee?.disponibilite ?? '0') },
    { name: 'Performance', value: parseFloat(oee?.performance ?? '0') },
    { name: 'Qualité', value: parseFloat(oee?.qualite ?? '0') },
    { name: 'OEE Global', value: parseFloat(oee?.oee ?? '0') },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800">Rapports de production</h2>
          <p className="text-sm text-zinc-500">
            Analyse complète — {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>
        <button
          onClick={exportPDF}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Download size={16} />
          Exporter en PDF
        </button>
      </div>

      {/* Contenu exportable */}
      <div ref={reportRef} className="flex flex-col gap-6">

        {/* En-tête rapport */}
        <div className="bg-blue-600 text-white p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <FileText size={24} />
            <h3 className="text-xl font-bold">Rapport de Production — Smart Production Counter</h3>
          </div>
          {exportDate && (
            <p className="text-blue-100 text-sm">
              Généré le {exportDate}
            </p>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm bg-blue-50">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-blue-500 uppercase tracking-wide font-semibold">OEE Global</p>
                <TrendingUp size={18} className="text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-700">{oee?.oee ?? '—'}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-zinc-50">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Total produit</p>
                <Package size={18} className="text-zinc-600" />
              </div>
              <p className="text-3xl font-bold text-zinc-800">{oee?.totalProduit ?? '—'}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-emerald-50">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-emerald-500 uppercase tracking-wide font-semibold">Qualité</p>
                <CheckCircle size={18} className="text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-emerald-700">{oee?.qualite ?? '—'}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-red-50">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-red-500 uppercase tracking-wide font-semibold">Non conformes</p>
                <XCircle size={18} className="text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-600">{oee?.totalNonConforme ?? '—'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-2 gap-6">

          {/* Graphique OEE */}
          <Card className="shadow-sm border border-zinc-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Indicateurs OEE</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dataOEE}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="value" fill="#3b82f6" radius={4} name="Valeur %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Graphique qualité */}
          <Card className="shadow-sm border border-zinc-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Répartition qualité</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={dataQualite}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {dataQualite.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Graphique productions */}
          <Card className="shadow-sm border border-zinc-100 col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Productions par ouvrier</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dataProduction}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                  <XAxis dataKey="nom" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="produit" fill="#3b82f6" name="Total" radius={4} />
                  <Bar dataKey="conforme" fill="#22c55e" name="Conformes" radius={4} />
                  <Bar dataKey="nonConforme" fill="#ef4444" name="Non conformes" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tableau détaillé */}
        <Card className="shadow-sm border border-zinc-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Détail des productions</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-zinc-400">
                  <th className="text-left py-2 font-medium">Ouvrier</th>
                  <th className="text-left py-2 font-medium">Référence</th>
                  <th className="text-left py-2 font-medium">Total</th>
                  <th className="text-left py-2 font-medium">Conformes</th>
                  <th className="text-left py-2 font-medium">Non conformes</th>
                  <th className="text-left py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {productions.slice(0, 15).map(p => (
                  <tr key={p.id} className="border-b hover:bg-zinc-50">
                    <td className="py-2 font-medium">{p.ouvrier?.prenom} {p.ouvrier?.nom}</td>
                    <td className="py-2">
                      <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50">
                        {p.reference}
                      </Badge>
                    </td>
                    <td className="py-2 font-bold">{p.quantiteProduite}</td>
                    <td className="py-2 text-emerald-600 font-bold">{p.quantiteConforme}</td>
                    <td className="py-2">
                      <span className={p.quantiteNonConforme > 0 ? 'text-red-500 font-bold' : 'text-zinc-400'}>
                        {p.quantiteNonConforme}
                      </span>
                    </td>
                    <td className="py-2 text-zinc-400 text-xs">
                      {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}