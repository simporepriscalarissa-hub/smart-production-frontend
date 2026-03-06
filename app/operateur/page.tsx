'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Production {
  id: number
  reference: string
  quantiteProduite: number
  quantiteConforme: number
  quantiteNonConforme: number
  createdAt: string
}

interface User {
  id: number
  nom: string
  prenom: string
  role: string
  rfid: string
}

export default function Operateur() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [productions, setProductions] = useState<Production[]>([])

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (!userData || !token || userData === 'undefined') {
      router.push('/rfid-login')
      return
    }

    try {
      const parsed: User = JSON.parse(userData)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(parsed)

      axios
        .get(`/production?ouvrierId=${parsed.id}`)
        .then((res) => setProductions(res.data))
        .catch((err) => console.log('Erreur:', err))
    } catch (err) {
      console.log('Erreur:', err)
      router.push('/rfid-login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.clear()
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    router.push('/rfid-login')
  }

  const totalProduit = productions.reduce((acc, p) => acc + p.quantiteProduite, 0)
  const totalConforme = productions.reduce((acc, p) => acc + p.quantiteConforme, 0)
  const totalNonConforme = productions.reduce((acc, p) => acc + p.quantiteNonConforme, 0)
  const tauxQualite = totalProduit > 0 ? ((totalConforme / totalProduit) * 100).toFixed(1) : '0'

  if (!user) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-zinc-500">Chargement...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">

        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">{user.prenom[0]}{user.nom[0]}</span>
            </div>
            <div>
              <p className="font-semibold text-zinc-800">Bonjour, {user.prenom} {user.nom}</p>
              <p className="text-xs text-zinc-400">Opérateur — {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-red-500 text-sm border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50">
            Déconnexion
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card className="shadow-none border border-zinc-100">
            <CardContent className="pt-5 text-center">
              <p className="text-xs text-zinc-400 uppercase tracking-wide">Total produit</p>
              <p className="text-3xl font-bold text-zinc-800 mt-1">{totalProduit}</p>
            </CardContent>
          </Card>
          <Card className="shadow-none border border-zinc-100">
            <CardContent className="pt-5 text-center">
              <p className="text-xs text-zinc-400 uppercase tracking-wide">Conformes</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{totalConforme}</p>
            </CardContent>
          </Card>
          <Card className="shadow-none border border-zinc-100">
            <CardContent className="pt-5 text-center">
              <p className="text-xs text-zinc-400 uppercase tracking-wide">Non conformes</p>
              <p className="text-3xl font-bold text-red-500 mt-1">{totalNonConforme}</p>
            </CardContent>
          </Card>
          <Card className="shadow-none border border-zinc-100">
            <CardContent className="pt-5 text-center">
              <p className="text-xs text-zinc-400 uppercase tracking-wide">Taux qualité</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{tauxQualite}%</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-none border border-zinc-100">
          <CardHeader>
            <CardTitle className="text-base">Ma production du jour</CardTitle>
          </CardHeader>
          <CardContent>
            {productions.length === 0 ? (
              <p className="text-zinc-400 text-sm text-center py-8">Aucune production enregistrée aujourd&apos;hui</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-zinc-400">
                    <th className="text-left py-2">Référence</th>
                    <th className="text-left py-2">Total</th>
                    <th className="text-left py-2">Conformes</th>
                    <th className="text-left py-2">Non conformes</th>
                    <th className="text-left py-2">État</th>
                    <th className="text-left py-2">Heure</th>
                  </tr>
                </thead>
                <tbody>
                  {productions.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-zinc-50">
                      <td className="py-3 font-medium">{p.reference}</td>
                      <td className="py-3">{p.quantiteProduite}</td>
                      <td className="py-3 text-emerald-600 font-medium">{p.quantiteConforme}</td>
                      <td className="py-3 text-red-500 font-medium">{p.quantiteNonConforme}</td>
                      <td className="py-3">
                        {p.quantiteNonConforme === 0
                          ? <span className="text-emerald-600 font-semibold text-xs">OK</span>
                          : <span className="text-red-500 font-semibold text-xs">NOK</span>
                        }
                      </td>
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
    </div>
  )
}