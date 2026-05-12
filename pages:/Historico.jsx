// ═══ HISTÓRICO — timeline unificada de todos os eventos ═══════════
// Exporta: HistoricoManejo, ManejoDetailPage, MovDetailPage
// Props de HistoricoManejo:
//   movs, setMovs, manejos, setManejos, animais, fin, setFin, pastos

import { useState, useMemo }               from 'react'
import { useT, TM, MESES }                 from '../constants.js'
import { TODAY, fmtD, fmtR, calcIdade }    from '../utils.js'
import { Card, Badge, Btn, Modal,
         DetailPage, Section, InfoRow,
         DeleteBtn, PgH }                  from '../ui.jsx'
import { CurralTool }                      from '../tools/CurralTool.jsx'

// ═══ MANEJO DETAIL PAGE ═══════════════════════════════════════════
export function ManejoDetailPage({ manejo, onBack, animais, setManejos }) {
  const T = useT()
  const ti            = TM.find(t => t.v === manejo.tipoManejo) || { icon: '💉', c: T.gray, l: 'Manejo' }
  const animaisManejo = animais.filter(a => manejo.animaisIds?.includes(a.id))
  const del           = () => { setManejos(m => m.filter(x => x.id !== manejo.id)); onBack() }

  return (
    <DetailPage onBack={onBack} title={manejo.nomeManejo} icon={ti.icon} color={`linear-gradient(135deg,${T.gDark},${ti.c})`}>
      <Section title="Detalhes do Manejo">
        <Card ch={<>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <Badge l={ti.icon + ' ' + ti.l} c={ti.c} bg={ti.c + '18'} />
            <Badge l={`📅 ${fmtD(manejo.data)}`} c={T.gray} bg={T.bg} />
          </div>
          <InfoRow label="Produto/Dose"      value={manejo.dose || '—'} />
          <InfoRow label="Data"              value={fmtD(manejo.data)} />
          <InfoRow label="Animais tratados"  value={String(manejo.animaisIds?.length || 0)} color={ti.c} />
          {manejo.obs && <div style={{ marginTop: 10, fontSize: 13, color: T.gray }}>📝 {manejo.obs}</div>}
        </>} />
      </Section>

      <Section title={`🐄 Animais tratados (${animaisManejo.length})`} empty={animaisManejo.length === 0 ? 'Nenhum animal encontrado' : null}>
        {animaisManejo.map(a => (
          <Card key={a.id} ch={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, color: T.text }}>{a.ident}</div>
                <div style={{ fontSize: 12, color: T.gray }}>{a.cat}{a.raca ? ` · ${a.raca}` : ''}</div>
              </div>
              <span style={{ fontSize: 12, color: T.gray }}>{a.sexo === 'M' ? '♂' : '♀'}</span>
            </div>
          } style={{ marginBottom: 7 }} />
        ))}
        {manejo.animaisIdents?.filter(id => !animaisManejo.find(a => a.ident === id)).map((id, i) => (
          <Card key={i} ch={
            <div>
              <div style={{ fontWeight: 700, color: T.gray }}>{id}</div>
              <div style={{ fontSize: 11, color: T.gray }}>Animal não encontrado</div>
            </div>
          } style={{ marginBottom: 7 }} />
        ))}
      </Section>

      <DeleteBtn label="este manejo" onConfirm={del} />
      <div style={{ height: 20 }} />
    </DetailPage>
  )
}

// ═══ MOV DETAIL PAGE ══════════════════════════════════════════════
export function MovDetailPage({ mov, onBack, setMovs }) {
  const T   = useT()
  const del = () => { setMovs(m => m.filter(x => x.id !== mov.id)); onBack() }

  return (
    <DetailPage onBack={onBack} title={`Movimentação: ${mov.ident}`} icon="🔄" color={`linear-gradient(135deg,${T.gDark},${T.orange})`}>
      <Section title="Detalhes">
        <Card ch={<>
          <div style={{ display: 'flex', gap: 7, alignItems: 'center', marginBottom: 14, background: T.bg, borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: T.gray, fontWeight: 700, marginBottom: 4 }}>ORIGEM</div>
              <div style={{ fontWeight: 800, color: T.red, fontSize: 14 }}>📍 {mov.de}</div>
            </div>
            <div style={{ fontSize: 20, color: T.gray }}>→</div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: T.gray, fontWeight: 700, marginBottom: 4 }}>DESTINO</div>
              <div style={{ fontWeight: 800, color: T.green, fontSize: 14 }}>📍 {mov.para}</div>
            </div>
          </div>
          <InfoRow label="Animal" value={mov.ident} />
          <InfoRow label="Data"   value={fmtD(mov.data)} />
          {mov.obs && <div style={{ marginTop: 10, fontSize: 13, color: T.orange }}>📝 {mov.obs}</div>}
        </>} />
      </Section>
      <DeleteBtn label="esta movimentação" onConfirm={del} />
      <div style={{ height: 20 }} />
    </DetailPage>
  )
}

// ═══ CALENDÁRIO ═══════════════════════════════════════════════════
function CalendarView({ movs, manejos, animais, fin }) {
  const T = useT()
  const [cur, setCur] = useState(() => new Date())
  const [sel, setSel] = useState(null)

  const y = cur.getFullYear(), m = cur.getMonth()
  const firstDow  = new Date(y, m, 1).getDay()
  const daysInM   = new Date(y, m + 1, 0).getDate()
  const isoP      = `${y}-${String(m + 1).padStart(2, '0')}`

  const allEv = useMemo(() => {
    const e = []
    movs.forEach(x    => e.push({ ...x, _tipo: 'mov' }))
    manejos.forEach(x => e.push({ ...x, _tipo: 'manejo' }))
    animais.filter(a  => a.cat === 'Bezerro' && a.dataNasc).forEach(b =>
      e.push({ id: `n${b.id}`, data: b.dataNasc, ident: b.ident, _tipo: 'nasc' }))
    fin.forEach(f => e.push({ ...f, _tipo: 'fin' }))
    return e
  }, [movs, manejos, animais, fin])

  const byDate = useMemo(() => {
    const map = {}
    allEv.forEach(e => {
      if (!e.data) return
      if (!map[e.data]) map[e.data] = []
      map[e.data].push(e)
    })
    return map
  }, [allEv])

  const selKey = sel ? `${isoP}-${String(sel).padStart(2, '0')}` : null
  const selEvs = selKey ? (byDate[selKey] || []) : []
  const tipoCor  = { mov: T.orange, manejo: T.purple, nasc: T.pink, fin: T.blue }
  const tipoIcon = { mov: '🔄', manejo: '💉', nasc: '🐮', fin: '💰' }

  return (
    <div>
      {/* Navegação mês */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button onClick={() => setCur(d => new Date(d.getFullYear(), d.getMonth() - 1))} style={{ background: T.bg, border: 'none', borderRadius: 9, width: 36, height: 36, fontSize: 18, cursor: 'pointer', color: T.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
        <div style={{ fontWeight: 800, color: T.text, fontSize: 15 }}>{MESES[m]} {y}</div>
        <button onClick={() => setCur(d => new Date(d.getFullYear(), d.getMonth() + 1))} style={{ background: T.bg, border: 'none', borderRadius: 9, width: 36, height: 36, fontSize: 18, cursor: 'pointer', color: T.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
      </div>

      {/* Header dias da semana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', textAlign: 'center', marginBottom: 6 }}>
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
          <div key={i} style={{ fontSize: 10, fontWeight: 700, color: T.gray, paddingBottom: 4 }}>{d}</div>
        ))}
      </div>

      {/* Grid de dias */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
        {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInM }).map((_, i) => {
          const day = i + 1
          const key = `${isoP}-${String(day).padStart(2, '0')}`
          const evs = byDate[key] || []
          const isToday = key === TODAY
          const isSel   = sel === day
          return (
            <div key={day} onClick={() => setSel(isSel ? null : day)} style={{
              borderRadius: 9, padding: '5px 2px', textAlign: 'center', cursor: 'pointer',
              background: isSel ? T.green : isToday ? T.gPale : 'transparent',
              border: `1.5px solid ${isSel ? T.green : isToday ? T.gLight : 'transparent'}`,
              minHeight: 42
            }}>
              <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 400, color: isSel ? '#FFF' : T.text }}>{day}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2, flexWrap: 'wrap' }}>
                {[...new Set(evs.map(e => e._tipo))].slice(0, 3).map(t => (
                  <div key={t} style={{ width: 5, height: 5, borderRadius: '50%', background: tipoCor[t] || T.gray }} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Eventos do dia selecionado */}
      {sel && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 700, color: T.text, marginBottom: 9 }}>
            📅 {String(sel).padStart(2, '0')}/{String(m + 1).padStart(2, '0')}/{y}
          </div>
          {selEvs.length === 0 && <div style={{ color: T.gray, fontSize: 12, textAlign: 'center', padding: 14 }}>Nenhum evento</div>}
          {selEvs.map((e, i) => (
            <div key={i} style={{ background: T.bg, borderRadius: 11, padding: '9px 13px', marginBottom: 7, display: 'flex', gap: 9, alignItems: 'center' }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: (tipoCor[e._tipo] || T.gray) + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{tipoIcon[e._tipo] || '•'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: T.text, fontSize: 13 }}>{e.ident || e.nomeManejo || e.cat || e._tipo}</div>
                <div style={{ fontSize: 11, color: T.gray }}>{e.de && e.para ? `${e.de} → ${e.para}` : e.desc || e.dose || ''}</div>
              </div>
              {e.valor && <div style={{ fontWeight: 700, color: e.tipo === 'receita' ? T.gLight : T.red, fontSize: 13 }}>{e.tipo === 'receita' ? '+' : '-'}{fmtR(e.valor)}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══ HISTÓRICO MANEJO (tela principal) ════════════════════════════
export function HistoricoManejo({ movs, setMovs, manejos, setManejos, animais, fin, setFin, pastos }) {
  const T = useT()
  const [filtro,       setFiltro]       = useState('todos')
  const [curral,       setCurral]       = useState(false)
  const [detailManejo, setDetailManejo] = useState(null)
  const [detailMov,    setDetailMov]    = useState(null)
  const [detailFin,    setDetailFin]    = useState(null)

  const mes = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`

  const FILTROS = [
    { v: 'todos',      l: '📋 Todos',      c: T.green    },
    { v: 'manejo',     l: '💉 Manejos',    c: T.purple   },
    { v: 'mov',        l: '🔄 Pastos',     c: T.orange   },
    { v: 'nascimento', l: '🐮 Nascimentos',c: T.pinkDark },
    { v: 'fin',        l: '💰 Finanças',   c: T.blue     }
  ]

  const timeline = useMemo(() => {
    const e = []
    movs.forEach(m   => e.push({ ...m, _tipo: 'mov' }))
    manejos.forEach(m => e.push({ ...m, _tipo: 'manejo' }))
    animais.filter(a => a.cat === 'Bezerro' && a.dataNasc).forEach(b =>
      e.push({ id: `n${b.id}`, _tipo: 'nascimento', data: b.dataNasc, ident: b.ident, sexo: b.sexo, maeId: b.maeId, raca: b.raca, peso: b.peso }))
    fin.forEach(f => e.push({ ...f, _tipo: 'fin' }))
    return e.sort((a, b) => (b.data || '').localeCompare(a.data || ''))
  }, [movs, manejos, animais, fin])

  const lista = filtro === 'todos' ? timeline : timeline.filter(e => e._tipo === filtro)

  // ── Telas de detalhe ──────────────────────────────────────────────
  if (detailManejo) return <ManejoDetailPage manejo={detailManejo} onBack={() => setDetailManejo(null)} animais={animais} setManejos={setManejos} />
  if (detailMov)    return <MovDetailPage    mov={detailMov}       onBack={() => setDetailMov(null)}    setMovs={setMovs} />

  if (detailFin) {
    const isR = detailFin.tipo === 'receita', cor = isR ? T.green : T.red
    const del = () => { setFin(f => f.filter(x => x.id !== detailFin.id)); setDetailFin(null) }
    return (
      <DetailPage onBack={() => setDetailFin(null)} title={isR ? 'Receita' : 'Despesa'} icon={isR ? '▲' : '▼'} color={`linear-gradient(135deg,${isR ? T.gDark : '#7B1D1D'},${isR ? T.green : T.red})`}>
        <Section title="Detalhes">
          <Card ch={<>
            <div style={{ textAlign: 'center', padding: '16px 0', marginBottom: 12 }}>
              <div style={{ fontSize: 38, fontWeight: 800, color: cor }}>{isR ? '+' : '-'}{fmtR(detailFin.valor)}</div>
              <div style={{ fontSize: 13, color: T.gray, marginTop: 4 }}>{fmtD(detailFin.data)}</div>
            </div>
            <InfoRow label="Categoria"  value={detailFin.cat} />
            <InfoRow label="Descrição"  value={detailFin.desc || '—'} />
            <InfoRow label="Tipo"       value={isR ? 'Receita' : 'Despesa'} color={cor} />
          </>} />
        </Section>
        <DeleteBtn label="esta transação" onConfirm={del} />
        <div style={{ height: 20 }} />
      </DetailPage>
    )
  }

  // ── Render card por tipo ───────────────────────────────────────────
  const cs = { background: T.card, borderRadius: 13, padding: '11px 14px', marginBottom: 9, boxShadow: `0 1px 5px ${T.shadow}`, cursor: 'pointer' }

  const renderCard = item => {
    const df = fmtD(item.data)

    if (item._tipo === 'mov') return (
      <div key={item.id} onClick={() => setDetailMov(item)} className="su" style={{ ...cs, borderLeft: `4px solid ${T.orange}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
            <span style={{ fontSize: 18 }}>🔄</span>
            <div>
              <div style={{ fontWeight: 700, color: T.text, fontSize: 14 }}>{item.ident}</div>
              <div style={{ fontSize: 11, color: T.gray }}>Troca de pasto</div>
            </div>
          </div>
          <span style={{ fontSize: 11, color: T.gray, background: T.bg, borderRadius: 7, padding: '2px 7px', whiteSpace: 'nowrap' }}>{df}</span>
        </div>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center', fontSize: 12, background: T.bg, borderRadius: 7, padding: '6px 9px' }}>
          <span style={{ color: T.red,   fontWeight: 600 }}>📍 {item.de}</span>
          <span style={{ color: T.gray }}>→</span>
          <span style={{ color: T.green, fontWeight: 600 }}>📍 {item.para}</span>
        </div>
        {item.obs && <div style={{ fontSize: 11, color: T.orange, marginTop: 5 }}>📝 {item.obs}</div>}
      </div>
    )

    if (item._tipo === 'manejo') {
      const ti = TM.find(t => t.v === item.tipoManejo) || { c: T.gray, icon: '💉' }
      const n  = item.animaisIds?.length || 0
      return (
        <div key={item.id} onClick={() => setDetailManejo(item)} className="su" style={{ ...cs, borderLeft: `4px solid ${ti.c}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 7 }}>
            <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>{ti.icon}</span>
              <div>
                <div style={{ fontWeight: 700, color: T.text, fontSize: 14 }}>{item.nomeManejo}</div>
                <div style={{ fontSize: 11, color: T.gray }}>{n} animal{n !== 1 ? 'is' : ''}{item.dose ? ` · ${item.dose}` : ''}</div>
              </div>
            </div>
            <span style={{ fontSize: 11, color: T.gray, background: T.bg, borderRadius: 7, padding: '2px 7px', whiteSpace: 'nowrap' }}>{df}</span>
          </div>
          {item.animaisIdents?.length > 0 && (
            <div style={{ fontSize: 11, color: ti.c, background: ti.c + '12', borderRadius: 7, padding: '5px 9px', fontWeight: 600, lineHeight: 1.5 }}>
              {item.animaisIdents.slice(0, 8).join(' · ')}{item.animaisIdents.length > 8 ? ` +${item.animaisIdents.length - 8} mais` : ''}
            </div>
          )}
          {item.obs && <div style={{ fontSize: 11, color: T.gray, marginTop: 5 }}>📝 {item.obs}</div>}
        </div>
      )
    }

    if (item._tipo === 'nascimento') {
      const mae = item.maeId ? animais.find(a => a.id === item.maeId) : null
      const id  = calcIdade(item.data)
      return (
        <div key={item.id} className="su" style={{ ...cs, borderLeft: `4px solid ${T.pink}`, cursor: 'default' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>🐮</span>
              <div>
                <div style={{ fontWeight: 700, color: T.text, fontSize: 14 }}>{item.ident} <span style={{ fontSize: 11, color: T.pinkDark }}>nasceu!</span></div>
                <div style={{ fontSize: 11, color: T.gray }}>{item.sexo === 'M' ? '♂' : '♀'}{item.raca ? ` · ${item.raca}` : ''}{item.peso > 0 ? ` · ${item.peso}kg` : ''}</div>
                {mae && <div style={{ fontSize: 10, color: T.pinkDark, marginTop: 1 }}>🐄 {mae.ident}</div>}
                {id  && <div style={{ fontSize: 10, color: id.cor, marginTop: 1, fontWeight: 600 }}>Hoje com {id.label}</div>}
              </div>
            </div>
            <span style={{ fontSize: 11, color: T.gray, background: T.bg, borderRadius: 7, padding: '2px 7px', whiteSpace: 'nowrap' }}>{df}</span>
          </div>
        </div>
      )
    }

    if (item._tipo === 'fin') {
      const isR = item.tipo === 'receita', cor = isR ? T.gLight : T.red
      return (
        <div key={item.id} onClick={() => setDetailFin(item)} className="su" style={{ ...cs, borderLeft: `4px solid ${cor}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: 7, background: isR ? T.gPale : '#FFE4E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{isR ? '▲' : '▼'}</div>
              <div>
                <div style={{ fontWeight: 700, color: T.text, fontSize: 13 }}>{item.cat}</div>
                {item.desc && <div style={{ fontSize: 11, color: T.gray }}>{item.desc}</div>}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontWeight: 800, color: cor, fontSize: 14 }}>{isR ? '+' : '-'}{fmtR(item.valor)}</div>
              <div style={{ fontSize: 10, color: T.gray }}>{df}</div>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // ── Tela principal ────────────────────────────────────────────────
  return (
    <div style={{ paddingBottom: 100 }}>
      {curral && (
        <CurralTool
          animais={animais} pastos={pastos}
          onSalvar={m => { setManejos(x => [...x, m]); setCurral(false) }}
          onFechar={() => setCurral(false)}
        />
      )}

      <PgH sub="Fazendinha" title="Histórico de Manejo 📋" />

      <div style={{ padding: '12px 14px 0' }}>
        {/* KPIs do mês */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7, marginBottom: 12 }}>
          {[
            ['Manejos',  manejos.filter(m => m.data?.startsWith(mes)).length,                              T.purple,   T.purplePale],
            ['Trocas',   movs.filter(m => m.data?.startsWith(mes)).length,                                 T.orange,   '#FFF3E0'   ],
            ['Nascim.',  animais.filter(a => a.cat === 'Bezerro' && a.dataNasc?.startsWith(mes)).length,   T.pinkDark, T.pinkPale  ]
          ].map(([l, v, c, bg]) => (
            <div key={l} style={{ background: bg, borderRadius: 11, padding: '9px 6px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: c }}>{v}</div>
              <div style={{ fontSize: 10, color: c, fontWeight: 700 }}>{l}</div>
              <div style={{ fontSize: 9, color: T.gray }}>este mês</div>
            </div>
          ))}
        </div>

        {/* Botão Curral */}
        <button onClick={() => setCurral(true)} style={{
          width: '100%', background: `linear-gradient(145deg,${T.gDark},${T.green})`,
          border: 'none', borderRadius: 18, padding: '16px 18px',
          color: '#FFF', fontWeight: 600, fontSize: 15, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 12, marginBottom: 14,
          boxShadow: `0 4px 16px rgba(26,122,74,0.3)`, letterSpacing: '-0.2px'
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🏚️</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 600, letterSpacing: '-0.2px' }}>Ferramenta de Curral</div>
            <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 400, marginTop: 2 }}>Checklist por brinco para manejos</div>
          </div>
        </button>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 11, scrollbarWidth: 'none' }}>
          {FILTROS.map(f => (
            <button key={f.v} onClick={() => setFiltro(f.v)} style={{
              border: `2px solid ${filtro === f.v ? f.c : 'transparent'}`,
              borderRadius: 20, padding: '7px 14px', fontSize: 12, fontWeight: 700,
              background: filtro === f.v ? f.c + '18' : T.card,
              color: filtro === f.v ? f.c : T.gray,
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.12s'
            }}>
              {f.l}{filtro === f.v && lista.length > 0 ? ` (${lista.length})` : ''}
            </button>
          ))}
        </div>

        {/* Timeline */}
        {lista.length === 0 && (
          <div style={{ textAlign: 'center', padding: '44px 20px', color: T.gray }}>
            <div style={{ fontSize: 44 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 11 }}>Nenhum registro nesta categoria</div>
          </div>
        )}
        {lista.map(renderCard)}
      </div>
    </div>
  )
}
