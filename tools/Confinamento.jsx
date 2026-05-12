// ═══ CONFINAMENTO — calculadora completa de confinamento ══════════
// Exporta: Confinamento, DIETA, GMD_PRESETS
// Estado local apenas — sem persistência.
// Usado dentro de Ferramentas.jsx via ToolScreen.

import { useState }   from 'react'
import { useT }       from '../constants.js'
import { Inp }        from '../ui.jsx'

// ── Dieta padrão confinamento ─────────────────────────────────────
// Proporções fixas, embasadas em literatura zootécnica brasileira
export const DIETA = [
  { id: 1, nome: 'Silagem de capim', pct: 55, cor: '#2D6A4F', sacosKg: null, unid: 'tonelada'   },
  { id: 2, nome: 'Fubá de milho',    pct: 22, cor: '#F4A261', sacosKg: 30,   unid: 'saco 30 kg' },
  { id: 3, nome: 'Farelo de soja',   pct: 13, cor: '#5390D9', sacosKg: 30,   unid: 'saco 30 kg' },
  { id: 4, nome: 'Sal proteínado',   pct:  7, cor: '#E63946', sacosKg: 25,   unid: 'saco 25 kg' },
  { id: 5, nome: 'Núcleo mineral',   pct:  3, cor: '#8338EC', sacosKg: 25,   unid: 'saco 25 kg' },
]

// ── GMD presets ───────────────────────────────────────────────────
export const GMD_PRESETS = [
  { v: '0.9',  l: 'Baixo', sub: '0,9 kg/dia',  desc: 'Raça zebuína extensiva'      },
  { v: '1.2',  l: 'Médio', sub: '1,2 kg/dia',  desc: 'Padrão nelore confinado'     },
  { v: '1.5',  l: 'Alto',  sub: '1,5 kg/dia',  desc: 'Cruzado / genética melhorada'},
  { v: 'cust', l: 'Outro', sub: 'Personalizar', desc: ''                            },
]

// ═══ COMPONENTE CONFINAMENTO ═══════════════════════════════════════
export function Confinamento() {
  const T = useT()

  // ── Entradas ──────────────────────────────────────────────────────
  const [nAnim,   setNA]   = useState('50')
  const [pIni,    setPI]   = useState('380')
  const [gmdSel,  setGS]   = useState('1.2')   // preset ou 'cust'
  const [gmdCust, setGC]   = useState('')       // valor quando 'cust'
  const [dias,    setDias] = useState('90')
  const [pAlvo,   setPA]   = useState('700')
  const [tab,     setTab]  = useState('resumo') // 'resumo' | 'ingredientes'

  const gmd = gmdSel === 'cust' ? (parseFloat(gmdCust) || 0) : parseFloat(gmdSel) || 0

  // ── Helpers numéricos ─────────────────────────────────────────────
  const n     = v => parseFloat(v) || 0
  const f1    = v => (+v).toLocaleString('pt-BR', { maximumFractionDigits: 1 })
  const f0    = v => Math.round(+v).toLocaleString('pt-BR')
  const fmtKg = v => v >= 1000
    ? `${(v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} t`
    : `${Math.round(v).toLocaleString('pt-BR')} kg`

  // ── Cálculos base ─────────────────────────────────────────────────
  const ok          = n(nAnim) > 0 && n(pIni) > 0 && gmd > 0 && n(dias) > 0
  const pSaida      = n(pIni) + gmd * n(dias)
  const pMedioLote  = (n(pIni) + pSaida) / 2          // peso médio durante período
  const consDia     = pMedioLote * 0.025               // 2,5% PV — padrão confinamento
  const consDiaLote = consDia * n(nAnim)
  const totalAlim   = consDiaLote * n(dias)
  const ganhoAnim   = pSaida - n(pIni)
  const ganhoLote   = ganhoAnim * n(nAnim)
  const diasAlvo    = gmd > 0 && n(pAlvo) > n(pIni) ? Math.ceil((n(pAlvo) - n(pIni)) / gmd) : null
  const arrSaida    = (pSaida / 15) * n(nAnim)
  const arrEnt      = (n(pIni) / 15) * n(nAnim)
  const arrGanho    = arrSaida - arrEnt
  const efic        = consDia > 0 ? ((gmd / consDia) * 100).toFixed(1) : 0
  const baixoGmd    = gmd < 0.8 && gmd > 0

  // ── Por ingrediente ───────────────────────────────────────────────
  const ingCalc = DIETA.map(ig => {
    const kgDiaLote = (ig.pct / 100) * consDiaLote
    const kgTotal   = kgDiaLote * n(dias)
    const tTotal    = kgTotal / 1000
    const sacos     = ig.sacosKg ? Math.ceil(kgTotal / ig.sacosKg) : null
    return { ...ig, kgDiaLote, kgTotal, tTotal, sacos }
  })

  // ── Sub-componentes locais ────────────────────────────────────────
  const TabBtn = ({ id, label, icon }) => (
    <button onClick={() => setTab(id)} style={{
      flex: 1, border: 'none', borderRadius: 10, padding: '9px 4px',
      fontWeight: 700, fontSize: 12, cursor: 'pointer',
      background: tab === id ? T.gDark : 'transparent',
      color: tab === id ? '#FFF' : T.gray
    }}>{icon} {label}</button>
  )

  const Row = ({ l, v, hl }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: ' 1px solid rgba(255,255,255,0.08)' }}>
      <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>{l}</span>
      <span style={{ color: hl || '#FFF', fontSize: 13, fontWeight: 700 }}>{v}</span>
    </div>
  )

  return (
    <div style={{ paddingBottom: 16 }}>

      {/* ── DADOS DO LOTE ── */}
      <div style={{ background: T.gPale, borderRadius: 16, padding: 14, marginBottom: 14, border: `1.5px solid ${T.gLight}30` }}>
        <div style={{ fontWeight: 800, color: T.gDark, fontSize: 13, marginBottom: 12 }}>🐄 Dados do Lote</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <Inp label="Nº de animais"        value={nAnim} onChange={setNA}   type="number" placeholder="50"  />
          <Inp label="Peso inicial (kg)"     value={pIni}  onChange={setPI}   type="number" placeholder="380" />
          <Inp label="Dias de confinamento"  value={dias}  onChange={setDias} type="number" placeholder="90"  />
          <Inp label="Peso-alvo (kg)"        value={pAlvo} onChange={setPA}   type="number" placeholder="700" />
        </div>

        {/* GMD presets */}
        <div style={{ fontSize: 11, fontWeight: 700, color: T.gray, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>
          GMD esperado — padrão confinamento
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: gmdSel === 'cust' ? 10 : 0 }}>
          {GMD_PRESETS.map(p => (
            <button key={p.v} onClick={() => setGS(p.v)} style={{
              border: `2px solid ${gmdSel === p.v ? T.green : T.border}`,
              borderRadius: 12, padding: '10px 8px', cursor: 'pointer', textAlign: 'center',
              background: gmdSel === p.v ? T.gPale : T.card
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: gmdSel === p.v ? T.green : T.text }}>{p.l}</div>
              <div style={{ fontSize: 11, color: gmdSel === p.v ? T.gDark : T.gray, marginTop: 1 }}>{p.sub}</div>
              {p.desc && <div style={{ fontSize: 9, color: T.gray, marginTop: 1, lineHeight: 1.3 }}>{p.desc}</div>}
            </button>
          ))}
        </div>
        {gmdSel === 'cust' && <Inp label="GMD personalizado (kg/dia)" value={gmdCust} onChange={setGC} type="number" placeholder="Ex: 1.3" />}

        {/* Consumo calculado automaticamente */}
        {ok && (
          <div style={{ background: T.card, borderRadius: 10, padding: '10px 12px', marginTop: 10, border: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.gray }}>Consumo médio calculado</div>
              <div style={{ fontSize: 10, color: T.gray, marginTop: 1 }}>2,5% do peso vivo médio ({f1(pMedioLote)} kg)</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: T.gDark }}>{f1(consDia)} <span style={{ fontSize: 11 }}>kg/animal/dia</span></div>
              <div style={{ fontSize: 11, color: T.gray }}>{f1(consDiaLote)} kg/dia no lote</div>
            </div>
          </div>
        )}

        {baixoGmd && (
          <div style={{ background: '#FFF3E0', borderRadius: 10, padding: '8px 12px', marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <span style={{ fontSize: 12, color: '#E65100', fontWeight: 600 }}>GMD abaixo de 0,8 kg/dia — revise a dieta ou condição corporal.</span>
          </div>
        )}
      </div>

      {/* ── BARRA VISUAL DA DIETA ── */}
      <div style={{ background: T.card, borderRadius: 16, padding: 14, marginBottom: 14, border: `1.5px solid ${T.border}` }}>
        <div style={{ fontWeight: 800, color: T.text, fontSize: 13, marginBottom: 10 }}>🌾 Composição da Dieta (padrão confinamento)</div>
        <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', height: 14, marginBottom: 12 }}>
          {DIETA.map(ig => <div key={ig.id} title={`${ig.nome} ${ig.pct}%`} style={{ width: `${ig.pct}%`, background: ig.cor }} />)}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {DIETA.map(ig => (
            <div key={ig.id} style={{ display: 'flex', alignItems: 'center', gap: 5, background: T.bg, borderRadius: 20, padding: '4px 10px', border: `1px solid ${ig.cor}30` }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: ig.cor }} />
              <span style={{ fontSize: 11, color: T.text, fontWeight: 600 }}>{ig.nome}</span>
              <span style={{ fontSize: 11, color: ig.cor, fontWeight: 800 }}>{ig.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── ABAS DE RESULTADO ── */}
      {ok && <>
        <div style={{ display: 'flex', gap: 6, background: T.card, borderRadius: 12, padding: 4, marginBottom: 14, border: `1.5px solid ${T.border}` }}>
          <TabBtn id="resumo"       label="Resumo"     icon="📊" />
          <TabBtn id="ingredientes" label="Quantidades" icon="🌾" />
        </div>

        {/* ══ RESUMO ══ */}
        {tab === 'resumo' && <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            {[
              { icon: '🐄', label: 'Peso de saída',   val: `${f1(pSaida)} kg`,                                          sub: `+${f1(ganhoAnim)} kg/animal`,         cor: T.green   },
              { icon: '⏱️', label: 'Dias até alvo',   val: diasAlvo && diasAlvo > 0 ? `${diasAlvo} d` : '—',             sub: `Meta ${n(pAlvo)} kg`,                 cor: T.blue    },
              { icon: '📈', label: 'Ganho do lote',   val: `${f0(ganhoLote)} kg`,                                        sub: `${f1(arrGanho)} @`,                   cor: '#7B2FBE' },
              { icon: '🌾', label: 'Alimento total',  val: fmtKg(totalAlim),                                             sub: `${f1(consDiaLote)} kg/dia`,           cor: '#E65100' },
            ].map(k => (
              <div key={k.label} style={{ background: T.card, borderRadius: 14, padding: 12, border: `1.5px solid ${k.cor}25` }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{k.icon}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.gray, textTransform: 'uppercase', letterSpacing: '.3px' }}>{k.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: k.cor, lineHeight: 1.1, marginTop: 3 }}>{k.val}</div>
                <div style={{ fontSize: 10, color: T.gray, marginTop: 2 }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Gráfico evolução de peso */}
          <div style={{ background: T.card, borderRadius: 16, padding: 14, marginBottom: 10, border: `1.5px solid ${T.border}` }}>
            <div style={{ fontWeight: 700, color: T.text, fontSize: 13, marginBottom: 10 }}>📏 Evolução de Peso no Período</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 68, marginBottom: 8 }}>
              {Array.from({ length: 10 }).map((_, i) => {
                const d      = Math.round((n(dias) / 9) * i)
                const p      = n(pIni) + gmd * d
                const maxP   = pSaida, minP = n(pIni)
                const h      = maxP > minP ? ((p - minP) / (maxP - minP) * 52) + 16 : 32
                const isAlvo = n(pAlvo) > 0 && p >= n(pAlvo) && (i === 0 || n(pIni) + gmd * Math.round((n(dias) / 9) * (i - 1)) < n(pAlvo))
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    {isAlvo && <div style={{ fontSize: 8, color: T.green, fontWeight: 700 }}>🎯</div>}
                    <div style={{ width: '75%', background: `linear-gradient(180deg,${T.green},${T.gDark})`, borderRadius: '3px 3px 0 0', height: `${h}px` }} />
                    <div style={{ fontSize: 8, color: T.gray }}>{d}d</div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: T.gray }}>
              <span>Entrada: <b style={{ color: T.text }}>{n(pIni)} kg</b></span>
              {n(pAlvo) > n(pIni) && n(pAlvo) < pSaida && <span>🎯 Alvo: <b style={{ color: T.green }}>{n(pAlvo)} kg</b></span>}
              <span>Saída: <b style={{ color: T.green }}>{f1(pSaida)} kg</b></span>
            </div>
          </div>

          {/* Resumo escuro */}
          <div style={{ background: 'linear-gradient(135deg,#1a2f1a,#2D5016)', borderRadius: 16, padding: 16, marginBottom: 10 }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10 }}>📋 Resumo do Confinamento</div>
            <Row l="🐄 Animais"              v={`${n(nAnim)} cabeças`} />
            <Row l="⚖️ Arrobas na entrada"   v={`${f1(arrEnt)} @`} />
            <Row l="📈 Arrobas na saída"     v={`${f1(arrSaida)} @`}                                    hl="#52B788" />
            <Row l="🏆 Ganho total em @"     v={`${f1(arrGanho)} @`}                                    hl="#FFD166" />
            <Row l="⚡ Eficiência alimentar" v={`${efic}% (${gmd} kg ganho / ${f1(consDia)} kg ingerido)`} />
            <Row l="🌾 Consumo total do lote" v={fmtKg(totalAlim)} />
            <Row l="🔄 Consumo/animal/dia"   v={`${f1(consDia)} kg (2,5% PV médio)`} />
            {diasAlvo && diasAlvo > 0 && <Row l={`📅 Dias p/ atingir ${n(pAlvo)} kg`} v={`${diasAlvo} dias`} hl="#74C0FC" />}
            {baixoGmd && (
              <div style={{ background: 'rgba(246,112,0,.22)', borderRadius: 10, padding: '8px 10px', marginTop: 10, fontSize: 12, color: '#FFD166', fontWeight: 600 }}>
                ⚠️ GMD abaixo de 0,8 kg/dia — considere revisar a dieta.
              </div>
            )}
          </div>
        </>}

        {/* ══ QUANTIDADES ══ */}
        {tab === 'ingredientes' && <>
          {/* Cabeçalho total */}
          <div style={{ background: T.green, borderRadius: 16, padding: 16, marginBottom: 12, textAlign: 'center' }}>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
              Total de alimento — {n(nAnim)} animais × {n(dias)} dias
            </div>
            <div style={{ color: '#FFF', fontSize: 40, fontWeight: 800, lineHeight: 1 }}>{fmtKg(totalAlim)}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 6 }}>
              {f1(consDiaLote)} kg/dia no lote · {f1(consDia)} kg/animal/dia
            </div>
          </div>

          {/* Card por ingrediente */}
          {ingCalc.map(ig => (
            <div key={ig.id} style={{ background: T.card, borderRadius: 16, padding: 14, marginBottom: 10, border: `2px solid ${ig.cor}30` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: ig.cor }} />
                  <div style={{ fontWeight: 800, color: T.text, fontSize: 14 }}>{ig.nome}</div>
                </div>
                <div style={{ background: `${ig.cor}18`, color: ig.cor, fontSize: 12, fontWeight: 800, padding: '3px 10px', borderRadius: 20 }}>{ig.pct}% da dieta</div>
              </div>
              <div style={{ height: 6, background: T.border, borderRadius: 4, marginBottom: 12, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${ig.pct}%`, background: ig.cor, borderRadius: 4 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  ['kg/dia lote',    `${f0(ig.kgDiaLote)}`, 'kg',    T.text ],
                  ['kg no período',  `${f0(ig.kgTotal)}`,   'kg',    ig.cor ],
                  ig.sacos
                    ? ['sacos necessários', `${ig.sacos}`, ig.unid, ig.cor]
                    : ['toneladas', `${ig.tTotal.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`, 't', ig.cor],
                ].map(([lbl, val, unit, cor]) => (
                  <div key={lbl} style={{ background: T.bg, borderRadius: 12, padding: '10px 6px', textAlign: 'center', border: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: T.gray, textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 4, lineHeight: 1.3 }}>{lbl}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: cor, lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: 9, color: T.gray, marginTop: 2 }}>{unit}</div>
                  </div>
                ))}
              </div>
              {!ig.sacosKg && (
                <div style={{ marginTop: 8, fontSize: 11, color: T.gray, textAlign: 'center' }}>
                  📦 Equivale a {ig.tTotal.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} toneladas de silagem no período
                </div>
              )}
            </div>
          ))}

          {/* Lista de compras compacta */}
          <div style={{ background: 'linear-gradient(135deg,#1e2d3d,#2C3E50)', borderRadius: 16, padding: 14, marginBottom: 8 }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10 }}>🛒 Lista de compras estimada</div>
            {ingCalc.map(ig => (
              <div key={ig.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: ig.cor }} />
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{ig.nome}</span>
                </div>
                <span style={{ color: '#FFD166', fontSize: 13, fontWeight: 700 }}>
                  {ig.sacos ? `${ig.sacos} sacos` : `${ig.tTotal.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} t`}
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 400, fontSize: 11 }}> · {fmtKg(ig.kgTotal)}</span>
                </span>
              </div>
            ))}
          </div>
        </>}
      </>}

      {/* Empty state */}
      {!ok && (
        <div style={{ background: T.card, borderRadius: 14, padding: 20, textAlign: 'center', border: `1.5px solid ${T.border}`, marginTop: 4 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🐄</div>
          <div style={{ fontSize: 13, color: T.gray }}>Preencha os dados do lote para ver as projeções de consumo e quantidade de alimentos.</div>
        </div>
      )}
    </div>
  )
}
