'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { APP_CONFIG } from '@/lib/config'
import { Settings, Save, Monitor, RefreshCw, Building2, CheckCircle } from 'lucide-react'

export default function Parametres() {
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    entreprise: APP_CONFIG.entreprise,
    apiUrl: APP_CONFIG.apiUrl,
    unite: APP_CONFIG.unite,
  })
  const [tvConfig, setTvConfig] = useState({
    refresh: '30',
    departement: 'Tous',
    afficherTop5: true,
    afficherKPIs: true,
    afficherProductions: true,
    afficherOEE: true,
  })

  useEffect(() => {
    const saved = localStorage.getItem('tvConfig')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setTvConfig(JSON.parse(saved))
  }, [])

  const sauvegarder = () => {
    localStorage.setItem('parametres', JSON.stringify(form))
    setMessage('Paramètres sauvegardés !')
    setTimeout(() => setMessage(''), 3000)
  }

  const sauvegarderTV = () => {
    localStorage.setItem('tvConfig', JSON.stringify(tvConfig))
    setMessage('Configuration écran TV sauvegardée !')
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800">Paramètres</h2>
          <p className="text-sm text-zinc-500">Configuration du système</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-4 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          {message}
        </div>
      )}

      {/* Informations générales */}
      <Card className="shadow-sm border border-zinc-100">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-zinc-600" />
            <CardTitle className="text-base">Informations générales</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-600 mb-1.5 block font-medium">Nom de l&apos;entreprise</label>
              <input
                type="text"
                value={form.entreprise}
                onChange={(e) => setForm({ ...form, entreprise: e.target.value })}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-600 mb-1.5 block font-medium">Unité de mesure</label>
              <input
                type="text"
                value={form.unite}
                onChange={(e) => setForm({ ...form, unite: e.target.value })}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm text-zinc-600 mb-1.5 block font-medium">URL de l&apos;API</label>
              <input
                type="text"
                value={form.apiUrl}
                onChange={(e) => setForm({ ...form, apiUrl: e.target.value })}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={sauvegarder}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-blue-700 w-fit font-medium transition-colors"
          >
            <Save size={15} />
            Enregistrer les modifications
          </button>
        </CardContent>
      </Card>

      {/* Configuration Écran TV */}
      <Card className="shadow-sm border border-zinc-100">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Monitor size={18} className="text-blue-600" />
            <CardTitle className="text-base">Configuration Écran TV</CardTitle>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Personnalisez l&apos;affichage de l&apos;écran TV en usine
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">

          {/* Rafraîchissement */}
          <div>
            <label className="text-sm text-zinc-700 mb-2 block font-medium flex items-center gap-2">
              <RefreshCw size={14} className="text-zinc-400" />
              Intervalle de rafraîchissement
            </label>
            <div className="flex gap-3">
              {['10', '30', '60', '120'].map((val) => (
                <button
                  key={val}
                  onClick={() => setTvConfig({ ...tvConfig, refresh: val })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    tvConfig.refresh === val
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-blue-300'
                  }`}
                >
                  {val}s
                </button>
              ))}
            </div>
          </div>

          {/* Département */}
          <div>
            <label className="text-sm text-zinc-700 mb-2 block font-medium flex items-center gap-2">
              <Building2 size={14} className="text-zinc-400" />
              Département affiché
            </label>
            <select
              value={tvConfig.departement}
              onChange={(e) => setTvConfig({ ...tvConfig, departement: e.target.value })}
              className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
            >
              <option value="Tous">Tous les départements</option>
              {['Coupe', 'Couture', 'Lavage', 'Finition', 'Contrôle Qualité', 'Emballage'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Sections à afficher */}
          <div>
            <label className="text-sm text-zinc-700 mb-3 block font-medium">
              Sections à afficher sur l&apos;écran TV
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'afficherKPIs', label: 'KPIs de production', desc: 'OEE, Total, Qualité, Non conformes' },
                { key: 'afficherOEE', label: 'OEE Global', desc: 'Indicateur OEE en grand format' },
                { key: 'afficherTop5', label: 'TOP 5 ouvriers', desc: 'Les plus performants du jour' },
                { key: 'afficherProductions', label: 'Productions récentes', desc: 'Dernières entrées de production' },
              ].map(({ key, label, desc }) => (
                <div
                  key={key}
                  onClick={() => setTvConfig({ ...tvConfig, [key]: !tvConfig[key as keyof typeof tvConfig] })}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    tvConfig[key as keyof typeof tvConfig]
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-zinc-50 border-zinc-200 opacity-60'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                    tvConfig[key as keyof typeof tvConfig]
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-zinc-300'
                  }`}>
                    {tvConfig[key as keyof typeof tvConfig] && (
                      <CheckCircle size={12} className="text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{label}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aperçu */}
          <div className="bg-zinc-900 rounded-xl p-4">
            <p className="text-zinc-400 text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
              <Monitor size={12} />
              Aperçu de l&apos;écran TV
            </p>
            <div className="flex flex-wrap gap-2">
              {tvConfig.afficherKPIs && (
                <span className="bg-blue-900 text-blue-300 text-xs px-3 py-1 rounded-full">📊 KPIs</span>
              )}
              {tvConfig.afficherOEE && (
                <span className="bg-emerald-900 text-emerald-300 text-xs px-3 py-1 rounded-full">📈 OEE</span>
              )}
              {tvConfig.afficherTop5 && (
                <span className="bg-yellow-900 text-yellow-300 text-xs px-3 py-1 rounded-full">🏆 TOP 5</span>
              )}
              {tvConfig.afficherProductions && (
                <span className="bg-purple-900 text-purple-300 text-xs px-3 py-1 rounded-full">⚡ Productions</span>
              )}
              <span className="bg-zinc-700 text-zinc-300 text-xs px-3 py-1 rounded-full">
                🔄 Rafraîchissement : {tvConfig.refresh}s
              </span>
              <span className="bg-zinc-700 text-zinc-300 text-xs px-3 py-1 rounded-full">
                🏭 {tvConfig.departement}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={sauvegarderTV}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-blue-700 font-medium transition-colors"
            >
              <Save size={15} />
              Sauvegarder la configuration TV
            </button>
            
              href=&quot;/dashboard/ecran-tv&quot;
              target=&quot;_blank&quot;
              className=&quot;flex items-center gap-2 bg-zinc-800 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-zinc-900 font-medium transition-colors&quot; 
              
              <Monitor size={15} />
              Ouvrir l&apos;écran TV
            
          </div>

        </CardContent>
      </Card>

      {/* Références produits */}
      <Card className="shadow-sm border border-zinc-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Références produits</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {APP_CONFIG.references.map((ref, index) => (
            <input
              key={index}
              type="text"
              defaultValue={ref}
              className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
          <button
            onClick={sauvegarder}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-blue-700 w-fit font-medium transition-colors mt-2"
          >
            <Save size={15} />
            Enregistrer
          </button>
        </CardContent>
      </Card>

      {/* Comptes utilisateurs */}
      <Card className="shadow-sm border border-zinc-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Comptes utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500 mb-3">
            Pour gérer les comptes allez dans
            <a href="/dashboard/users" className="text-blue-600 hover:underline ml-1 font-medium">
              Gestion des utilisateurs
            </a>
          </p>
        </CardContent>
      </Card>

    </div>
  )
}