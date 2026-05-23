// ═══ WIDGETS — componentes com dependências externas ══════════════
// MapaMedicao : usa Leaflet (carregado via CDN no index.html)
// ClimaWidget : consome API Open-Meteo (sem chave, gratuita)
// Importado por: Pastos.jsx, Dashboard.jsx

import { useState, useEffect, useRef } from 'react'
import { useT }                         from './constants.js'
import { Card }                         from './ui.jsx'

// ── Códigos WMO → emoji de clima ─────────────────────────────────
const WMO = {
  0:'☀️', 1:'🌤️', 2:'⛅', 3:'🌥️',
  51:'🌦️', 55:'🌧️', 61:'🌧️', 63:'🌧️', 65:'⛈️',
  80:'🌦️', 82:'⛈️', 95:'⛈️'
}

// ═══ MAPA DE MEDIÇÃO ══════════════════════════════════════════════
// Abre mapa satélite Esri fullscreen para medir área em hectares.
// Props:
//   onAplicar(area: number) — chamado ao confirmar a área medida
//   onFechar()              — chamado ao fechar sem confirmar
export function MapaMedicao({ onAplicar, onFechar }) {
  const divRef = useRef(null)
  const mapR   = useRef(null)
  const ptsR   = useRef([])
  const mksR   = useRef([])
  const polyR  = useRef(null)
  const [area, setArea]   = useState(0)
  const [nPts, setNPts]   = useState(0)

  // Cálculo geodésico de área em hectares (fórmula esférica)
  const calcAreaHa = pts => {
    if (pts.length < 3) return 0
    const R = 6371000, n = pts.length
    let a = 0
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      a += (pts[j].lng - pts[i].lng) * Math.PI / 180
           * (2 + Math.sin(pts[i].lat * Math.PI / 180) + Math.sin(pts[j].lat * Math.PI / 180))
    }
    return Math.abs(a * R * R / 2) / 10000
  }

  useEffect(() => {
    const t = setTimeout(() => {
      if (!divRef.current || mapR.current) return
      const map = L.map(divRef.current, { center: [-21.9569, -44.8881], zoom: 16 })

      // Camada satélite Esri
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: '© Esri', maxZoom: 19 }
      ).addTo(map)

      // Camada de labels
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, opacity: 0.75 }
      ).addTo(map)

      // Ícone numerado para cada vértice
      const mkIcon = n => L.divIcon({
        html: `<div style="background:#F4A261;color:#FFF;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;border:3px solid #FFF;box-shadow:0 2px 8px rgba(0,0,0,0.7);font-family:sans-serif">${n}</div>`,
        className: '', iconSize: [28, 28], iconAnchor: [14, 14]
      })

      map.on('click', e => {
        const pt = { lat: e.latlng.lat, lng: e.latlng.lng }
        ptsR.current = [...ptsR.current, pt]
        const mk = L.marker([pt.lat, pt.lng], { icon: mkIcon(ptsR.current.length) }).addTo(map)
        mksR.current.push(mk)
        upd(map)
      })

      mapR.current = map
      map.invalidateSize()
    }, 150)

    return () => {
      clearTimeout(t)
      if (mapR.current) { mapR.current.remove(); mapR.current = null }
    }
  }, [])

  const upd = map => {
    const pts = ptsR.current
    if (polyR.current) map.removeLayer(polyR.current)
    if (pts.length >= 3)
      polyR.current = L.polygon(pts.map(p => [p.lat, p.lng]),
        { color: '#55604D', fillColor: '#55604D', fillOpacity: 0.2, weight: 2 }).addTo(map)
    else if (pts.length >= 2)
      polyR.current = L.polyline(pts.map(p => [p.lat, p.lng]),
        { color: '#55604D', weight: 2, dashArray: '6,4' }).addTo(map)
    setArea(calcAreaHa(pts))
    setNPts(pts.length)
  }

  const desfazer = () => {
    const map = mapR.current
    if (!map || !mksR.current.length) return
    map.removeLayer(mksR.current.pop())
    ptsR.current = ptsR.current.slice(0, -1)
    upd(map)
  }

  const limpar = () => {
    const map = mapR.current
    if (!map) return
    mksR.current.forEach(m => map.removeLayer(m))
    mksR.current = []
    if (polyR.current) { map.removeLayer(polyR.current); polyR.current = null }
    ptsR.current = []
    setArea(0)
    setNPts(0)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: '#4E3B31', color: '#FFF',
        padding: '12px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>🛰️ Medição por Satélite</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Toque no mapa para marcar vértices</div>
        </div>
        <button
          onClick={onFechar}
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#FFF', borderRadius: 8, padding: '6px 14px', fontWeight: 700, cursor: 'pointer' }}
        >✕</button>
      </div>

      {/* Mapa */}
      <div ref={divRef} style={{ flex: 1 }} />

      {/* Painel inferior */}
      <div style={{ background: '#FFF', padding: 14, flexShrink: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div style={{ background: '#D8F3DC', borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Área</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#4E3B31', lineHeight: 1.2 }}>
              {area.toFixed(2)}<span style={{ fontSize: 13 }}> ha</span>
            </div>
          </div>
          <div style={{ background: '#F0F4F1', borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Pontos</div>
            <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2 }}>{nPts}</div>
            <div style={{ fontSize: 10, color: '#6B7280' }}>{nPts < 3 ? 'mín. 3' : '✓'}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 10 }}>
          <button
            onClick={desfazer}
            style={{ background: '#F0F4F1', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '11px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#6B7280' }}
          >↩️ Desfazer</button>
          <button
            onClick={limpar}
            style={{ background: '#FFF3E0', border: '1.5px solid #F4A261', borderRadius: 10, padding: '11px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#F4A261' }}
          >🗑️ Limpar</button>
        </div>
        <button
          onClick={() => onAplicar(area)}
          disabled={nPts < 3}
          style={{
            background: nPts < 3 ? '#CCC' : '#55604D',
            color: '#FFF', border: 'none', borderRadius: 12,
            padding: '13px', fontSize: 15, fontWeight: 700,
            width: '100%', cursor: nPts < 3 ? 'not-allowed' : 'pointer'
          }}
        >✅ Aplicar {area > 0 ? `— ${area.toFixed(2)} ha` : ''}</button>
      </div>
    </div>
  )
}

// ═══ CLIMA WIDGET ═════════════════════════════════════════════════
// Previsão 7 dias via Open-Meteo (Baependi-MG, sem chave de API).
export function ClimaWidget() {
  const [d, setD]       = useState(null)
  const [load, setLoad] = useState(true)
  const [err, setErr]   = useState(false)

  useEffect(() => {
    const isNative = window.location.protocol === 'capacitor:' || window.location.protocol === 'file:'
    const coords = 'latitude=-21.9569&longitude=-44.8881'
    const tz = 'timezone=America%2FSao_Paulo'
    const url = isNative
      ? `https://api.open-meteo.com/v1/forecast?${coords}&daily=precipitation_sum,temperature_2m_max,weathercode&current_weather=true&hourly=relativehumidity_2m&${tz}&past_days=31&forecast_days=15`
      : '/api/clima'
    fetch(url)
      .then(r => { if (!r.ok) throw 0; return r.json() })
      .then(v => {
        const now = new Date()
        const rainMonthSoFar = v.daily.time.reduce((sum, dateStr, i) => {
          const d = new Date(dateStr)
          if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d <= now)
            return sum + (v.daily.precipitation_sum[i] || 0)
          return sum
        }, 0)
        setD({ ...v, rainMonthSoFar: Math.round(rainMonthSoFar) })
        setLoad(false)
      })
      .catch((e) => { console.error("❌ clima:", e); setErr(true); setLoad(false) })
  }, [])

  const base = {
    background: 'linear-gradient(160deg,#1A1410,#2E2418)',
    color: '#e8f4fd', border: 'none', borderRadius: 20, padding: 14
  }

  if (load) return (
    <Card ch={<div style={{ textAlign: 'center', padding: 12, fontSize: 13, color: '#e8f4fd' }}>⏳ Carregando clima...</div>} style={base} />
  )
  if (err) return (
    <Card ch={<div style={{ fontSize: 12, color: '#e8f4fd' }}>⚠️ Clima offline</div>} style={base} />
  )

  const cw  = d.current_weather
  const dl  = d.daily
  const now = new Date()
  const hum = d.hourly?.relativehumidity_2m?.[now.getHours()] ?? '—'
  const rain7 = dl.precipitation_sum.slice(0,7).reduce((s, v) => s + (v || 0), 0)
  const RAIN_HIST   = [231,121,120,48,40,23,19,20,64,101,156,214]
  const rainMonth   = RAIN_HIST[now.getMonth()]
  const rainSoFar   = d.rainMonthSoFar ?? 0
  const pct         = Math.min(100, Math.round(rainSoFar / rainMonth * 100))
  const DAYS        = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

  const stat = (val, lbl) => (
    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 8, textAlign: 'center', flex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#7dd3fc' }}>{val}</div>
      <div style={{ fontSize: 10, opacity: 0.55, marginTop: 2 }}>{lbl}</div>
    </div>
  )

  return (
    <Card ch={<>
      <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.55, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
        🌱 Baependi — MG
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 42, fontWeight: 800, lineHeight: 1, color: '#fff' }}>{Math.round(cw.temperature)}°</div>
          <div style={{ fontSize: 12, opacity: 0.55, marginTop: 4 }}>💨 {Math.round(cw.windspeed)} km/h</div>
        </div>
        <div style={{ fontSize: 38 }}>{WMO[cw.weathercode] || '🌡️'}</div>
      </div>

      <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
        {stat(`${hum}%`, 'Humidade')}
        {stat(`${rain7.toFixed(0)} mm`, 'Chuva 7 dias')}
        {stat(`~${rainMonth} mm`, 'Est. mês')}
      </div>

      <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.4, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
        Previsão 7 dias
      </div>
      <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 2 }}>
        {dl.time.map((t, i) => (
          <div key={t} style={{ flex: '0 0 38px', background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '6px 3px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, opacity: 0.55 }}>
              {new Date(t + 'T12:00').toDateString() === now.toDateString() ? 'Hoje' : DAYS[new Date(t + 'T12:00').getDay()]}
            </div>
            <div style={{ fontSize: 15, margin: '3px 0' }}>{WMO[dl.weathercode[i]] || '🌡️'}</div>
            <div style={{ fontSize: 10, fontWeight: 700 }}>{Math.round(dl.temperature_2m_max[i])}°</div>
            <div style={{ fontSize: 10, color: '#7dd3fc', marginTop: 1 }}>
              {(dl.precipitation_sum[i] || 0) > 0 ? `${(dl.precipitation_sum[i]).toFixed(0)}mm` : '—'}
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.4, letterSpacing: 1, textTransform: 'uppercase', margin: '14px 0 6px' }}>
        Acúmulo estimado no mês
      </div>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
        Previsto: ~{rainMonth} mm · Choveu até hoje: {rainSoFar} mm
      </div>
      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, height: 6, overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(90deg,#5B7B8A,#8AAAB8)', borderRadius: 8, height: '100%', width: `${pct}%` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 4, opacity: 0.65 }}>
        <span>0 mm</span><span>{pct}% do mês</span><span>~{rainMonth} mm</span>
      </div>
    </>} style={base} />
  )
}
