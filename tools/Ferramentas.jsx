// ═══ FERRAMENTAS — menu principal e roteamento ════════

import { useState }                        from 'react'
import { useT }                            from '../constants.js'
import { PgH }                             from '../ui.jsx'
import { Adubacao }                        from './Adubacao.jsx'
import { Confinamento }                    from './Confinamento.jsx'
import {
  CalcUA,
  CalcLotacao,
  CalcSalMineral,
  CalcPesoFita
}                                          from './Calculadoras.jsx'

export function ToolScreen({ title, icon, color, onBack, children }) {
  const T = useT()

  return (
    <div
      className="fi"
      style={{
        position: 'fixed',
        inset: 0,
        background: T.bg,
        zIndex: 400,
        overflowY: 'auto',
        paddingBottom: 48
      }}
    >
      <div
        style={{
          background: color,
          padding: '16px 20px 36px'
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.16)',
            border: 'none',
            color: '#FFF',
            borderRadius: 20,
            padding: '8px 14px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
            marginBottom: 18,
            backdropFilter: 'blur(12px)'
          }}
        >
          ← Voltar
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              backdropFilter: 'blur(10px)'
            }}
          >
            {icon}
          </div>

          <div
            style={{
              color: '#FFF',
              fontSize: 22,
              fontWeight: 700
            }}
          >
            {title}
          </div>
        </div>
      </div>

      <div style={{ padding: '18px 14px 0' }}>
        {children}
      </div>
    </div>
  )
}

export function Ferramentas({ adubacoes, setAdubacoes, pastos }) {
  const T = useT()
  const [open, setOpen] = useState(null)

  const back = () => setOpen(null)

  if (open === 'uab') {
    return (
      <ToolScreen
        title="Unidade Animal"
        icon="⚖️"
        color={`linear-gradient(135deg,${T.gDark},${T.green})`}
        onBack={back}
      >
        <CalcUA />
      </ToolScreen>
    )
  }

  if (open === 'lot') {
    return (
      <ToolScreen
        title="Lotação"
        icon="🌿"
        color={`linear-gradient(135deg,${T.gDark},${T.green})`}
        onBack={back}
      >
        <CalcLotacao />
      </ToolScreen>
    )
  }

  if (open === 'sal') {
    return (
      <ToolScreen
        title="Sal Mineral"
        icon="🧂"
        color="linear-gradient(135deg,#7B3F00,#E65100)"
        onBack={back}
      >
        <CalcSalMineral />
      </ToolScreen>
    )
  }


  if (open === 'adub') {
    return (
      <ToolScreen
        title="Adubação"
        icon="🌱"
        color="linear-gradient(135deg,#1a3a1a,#2D6A4F)"
        onBack={back}
      >
        <Adubacao
          adubacoes={adubacoes}
          setAdubacoes={setAdubacoes}
          pastos={pastos}
        />
      </ToolScreen>
    )
  }

  if (open === 'conf') {
    return (
      <ToolScreen
        title="Confinamento"
        icon="🐄"
        color="linear-gradient(135deg,#2C3E50,#4a6741)"
        onBack={back}
      >
        <Confinamento />
      </ToolScreen>
    )
  }

  if (open === 'fita') {
    return (
      <ToolScreen
        title="Peso por Fita"
        icon="📏"
        color="linear-gradient(135deg,#E65100,#FF8F00)"
        onBack={back}
      >
        <CalcPesoFita />
      </ToolScreen>
    )
  }

  const MENU = [
    {
      id: 'uab',
      icon: '⚖️',
      label: 'UA',
      bg: T.gPale
    },
    {
      id: 'lot',
      icon: '🌿',
      label: 'Lotação',
      bg: 'rgba(48,209,88,0.12)'
    },
    {
      id: 'sal',
      icon: '🧂',
      label: 'Sal',
      bg: 'rgba(255,159,10,0.12)'
    },
    {
      id: 'adub',
      icon: '🌱',
      label: 'Adubação',
      bg: 'rgba(48,209,88,0.12)'
    },
    {
      id: 'conf',
      icon: '🐄',
      label: 'Confin.',
      bg: 'rgba(90,200,250,0.14)'
    },
    {
      id: 'fita',
      icon: '📏',
      label: 'Peso Fita',
      bg: 'rgba(230,81,0,0.12)'
    }
  ]

  return (
    <div style={{ paddingBottom: 100 }}>
      <PgH
        sub="Utilidades"
        title="Ferramentas 🧮"
      />

      <div style={{ padding: '18px 14px 0' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14,
            justifyItems: 'center'
          }}
        >
          {MENU.map(m => (
            <button
              key={m.id}
              onClick={() => setOpen(m.id)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                WebkitTapHighlightColor: 'transparent'
              }}
              onTouchStart={e => {
                e.currentTarget.style.transform = 'scale(0.92)'
              }}
              onTouchEnd={e => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <div
                style={{
                  width: 78,
                  height: 78,
                  borderRadius: 22,
                  background: T.card,
                  border: `1px solid ${T.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 34,
                  boxShadow: `
                    0 4px 18px ${T.shadow},
                    inset 0 1px 0 rgba(255,255,255,0.05)
                  `,
                  backdropFilter: 'blur(10px)',
                  transition: 'all .16s ease'
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 18,
                    background: m.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {m.icon}
                </div>
              </div>

              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.text,
                  textAlign: 'center',
                  letterSpacing: '-0.1px'
                }}
              >
                {m.label}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
