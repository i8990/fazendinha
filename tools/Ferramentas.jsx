// ═══ FERRAMENTAS — menu principal e roteamento ════════

import { useState }                        from 'react'
import { useT }                            from '../constants.js'
import { PgH }                             from '../ui.jsx'
import { Adubacao }                        from './Adubacao.jsx'
import { CurralTool }                      from './CurralTool.jsx'
import { Confinamento }                    from './Confinamento.jsx'
import {
  CalcUA,
  CalcLotacao,
  CalcSalMineral,
  CalcPesoFita,
  CalcPopPlanta
}                                          from './Calculadoras.jsx'


// ── Sprite das ferramentas ────────────────────────────────────────
const TS_SIZE = 1024, TS_COLS = 3, TS_ROWS = 3
const TS_CW = TS_SIZE / TS_COLS, TS_CH = TS_SIZE / TS_ROWS

function ToolSprite({ col, row, size = 78, borderRadius = 22 }) {
  const scale = size / TS_CW
  return (
    <div style={{ width: size, height: size, overflow: 'hidden', flexShrink: 0, borderRadius }}>
      <img
        src="/tools-sprites.png"
        style={{
          width: TS_SIZE * scale,
          height: TS_SIZE * scale,
          marginLeft: -(col * TS_CW * scale),
          marginTop:  -(row * TS_CH * scale),
          display: 'block'
        }}
        alt=""
      />
    </div>
  )
}

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

export function Ferramentas({ adubacoes, setAdubacoes, pastos, animais, setManejos }) {
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
        icon={<img src='/iconeSAL.png' style={{ width: 28, height: 28, objectFit: 'contain' }} />}
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
        icon={<img src='/iconeSOLO.png' style={{ width: 28, height: 28, objectFit: 'contain' }} />}
        color="linear-gradient(135deg,#4E3B31,#8A6B55)"
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
        icon={<img src='/iconeCONFIN.png' style={{ width: 28, height: 28, objectFit: 'contain' }} />}
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

  if (open === 'pop') {
    return (
      <ToolScreen
        title="Pop. de Plantas"
        icon="🌱"
        color="linear-gradient(135deg,#1B5E20,#43A047)"
        onBack={back}
      >
        <CalcPopPlanta />
      </ToolScreen>
    )
  }

  if (open === 'curral') {
    return (
      <CurralTool
        animais={animais}
        pastos={pastos}
        onSalvar={manejo => { setManejos(m => [manejo, ...m]); setOpen(null) }}
        onFechar={back}
      />
    )
  }

  const MENU = [
    { id: 'uab',    label: 'UA',           sprite: [0,0] },
    { id: 'lot',    label: 'Lotação',      sprite: [1,0] },
    { id: 'sal',    label: 'Sal Mineral',  sprite: [2,0] },
    { id: 'adub',   label: 'Adubação',     sprite: [0,1] },
    { id: 'conf',   label: 'Confin.',      sprite: [1,1] },
    { id: 'fita',   label: 'Peso Fita',    sprite: [2,1] },
    { id: 'curral', label: 'Curral',       sprite: [0,2] },
    { id: 'pop',    label: 'Pop. Plantas', sprite: [1,2] },
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
                WebkitTapHighlightColor: 'transparent',
                transition: 'transform .16s ease'
              }}
              onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.92)' }}
              onTouchEnd={e =>   { e.currentTarget.style.transform = 'scale(1)' }}
            >
              <ToolSprite col={m.sprite[0]} row={m.sprite[1]} size={78} borderRadius={22} />

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
