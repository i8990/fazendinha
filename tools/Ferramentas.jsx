// ═══ FERRAMENTAS — menu principal e roteamento de ferramentas ══════
// Exporta: Ferramentas, ToolScreen
// Props de Ferramentas:
//   adubacoes, setAdubacoes, pastos

import { useState }                        from 'react'
import { useT }                            from '../constants.js'
import { PgH }                             from '../ui.jsx'
import { Adubacao }                        from './Adubacao.jsx'
import { Confinamento }                    from './Confinamento.jsx'
import { CalcUA, CalcLotacao,
         CalcSalMineral, CalcGMD }         from './Calculadoras.jsx'

// ═══ TOOL SCREEN — wrapper fullscreen para cada ferramenta ═════════
// Reutilizado por Ferramentas e por HistoricoManejo (via CurralTool).
export function ToolScreen({ title, icon, color, onBack, children }) {
  const T = useT()
  return (
    <div className="fi" style={{ position: 'fixed', inset: 0, background: T.bg, zIndex: 400, overflowY: 'auto', paddingBottom: 48 }}>
      <div style={{ background: color, padding: '16px 20px 36px', position: 'relative' }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.18)', border: 'none', color: '#FFF',
            borderRadius: 24, padding: '9px 18px 9px 14px',
            fontWeight: 600, cursor: 'pointer', fontSize: 15, marginBottom: 18,
            display: 'flex', alignItems: 'center', gap: 4,
            backdropFilter: 'blur(4px)'
          }}
        >
          <svg width="9" height="15" viewBox="0 0 9 15" fill="none" style={{ marginRight: 2 }}>
            <path d="M8 1L1.5 7.5L8 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 50, height: 50, borderRadius: 15, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
            {icon}
          </div>
          <div style={{ color: '#FFF', fontSize: 21, fontWeight: 700, letterSpacing: '-0.4px', lineHeight: 1.2 }}>{title}</div>
        </div>
      </div>
      <div style={{ padding: '20px 16px 0' }}>{children}</div>
    </div>
  )
}

// ═══ FERRAMENTAS (menu principal) ══════════════════════════════════
export function Ferramentas({ adubacoes, setAdubacoes, pastos }) {
  const T = useT()
  const [open, setOpen] = useState(null)
  const back = () => setOpen(null)

  // ── Telas individuais ─────────────────────────────────────────────
  if (open === 'uab') return (
    <ToolScreen title="Unidade Animal (UA)" icon="⚖️" color={`linear-gradient(135deg,${T.gDark},${T.green})`} onBack={back}>
      <CalcUA />
    </ToolScreen>
  )

  if (open === 'lot') return (
    <ToolScreen title="Capacidade de Lotação" icon="🌿" color={`linear-gradient(135deg,${T.gDark},${T.green})`} onBack={back}>
      <CalcLotacao />
    </ToolScreen>
  )

  if (open === 'sal') return (
    <ToolScreen title="Necessidade de Sal Mineral" icon="🧂" color="linear-gradient(135deg,#7B3F00,#E65100)" onBack={back}>
      <CalcSalMineral />
    </ToolScreen>
  )

  if (open === 'gmd') return (
    <ToolScreen title="Ganho Médio Diário (GMD)" icon="📈" color={`linear-gradient(135deg,${T.blue},${T.bLight})`} onBack={back}>
      <CalcGMD />
    </ToolScreen>
  )

  if (open === 'adub') return (
    <ToolScreen title="Adubação e Correção" icon="🌱" color="linear-gradient(135deg,#1a3a1a,#2D6A4F)" onBack={back}>
      <Adubacao adubacoes={adubacoes} setAdubacoes={setAdubacoes} pastos={pastos} />
    </ToolScreen>
  )

  if (open === 'conf') return (
    <ToolScreen title="Calculadora de Confinamento" icon="🐄" color="linear-gradient(135deg,#2C3E50,#4a6741)" onBack={back}>
      <Confinamento />
    </ToolScreen>
  )

  // ── Menu principal ────────────────────────────────────────────────
  const MENU = [
    { id: 'uab',  icon: '⚖️', label: 'Unidade Animal',      sub: 'Calcule UA do rebanho',                                                                    bg: T.gPale,                border: T.gLight,  ic: T.green   },
    { id: 'lot',  icon: '🌿', label: 'Lotação do Pasto',    sub: 'Capacidade em UA/ha',                                                                      bg: T.gPale,                border: T.gLight,  ic: T.green   },
    { id: 'sal',  icon: '🧂', label: 'Sal Mineral',         sub: 'Kg e sacos por período',                                                                   bg: 'rgba(255,159,10,0.08)', border: T.orange,  ic: T.orange  },
    { id: 'gmd',  icon: '📈', label: 'Ganho Médio Diário',  sub: 'Desempenho do lote',                                                                       bg: T.bluePale,             border: T.blueMid, ic: T.blue    },
    { id: 'adub', icon: '🌱', label: 'Adubação e Correção', sub: `${adubacoes.length} análise${adubacoes.length !== 1 ? 's' : ''} salva${adubacoes.length !== 1 ? 's' : ''}`, bg: T.gPale, border: T.gLight,  ic: T.green   },
    { id: 'conf', icon: '🐄', label: 'Confinamento',        sub: 'Dieta, estoque e projeção',                                                                bg: T.bluePale,             border: T.blueMid, ic: '#2C3E50' },
  ]

  return (
    <div style={{ paddingBottom: 100 }}>
      <PgH sub="Utilidades" title="Ferramentas 🧮" />
      <div style={{ padding: '16px 14px 0' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: T.gray, letterSpacing: '-0.1px', marginBottom: 14 }}>
          Selecione uma ferramenta
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {MENU.map(m => (
            <button
              key={m.id}
              onClick={() => setOpen(m.id)}
              style={{
                background: T.card, border: `1px solid ${T.border}`,
                borderRadius: 20, padding: '16px 18px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 15,
                textAlign: 'left', width: '100%',
                boxShadow: `0 2px 8px ${T.shadow}`
              }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 16, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                {m.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: T.text, letterSpacing: '-0.2px', lineHeight: 1.3 }}>{m.label}</div>
                <div style={{ fontSize: 13, color: T.gray, marginTop: 3 }}>{m.sub}</div>
              </div>
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none" style={{ color: T.gray, flexShrink: 0 }}>
                <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
