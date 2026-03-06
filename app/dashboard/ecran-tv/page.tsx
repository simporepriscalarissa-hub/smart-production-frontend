'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart3,
  Factory,
  AlertTriangle,
  Users,
  Award,
  ThumbsUp,
  ThumbsDown,
  Bell,
  Monitor,
} from 'lucide-react'

type Widget = {
  id: number
  label: string
  description: string
  icon: React.ElementType
  categorie?: string
  taille?: 'full' | 'half'
}

const widgets: Widget[] = [
  { id: 1, label: 'Mini tableau de bord', description: 'Les statistiques généraux', icon: BarChart3, categorie: 'KPIs' },
  { id: 2, label: 'Production horaire totale', description: 'Taux de production horaire', icon: Factory, categorie: 'KPIs' },
  { id: 3, label: 'Taux de défauts', description: 'Pourcentage de défaut en production', icon: AlertTriangle, categorie: 'KPIs' },
  { id: 4, label: 'Détails production par ouvrier', description: 'Liste des ouvriers en production', icon: Users, categorie: 'KPIs' },
  { id: 5, label: 'Ouvrier du jour', description: 'Meilleure ouvrier en production', icon: Award, categorie: 'Classement' },
  { id: 6, label: 'Top 5 Ouvriers', description: 'Ouvriers les plus performants', icon: ThumbsUp, categorie: 'Classement' },
  { id: 7, label: 'Ouvriers les moins performants', description: 'Liste des ouvriers qui ont taux NOK élevées', icon: ThumbsDown, categorie: 'Classement' },
  { id: 8, label: 'Alertes qualité', description: 'Les importants messages concernant la production', icon: AlertTriangle, categorie: 'Alerts et activité' },
  { id: 9, label: 'Activité récente', description: 'Derniers activité à l’usine moins importants', icon: Bell, categorie: 'Alerts et activité' },
  { id: 10, label: 'Statut du poste de travail', description: 'Surveillance en temps réel de tous les postes de travail', icon: Monitor, categorie: 'Activité des postes en temps réel' },
]

const categories = [...new Set(widgets.map(w => w.categorie))]

export default function EcranTV() {
  const [selectionnes, setSelectionnes] = useState<Widget[]>([
    { id: 1, label: 'Mini tableau de bord', description: 'Les statistiques généraux', icon: BarChart3, taille: 'full' },
    { id: 2, label: 'Production horaire totale', description: 'Taux de production horaire', icon: Factory, taille: 'half' },
    { id: 3, label: 'Taux de défauts', description: 'Pourcentage de défaut en production', icon: AlertTriangle, taille: 'half' },
    { id: 5, label: 'Ouvrier du jour', description: 'Meilleure ouvrier en production', icon: Award, taille: 'half' },
    { id: 6, label: 'Top 5 Ouvriers', description: 'Ouvriers les plus performants', icon: ThumbsUp, taille: 'half' },
  ])

  const ajouterWidget = (widget: Widget) => {
    if (!selectionnes.find(w => w.id === widget.id)) {
      setSelectionnes([...selectionnes, { ...widget, taille: 'half' }])
    }
  }

  const retirerWidget = (id: number) => {
    setSelectionnes(selectionnes.filter(w => w.id !== id))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800">Configuration Ecran TV</h2>
          <p className="text-sm text-zinc-500">
            Personnalisez le contenu dynamique pour les écrans de télévision d&apos;usine
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="border border-zinc-300 text-zinc-600 px-4 py-2 rounded-lg text-sm hover:bg-zinc-50 flex items-center gap-2">
             Enregistrer la mise en page
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2">
             Diffuser à la télévision
          </button>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-zinc-500">Mode aperçu</span>
            <div className="w-10 h-5 bg-zinc-200 rounded-full cursor-pointer"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Bibliothèque de widgets */}
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bibliothèque de widgets</CardTitle>
              <p className="text-xs text-zinc-500">
                Cliquez sur un widget pour l’ajouter à la zone de travail
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {categories.map(categorie => (
                <div key={categorie}>
                  <p className="text-xs font-semibold text-zinc-600 mb-2">{categorie}</p>
                  <div className="flex flex-col gap-2">
                    {widgets
                      .filter(w => w.categorie === categorie)
                      .map(widget => (
                        <div
                          key={widget.id}
                          onClick={() => ajouterWidget(widget)}
                          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                            selectionnes.find(w => w.id === widget.id)
                              ? 'border-blue-400 bg-blue-50'
                              : 'hover:bg-zinc-50'
                          }`}
                        >
                          <widget.icon className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-zinc-700">{widget.label}</p>
                            <p className="text-xs text-zinc-400">{widget.description}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Disposition écran TV */}
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Disposition de l&apos;écran de télévision</CardTitle>
              <p className="text-xs text-zinc-500">
                Disposez les widgets pour créer l&apos;affichage souhaité
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {/* Widget pleine largeur */}
              {selectionnes.filter(w => w.taille === 'full').map(widget => (
                <div key={widget.id} className="border rounded-lg p-4 relative bg-zinc-50">
                  <button
                    onClick={() => retirerWidget(widget.id)}
                    className="absolute top-2 right-2 text-zinc-400 hover:text-red-500 text-xs"
                  >
                    ✕
                  </button>
                  <div className="flex items-center gap-2 justify-center py-4">
                    <widget.icon className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-zinc-700">{widget.label}</p>
                      <p className="text-zinc-400 text-xs">{widget.description}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Widgets demi largeur */}
              <div className="grid grid-cols-2 gap-3">
                {selectionnes.filter(w => w.taille === 'half').map(widget => (
                  <div key={widget.id} className="border rounded-lg p-4 relative bg-zinc-50 min-h-24">
                    <button
                      onClick={() => retirerWidget(widget.id)}
                      className="absolute top-2 right-2 text-zinc-400 hover:text-red-500 text-xs"
                    >
                      ✕
                    </button>
                    <div className="flex flex-col gap-1 mt-4">
                      <widget.icon className="w-6 h-6 text-blue-600" />
                      <p className="font-medium text-zinc-700 text-sm">{widget.label}</p>
                      <p className="text-zinc-400 text-xs">{widget.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Activer deuxième affichage */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div>
                  <p className="text-sm font-medium text-zinc-700">Afficher sur un deuxième écran</p>
                  <p className="text-xs text-zinc-500">Affichez une version simplifiée pour les écrans de télévision d’usine</p>
                </div>
                <button className="border border-zinc-300 text-zinc-600 px-4 py-2 rounded-lg text-sm hover:bg-zinc-50 flex items-center gap-2">
                   Activer le mode TV
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    )
}