// ═══ AJUDA — manuais do usuário e do desenvolvedor ════════════════
// Exporta: Ajuda
// Abre cada manual em um modal fullscreen via iframe.
// Os arquivos manual-usuario.html e manual-dev.html ficam na raiz do projeto.
// Props:
//   onClose() : fecha o painel de ajuda

import { useState } from 'react'
import { useT }     from '../constants.js'

function ManualViewer({ src, title, onClose }) {
  const T = useT()
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 900,
      display: 'flex', flexDirection: 'column',
      background: T.bg
    }}>
      <div style={{
        background: `linear-gradient(135deg,${T.gDark},${T.green})`,
        padding: '13px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        flexShrink: 0
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.18)', border: 'none',
            color: '#FFF', borderRadius: 22,
            padding: '8px 16px 8px 12px',
            fontWeight: 600, fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
            backdropFilter: 'blur(4px)'
          }}
        >
          <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
            <path d="M7 1L1.5 6.5L7 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Voltar
        </button>
        <div style={{ color: '#FFF', fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}>{title}</div>
      </div>
      <iframe
        src={src}
        title={title}
        style={{ flex: 1, border: 'none', width: '100%', background: '#F5F5F7' }}
        loading="lazy"
      />
    </div>
  )
}

export function Ajuda({ onClose }) {
  const T = useT()
  const [viewer, setViewer] = useState(null)

  if (viewer === 'usuario') return (
    <ManualViewer src="/manual-usuario.html" title="📗 Manual do Usuário" onClose={() => setViewer(null)} />
  )
  if (viewer === 'dev') return (
    <ManualViewer src="/manual-dev.html" title="🛠️ Manual do Desenvolvedor" onClose={() => setViewer(null)} />
  )

  const MANUAIS = [
    {
      id: 'usuario', icon: '📗', titulo: 'Manual do Usuário',
      sub: 'Como usar cada tela, registrar animais, pastos, manejos e ferramentas',
      cor: T.green, bg: T.gPale, border: T.gLight
    },
    {
      id: 'dev', icon: '🛠️', titulo: 'Manual do Desenvolvedor',
      sub: 'Arquitetura, módulos, algoritmos, serviços e convenções de código',
      cor: T.blue, bg: T.bluePale, border: T.blueMid
    }
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 800, background: T.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: `linear-gradient(135deg,${T.gDark},${T.green})`, padding: '14px 16px 28px', flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.18)', border: 'none', color: '#FFF', borderRadius: 22, padding: '8px 16px 8px 12px', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
          <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
            <path d="M7 1L1.5 6.5L7 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Voltar
        </button>
        <div style={{ color: '#FFF', fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>📖 Ajuda</div>
        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 4 }}>Documentação do FazendinhaApp v11.0</div>
      </div>
      <div style={{ padding: '20px 16px', flex: 1, overflowY: 'auto' }}>
        {MANUAIS.map(m => (
          <button key={m.id} onClick={() => setViewer(m.id)} style={{ width: '100%', background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 22, padding: '18px 18px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, boxShadow: `0 2px 10px ${T.shadow}` }}>
            <div style={{ width: 58, height: 58, borderRadius: 17, background: m.bg, border: `1.5px solid ${m.border}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{m.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text, letterSpacing: '-0.3px', marginBottom: 4 }}>{m.titulo}</div>
              <div style={{ fontSize: 12, color: T.gray, lineHeight: 1.5 }}>{m.sub}</div>
            </div>
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" style={{ flexShrink: 0 }}>
              <path d="M1 1l6 6-6 6" stroke={T.gray} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ))}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: T.gray, lineHeight: 1.8 }}>
          Fazendinha App <span style={{ color: T.green, fontWeight: 700 }}>v11.0</span><br/>
          Desenvolvido por Jblleite · Baependi, MG
        </div>
      </div>
    </div>
  )
}
