'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, CameraOff, Scan, CheckCircle, XCircle, AlertTriangle, Wifi, WifiOff } from 'lucide-react'

interface ResultatIA {
  conforme: boolean
  nb_defauts: number
  nb_conformes: number
  confiance_max: number
  message: string
  mode: string
  detections: { classe: string; confiance: number }[]
}

const IA_URL = 'http://127.0.0.1:8000'

export default function DetectionIA() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resultat, setResultat] = useState<ResultatIA | null>(null)
  const [apiStatus, setApiStatus] = useState<'unknown' | 'online' | 'offline'>('unknown')
  const [historique, setHistorique] = useState<(ResultatIA & { heure: string })[]>([])
  const [autoMode, setAutoMode] = useState(false)
  const autoRef = useRef<NodeJS.Timeout | null>(null)

  // Vérifier statut API
  const verifierAPI = async () => {
    try {
      const res = await fetch(`${IA_URL}/health`)
      if (res.ok) setApiStatus('online')
      else setApiStatus('offline')
    } catch {
      setApiStatus('offline')
    }
  }

  // Démarrer la caméra
  const demarrerCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
        verifierAPI()
      }
    } catch (err) {
      console.log('Erreur caméra:', err)
      alert('Impossible d\'accéder à la caméra !')
    }
  }

  // Arrêter la caméra
  const arreterCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
    if (autoRef.current) clearInterval(autoRef.current)
    setAutoMode(false)
  }

  // Capturer et analyser
  const analyser = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || loading) return
    setLoading(true)

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      canvas.width = 640
      canvas.height = 480
      ctx?.drawImage(videoRef.current, 0, 0, 640, 480)

      canvas.toBlob(async (blob) => {
        if (!blob) return
        const formData = new FormData()
        formData.append('file', blob, 'capture.jpg')

        try {
          const res = await fetch(`${IA_URL}/analyser`, {
            method: 'POST',
            body: formData
          })
          const data: ResultatIA = await res.json()
          setResultat(data)
          setHistorique(prev => [{
            ...data,
            heure: new Date().toLocaleTimeString('fr-FR')
          }, ...prev].slice(0, 10))
        } catch {
          setApiStatus('offline')
        } finally {
          setLoading(false)
        }
      }, 'image/jpeg', 0.8)
    } catch (err) {
      console.log('Erreur analyse:', err)
      setLoading(false)
    }
  }, [loading])

  // Mode automatique
  const toggleAutoMode = () => {
    if (autoMode) {
      if (autoRef.current) clearInterval(autoRef.current)
      setAutoMode(false)
    } else {
      setAutoMode(true)
      autoRef.current = setInterval(() => analyser(), 3000)
    }
  }

  const totalConformes = historique.filter(h => h.conforme).length
  const totalDefauts = historique.filter(h => !h.conforme).length
  const tauxQualite = historique.length > 0
    ? ((totalConformes / historique.length) * 100).toFixed(1)
    : '0'

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800">Détection IA — Qualité</h2>
          <p className="text-sm text-zinc-500">Analyse automatique des défauts par YOLOv11</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            apiStatus === 'online' ? 'bg-emerald-50 text-emerald-600' :
            apiStatus === 'offline' ? 'bg-red-50 text-red-500' :
            'bg-zinc-50 text-zinc-500'
          }`}>
            {apiStatus === 'online' ? <Wifi size={15} /> : <WifiOff size={15} />}
            {apiStatus === 'online' ? 'API connectée' :
             apiStatus === 'offline' ? 'API hors ligne' : 'Vérification...'}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-zinc-50">
          <CardContent className="pt-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Analyses</p>
            <p className="text-3xl font-bold text-zinc-800 mt-1">{historique.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-emerald-50">
          <CardContent className="pt-5">
            <p className="text-xs text-emerald-500 uppercase tracking-wide font-semibold">Conformes</p>
            <p className="text-3xl font-bold text-emerald-700 mt-1">{totalConformes}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-red-50">
          <CardContent className="pt-5">
            <p className="text-xs text-red-500 uppercase tracking-wide font-semibold">Défauts</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{totalDefauts}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-blue-50">
          <CardContent className="pt-5">
            <p className="text-xs text-blue-500 uppercase tracking-wide font-semibold">Taux qualité</p>
            <p className="text-3xl font-bold text-blue-700 mt-1">{tauxQualite}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* Webcam */}
        <div className="flex flex-col gap-4">
          <Card className="shadow-sm border border-zinc-100">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-blue-600" />
                <CardTitle className="text-base">Caméra en direct</CardTitle>
                {autoMode && (
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 ml-auto animate-pulse">
                    🔴 Auto
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative bg-zinc-900 rounded-xl overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                {!cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Camera size={48} className="text-zinc-600 mx-auto mb-3" />
                      <p className="text-zinc-500 text-sm">Caméra inactive</p>
                    </div>
                  </div>
                )}
                {loading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-white">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyse en cours...
                    </div>
                  </div>
                )}
              </div>

              {/* Boutons */}
              <div className="flex gap-3 mt-4">
                {!cameraActive ? (
                  <button
                    onClick={demarrerCamera}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Camera size={16} />
                    Démarrer la caméra
                  </button>
                ) : (
                  <>
                    <button
                      onClick={analyser}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      <Scan size={16} />
                      Analyser
                    </button>
                    <button
                      onClick={toggleAutoMode}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        autoMode
                          ? 'bg-orange-500 text-white hover:bg-orange-600'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {autoMode ? '⏹ Stop auto' : '▶ Auto (3s)'}
                    </button>
                    <button
                      onClick={arreterCamera}
                      className="px-4 py-2.5 rounded-xl text-sm border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <CameraOff size={16} />
                    </button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Résultat */}
        <div className="flex flex-col gap-4">

          {/* Résultat analyse */}
          <Card className={`shadow-sm border-2 ${
            !resultat ? 'border-zinc-100' :
            resultat.conforme ? 'border-emerald-200 bg-emerald-50' :
            'border-red-200 bg-red-50'
          }`}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {!resultat ? <AlertTriangle size={18} className="text-zinc-400" /> :
                 resultat.conforme ? <CheckCircle size={18} className="text-emerald-600" /> :
                 <XCircle size={18} className="text-red-500" />}
                <CardTitle className="text-base">Résultat de l&apos;analyse</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {!resultat ? (
                <div className="py-8 text-center">
                  <Scan size={40} className="text-zinc-200 mx-auto mb-3" />
                  <p className="text-zinc-400 text-sm">Lancez une analyse pour voir le résultat</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className={`text-center py-6 rounded-xl ${
                    resultat.conforme ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    <p className="text-4xl mb-2">{resultat.conforme ? '✅' : '❌'}</p>
                    <p className={`text-xl font-bold ${
                      resultat.conforme ? 'text-emerald-700' : 'text-red-700'
                    }`}>
                      {resultat.conforme ? 'CONFORME' : 'NON CONFORME'}
                    </p>
                    <p className="text-sm mt-1 text-zinc-600">{resultat.message}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-3 text-center border border-zinc-100">
                      <p className="text-xs text-zinc-400 mb-1">Défauts détectés</p>
                      <p className={`text-2xl font-bold ${resultat.nb_defauts > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                        {resultat.nb_defauts}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3 text-center border border-zinc-100">
                      <p className="text-xs text-zinc-400 mb-1">Confiance max</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {resultat.confiance_max}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className="bg-zinc-100 text-zinc-600 hover:bg-zinc-100">
                      Mode : {resultat.mode}
                    </Badge>
                    <span className="text-xs text-zinc-400">
                      {new Date().toLocaleTimeString('fr-FR')}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historique */}
          <Card className="shadow-sm border border-zinc-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Historique des analyses</CardTitle>
            </CardHeader>
            <CardContent>
              {historique.length === 0 ? (
                <p className="text-zinc-400 text-sm text-center py-4">Aucune analyse effectuée</p>
              ) : (
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {historique.map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50">
                      <div className="flex items-center gap-2">
                        <span>{h.conforme ? '✅' : '❌'}</span>
                        <span className="text-sm font-medium">
                          {h.conforme ? 'Conforme' : `${h.nb_defauts} défaut(s)`}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-400">{h.heure}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}