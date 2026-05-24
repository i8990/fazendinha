// ═══ UI — Premium Design System ══════════════════════════════════
// Componentes primitivos reutilizados por todas as páginas.
// Importado por: todas as páginas e ferramentas.

import { useState, useRef } from 'react'
import { useT }          from './constants.js'

// ── Card ──────────────────────────────────────────────────────────

// ═══ SPRITE — ícones da spritesheet ══════════════════════════════
const SPRITES = {
  vacaBezerro:  { col: 0, row: 0 },
  bezerro:      { col: 1, row: 0 },
  rebanho:      { col: 2, row: 0 },
  curral:       { col: 0, row: 1 },
  cartaoMoeda:  { col: 1, row: 1 },
  celularCheck: { col: 2, row: 1 },
  caminhonete:  { col: 0, row: 2 },
  pins:         { col: 1, row: 2 },
  salMineral:   { col: 2, row: 2 },
}
const SW = 1536, SH = 1024, COLS = 3, ROWS = 3
const CW = SW / COLS, CH = SH / ROWS

export function Sprite({ name, size = 40, style = {} }) {
  const s = SPRITES[name]
  if (!s) return null
  const scale = size / CW
  return (
    <div style={{
      width: size,
      height: size * (CH / CW),
      overflow: 'hidden',
      flexShrink: 0,
      ...style
    }}>
      <img
        src="/spritesheet1.png"
        style={{
          width: SW * scale,
          height: SH * scale,
          marginLeft: -(s.col * CW * scale),
          marginTop:  -(s.row * CH * scale),
          display: 'block',
          imageRendering: 'auto',
        }}
        alt={name}
      />
    </div>
  )
}

export function Card({ ch, style, onClick }) {
  const T = useT()
  return (
    <div
      onClick={onClick}
      style={{
        background: T.card,
        borderRadius: 22,
        padding: '18px 18px',
        boxShadow: `0 2px 10px ${T.shadow}, 0 0 0 0.5px rgba(0,0,0,0.04)`,
        marginBottom: 12,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.14s ease, box-shadow 0.14s ease',
        ...style
      }}
      onMouseDown={onClick ? e => { e.currentTarget.style.transform = 'scale(0.985)'; e.currentTarget.style.boxShadow = `0 1px 4px ${T.shadow}` } : undefined}
      onMouseUp={onClick ? e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 2px 10px ${T.shadow}, 0 0 0 0.5px rgba(0,0,0,0.04)` } : undefined}
      onTouchStart={onClick ? e => { e.currentTarget.style.transform = 'scale(0.985)' } : undefined}
      onTouchEnd={onClick ? e => { e.currentTarget.style.transform = '' } : undefined}
    >{ch}</div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────
export function Badge({ l, c, bg }) {
  return (
    <span style={{
      background: bg || 'rgba(120,120,128,0.12)',
      color: c || '#6E6E73',
      borderRadius: 20,
      padding: '4px 11px',
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: '-0.1px',
      display: 'inline-block',
      lineHeight: 1.4
    }}>{l}</span>
  )
}

// ── Btn ───────────────────────────────────────────────────────────
export function Btn({ l, icon, onClick, color, style, dis }) {
  const T  = useT()
  const bg = dis ? T.border : (color || T.green)
  return (
    <button onClick={onClick} disabled={dis} style={{
      background: bg,
      color: dis ? T.gray : '#FFF',
      border: 'none',
      borderRadius: 16,
      padding: '0 20px',
      height: 52,
      fontSize: 16,
      fontWeight: 600,
      letterSpacing: '-0.2px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 9,
      cursor: dis ? 'not-allowed' : 'pointer',
      width: '100%',
      transition: 'opacity 0.15s ease, transform 0.1s ease',
      opacity: dis ? 0.5 : 1,
      ...style
    }}>
      {icon && <span style={{ fontSize: 18, lineHeight: 1 }}>{icon}</span>}
      {l}
    </button>
  )
}

// ── Inp ───────────────────────────────────────────────────────────
export function Inp({ label, value, onChange, type = 'text', placeholder, style }) {
  const T = useT()
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 600,
          color: T.gray,
          marginBottom: 6,
          letterSpacing: '0.2px'
        }}>{label}</label>
      )}
      <input
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          border: 'none',
          borderRadius: 13,
          padding: '0 15px',
          height: 50,
          fontSize: 16,
          outline: 'none',
          boxSizing: 'border-box',
          background: focused ? T.card : (T.bg === '#ECE9E2' ? '#E4E0D8' : 'rgba(255,255,255,0.07)'),
          color: T.text,
          boxShadow: focused ? `0 0 0 2.5px ${T.green}` : `0 0 0 1px ${focused ? T.green : T.border}`,
          transition: 'box-shadow 0.18s ease, background 0.18s ease',
          ...style
        }}
      />
    </div>
  )
}

// ── Sel ───────────────────────────────────────────────────────────
export function Sel({ label, value, onChange, opts }) {
  const T = useT()
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 600,
          color: T.gray,
          marginBottom: 6,
          letterSpacing: '0.2px'
        }}>{label}</label>
      )}
      <div style={{ position: 'relative' }}>
        <select
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            border: 'none',
            borderRadius: 13,
            padding: '0 42px 0 15px',
            height: 50,
            fontSize: 16,
            outline: 'none',
            background: focused ? T.card : (T.bg === '#ECE9E2' ? '#E4E0D8' : 'rgba(255,255,255,0.07)'),
            color: T.text,
            appearance: 'none',
            boxShadow: focused ? `0 0 0 2.5px ${T.green}` : `0 0 0 1px ${T.border}`,
            transition: 'box-shadow 0.18s ease',
            cursor: 'pointer'
          }}
        >
          {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
        {/* Chevron customizado */}
        <svg
          width="12" height="8" viewBox="0 0 12 8" fill="none"
          style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        >
          <path d="M1 1l5 5 5-5" stroke={T.gray} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

// ── Modal (com drag-to-close) ──────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  const T = useT()
  const [dragY,    setDragY]    = useState(0)
  const [dragging, setDragging] = useState(false)
  const startY = useRef(null)

  const handleTouchStart = e => {
    startY.current = e.touches[0].clientY
    setDragging(true)
  }
  const handleTouchMove = e => {
    if (startY.current == null) return
    const dy = e.touches[0].clientY - startY.current
    if (dy > 0) setDragY(dy)
  }
  const handleTouchEnd = () => {
    if (dragY > 120) { onClose() }
    setDragY(0)
    setDragging(false)
    startY.current = null
  }

  if (!open) return null
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: `rgba(0,0,0,${Math.max(0, 0.45 - dragY / 600)})`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 500,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        transition: dragging ? 'none' : 'background 0.3s'
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        onTouchMove={dragging ? handleTouchMove : undefined}
        onTouchEnd={dragging ? handleTouchEnd : undefined}
        className={dragging ? '' : 'modal-enter'}
        style={{
          background: T.card,
          borderRadius: '26px 26px 0 0',
          padding: '0 20px 40px',
          width: '100%', maxWidth: 500,
          maxHeight: '92vh', overflowY: dragY > 0 ? 'hidden' : 'auto',
          transform: `translateY(${dragY}px)`,
          transition: dragging ? 'none' : 'transform 0.35s cubic-bezier(0.32,0.72,0,1)',
          userSelect: 'none'
        }}
      >
        {/* Pull indicator — unico lugar que ativa o drag */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 18px', cursor: 'grab' }}
        >
          <div style={{
            width: 36, height: 5, borderRadius: 3,
            background: T.bg === '#ECE9E2' ? 'rgba(78,59,49,0.18)' : 'rgba(255,255,255,0.18)',
            transition: 'width 0.2s',
            ...(dragging && { width: 48 })
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: '-0.3px' }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              background: T.bg === '#ECE9E2' ? 'rgba(78,59,49,0.10)' : 'rgba(255,255,255,0.1)',
              border: 'none', borderRadius: 50,
              width: 32, height: 32, fontSize: 13, cursor: 'pointer', color: T.gray,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 600
            }}
          >✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── DetailPage ────────────────────────────────────────────────────
export function DetailPage({ onBack, title, color, icon, children }) {
  const T = useT()
  return (
    <div className="fi" style={{
      position: 'fixed', inset: 0,
      background: T.bg,
      zIndex: 400, overflowY: 'auto', paddingBottom: 48
    }}>
      <div style={{
        background: color || `linear-gradient(145deg,${T.gDark},${T.green})`,
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)',
        paddingBottom: 12, paddingLeft: 16, paddingRight: 16,
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 10
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.18)',
            border: 'none', color: '#FFF',
            borderRadius: 20,
            padding: '7px 14px 7px 10px',
            fontWeight: 600, cursor: 'pointer',
            fontSize: 14, flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 4,
            backdropFilter: 'blur(4px)',
            letterSpacing: '-0.1px'
          }}
        >
          <svg width="8" height="13" viewBox="0 0 9 15" fill="none" style={{ marginRight: 1 }}>
            <path d="M8 1L1.5 7.5L8 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar
        </button>
        {icon && (
          <div style={{
            width: 32, height: 32,
            borderRadius: 10,
            background: 'rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, flexShrink: 0
          }}>{icon}</div>
        )}
        <div style={{ color: '#FFF', fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
      </div>
      <div style={{ padding: '20px 16px 0' }}>{children}</div>
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────────
export function Section({ title, children, empty }) {
  const T = useT()
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        fontSize: 13, fontWeight: 600,
        color: T.gray,
        letterSpacing: '-0.1px',
        marginBottom: 10,
        paddingLeft: 2
      }}>{title}</div>
      {empty
        ? <div style={{
            background: T.card, borderRadius: 20,
            padding: '18px 18px',
            fontSize: 14, color: T.gray,
            textAlign: 'center',
            boxShadow: `0 1px 4px ${T.shadow}`
          }}>{empty}</div>
        : children
      }
    </div>
  )
}

// ── InfoRow ───────────────────────────────────────────────────────
export function InfoRow({ label, value, color }) {
  const T = useT()
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 0',
      borderBottom: `1px solid ${T.border}`
    }}>
      <span style={{ fontSize: 14, color: T.gray, fontWeight: 400 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: color || T.text }}>{value || '—'}</span>
    </div>
  )
}

// ── DeleteBtn ─────────────────────────────────────────────────────
export function DeleteBtn({ label, onConfirm }) {
  const T = useT()
  const [confirm, setConfirm] = useState(false)

  if (confirm) return (
    <div style={{
      background: T.pinkPale,
      borderRadius: 18, padding: 18, marginTop: 8,
      border: `1px solid ${T.red}20`
    }}>
      <div style={{ fontWeight: 600, color: T.red, marginBottom: 6, fontSize: 15 }}>⚠️ Excluir {label}?</div>
      <div style={{ fontSize: 13, color: T.gray, marginBottom: 16, lineHeight: 1.5 }}>Esta ação não pode ser desfeita.</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button
          onClick={() => setConfirm(false)}
          style={{
            background: T.bg, border: `1px solid ${T.border}`,
            borderRadius: 13, padding: '13px',
            fontWeight: 600, cursor: 'pointer', color: T.gray, fontSize: 15
          }}
        >Cancelar</button>
        <button
          onClick={onConfirm}
          style={{
            background: T.red, border: 'none', borderRadius: 13,
            padding: '13px', fontWeight: 700, cursor: 'pointer', color: '#FFF', fontSize: 15
          }}
        >🗑️ Excluir</button>
      </div>
    </div>
  )

  return <Btn l={`🗑️ Excluir ${label}`} color={T.red} onClick={() => setConfirm(true)} style={{ marginTop: 10 }} />
}

// ── PgH (Page Header) ─────────────────────────────────────────────
export function PgH({ sub, title, extra }) {
  const T = useT()
  return (
    <div style={{
      background: `linear-gradient(145deg,${T.gDark},${T.green})`,
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)',
      paddingBottom: 14, paddingLeft: 16, paddingRight: 16,
      position: 'sticky', top: 0, zIndex: 10
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {sub && (
            <div style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 10,
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              fontWeight: 500,
              lineHeight: 1
            }}>{sub}</div>
          )}
          <div style={{
            color: '#FFF', fontSize: 18, fontWeight: 700,
            letterSpacing: '-0.4px', lineHeight: 1.2,
            marginTop: sub ? 2 : 0
          }}>{title}</div>
        </div>
        {extra}
      </div>
    </div>
  )
}
