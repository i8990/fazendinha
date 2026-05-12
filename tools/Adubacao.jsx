// ═══ ADUBAÇÃO — análise de solo e recomendação Embrapa ═══════════
// Exporta: Adubacao
// Props:
//   adubacoes    : array
//   setAdubacoes : setter instrumentado
//   pastos       : array (para vincular análise ao pasto)

import { useState }                    from 'react'
import { useT }                        from '../constants.js'
import { TODAY, fmtD }                 from '../utils.js'
import { Btn, Inp, Sel, InfoRow }      from '../ui.jsx'

// ═══ ALGORITMO DE RECOMENDAÇÃO (Embrapa — saturação de bases) ════
export function calcRecomendacao(solo, areaHa) {
  const ph  = parseFloat(solo.pH)  || 0
  const p   = parseFloat(solo.P)   || 0
  const k   = parseFloat(solo.K)   || 0
  const ca  = parseFloat(solo.Ca)  || 0
  const mg  = parseFloat(solo.Mg)  || 0
  const ctc = parseFloat(solo.CTC) || 0
  const v   = parseFloat(solo.V)   || 0
  const mo  = parseFloat(solo.MO)  || 0
  const area = parseFloat(areaHa)  || 1

  // ── Classificações ────────────────────────────────────────────────
  const pHLbl   = ph < 4.5 ? 'muito ácido' : ph < 5.5 ? 'ácido' : ph < 6.0 ? 'moderadamente ácido' : ph < 7.0 ? 'adequado' : 'alcalino'
  const PLow    = p < 15, PVLow = p < 6
  const PLbl    = PVLow ? 'muito baixo' : PLow ? 'baixo' : p < 30 ? 'médio' : 'alto'
  const KLow    = k < 70, KVLow = k < 40
  const KLbl    = KVLow ? 'muito baixo' : KLow ? 'baixo' : k < 120 ? 'médio' : 'alto'
  const CaMg    = ca + mg
  const CaMgLbl = CaMg < 1.5 ? 'muito baixo' : CaMg < 3.0 ? 'baixo' : CaMg < 6.0 ? 'médio' : 'adequado'
  const VLbl    = v < 35 ? 'muito baixo' : v < 50 ? 'baixo' : v < 70 ? 'médio' : 'adequado'
  const MOLbl   = mo < 1.5 ? 'muito baixa' : mo < 3.0 ? 'baixa' : mo < 4.5 ? 'média' : 'alta'

  // ── Correção de acidez (NC = CTC × (V2 − V1) / PRNT, PRNT=80) ──
  const needsCalc = ph < 5.5 || v < 50
  let calcTha = 0
  if (needsCalc && ctc > 0) calcTha = Math.max(0, (ctc * (70 - v)) / 80)

  const calcTTotal     = calcTha * area
  const calcSacosTotal = calcTha > 0 ? Math.ceil((calcTha * 1000 * area) / 50) : 0

  // ── Adubação de plantio ───────────────────────────────────────────
  let produto = '', qtdPTha = 0, justProd = ''
  if (PLow) {
    produto   = '8-28-16'; qtdPTha = PVLow ? 400 : 350
    justProd  = `Fósforo ${PLbl} (${p} mg/dm³) — fórmula 8-28-16 prioriza correção fosfatada`
  } else if (KLow) {
    produto   = '20-05-20'; qtdPTha = KVLow ? 300 : 250
    justProd  = `Potássio ${KLbl} com fósforo adequado — fórmula 20-05-20 supre N e K`
  } else {
    produto   = '4-14-8'; qtdPTha = 200
    justProd  = 'Solo em nível de manutenção — fórmula 4-14-8 equilibrada para pastagem'
  }
  const qtdPTotal   = qtdPTha * area
  const pSacosHa    = Math.ceil(qtdPTha / 50)
  const pSacosTotal = Math.ceil(qtdPTotal / 50)

  // ── Adubação de cobertura ─────────────────────────────────────────
  const prodCob     = 'Ureia protegida 47%'
  const qtdCTha     = 100
  const qtdCTotal   = qtdCTha * area
  const cSacosHa    = Math.ceil(qtdCTha / 50)
  const cSacosTotal = Math.ceil(qtdCTotal / 50)

  // ── Diagnóstico textual ───────────────────────────────────────────
  const diag = [
    `pH ${ph} (${pHLbl})`, `P ${PLbl} (${p} mg/dm³)`, `K ${KLbl} (${k} mg/dm³)`,
    `Ca+Mg ${CaMgLbl}`, `V% ${v}% (${VLbl})`, mo > 0 ? `MO ${MOLbl} (${mo}%)` : null
  ].filter(Boolean).join(', ') + '.'

  const corrMsg = needsCalc
    ? `pH ${ph < 5.5 ? `ácido (pH ${ph})` : ''}${ph < 5.5 && v < 50 ? ' e ' : ''}${v < 50 ? `V% baixo (${v}%)` : ''} exige correção.`
    : 'pH e V% adequados — sem calcário necessário.'

  return {
    diagnostico: diag, needsCalc,
    calcTha: calcTha.toFixed(2), calcTTotal: calcTTotal.toFixed(2), calcSacosTotal,
    produto, qtdPTha, pSacosHa, qtdPTotal: qtdPTotal.toFixed(0), pSacosTotal,
    prodCob, qtdCTha, cSacosHa, qtdCTotal: qtdCTotal.toFixed(0), cSacosTotal,
    justificativa: `${justProd}. ${corrMsg}`, area
  }
}

// ═══ COMPONENTE ADUBAÇÃO ══════════════════════════════════════════
export function Adubacao({ adubacoes, setAdubacoes, pastos }) {
  const T = useT()

  // view: 'historico' | 'nova' | 'detalhe' | 'relatorio'
  const [view,       setView]       = useState('historico')
  const [sel,        setSel]        = useState(null)
  const [editId,     setEditId]     = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [relatorio,  setRelatorio]  = useState(null)

  const emptyForm = { pastoId: '', areaHa: '', data: TODAY, pH: '', P: '', K: '', Ca: '', Mg: '', Al: '', HAl: '', CTC: '', V: '', MO: '', obs: '' }
  const [form, setForm] = useState(emptyForm)
  const ff = k => v => setForm(f => ({ ...f, [k]: v }))

  const nomePasto  = id => pastos.find(p => p.id === id)?.nome || '—'
  const formValid  = form.pH && form.P && form.K && form.CTC && form.V && form.areaHa

  const handleSave = () => {
    if (!formValid) return
    const rec   = calcRecomendacao(form, form.areaHa)
    const entry = {
      id: editId || Date.now(), data: form.data,
      pastoId: form.pastoId ? +form.pastoId : null,
      areaHa: +form.areaHa,
      nomePasto: form.pastoId ? nomePasto(+form.pastoId) : '—',
      solo: { ...form }, rec
    }
    if (editId) { setAdubacoes(a => a.map(x => x.id === editId ? entry : x)); setEditId(null) }
    else        { setAdubacoes(a => [entry, ...a]) }
    setForm(emptyForm); setView('historico')
  }

  const handleEdit   = e => { setForm({ ...e.solo, data: e.data, pastoId: e.pastoId ? String(e.pastoId) : '', areaHa: String(e.areaHa) }); setEditId(e.id); setSel(null); setView('nova') }
  const handleDelete = id => { setAdubacoes(a => a.filter(x => x.id !== id)); setSel(null); setConfirmDel(null); setView('historico') }

  const gerarRelatorio = e => {
    const r     = e.rec
    const lines = [
      `ANÁLISE DE SOLO — ${fmtD(e.data)}`,
      `Pasto: ${e.nomePasto || '—'} | Área: ${e.areaHa} ha`,
      ``,
      `DIAGNÓSTICO DO SOLO`, r.diagnostico, ``,
      r.needsCalc
        ? [`CORREÇÃO`, `Calcário: ${r.calcTha} t/ha`, `Total para ${e.areaHa} ha: ${r.calcTTotal} toneladas`].join('\n')
        : `CORREÇÃO\nNão necessária — pH e V% adequados.`,
      ``,
      `ADUBAÇÃO DE PLANTIO`,
      `${r.produto} → ${r.qtdPTha} kg/ha`,
      `${r.pSacosHa} saco(s) de 50kg/ha`,
      `Total: ${r.qtdPTotal} kg | ${r.pSacosTotal} sacos`,
      ``,
      `ADUBAÇÃO DE COBERTURA`,
      `${r.prodCob} → ${r.qtdCTha} kg/ha`,
      `${r.cSacosHa} saco(s) de 50kg/ha`,
      `Total: ${r.qtdCTotal} kg | ${r.cSacosTotal} sacos`,
      ``,
      `RESUMO TOTAL (${e.areaHa} ha)`,
      r.needsCalc ? `• Calcário: ${r.calcTTotal} toneladas` : '',
      `• ${r.produto}: ${r.pSacosTotal} sacos (${r.qtdPTotal} kg)`,
      `• ${r.prodCob}: ${r.cSacosTotal} sacos (${r.qtdCTotal} kg)`,
      ``,
      `JUSTIFICATIVA`, r.justificativa
    ].filter(l => l !== undefined).join('\n')
    setRelatorio(lines); setView('relatorio')
  }

  // ── Render: detalhe ───────────────────────────────────────────────
  if (view === 'detalhe' && sel) {
    const e = adubacoes.find(x => x.id === sel)
    if (!e) { setView('historico'); return null }
    const r        = e.rec
    const greenBox = { background: T.green, borderRadius: 14, padding: 16, marginBottom: 10, color: '#FFF' }
    const grayBox  = { background: T.bg, borderRadius: 12, padding: 14, marginBottom: 10 }

    return (
      <div style={{ paddingBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 14px 10px' }}>
          <button onClick={() => { setView('historico'); setSel(null) }} style={{ background: T.bg, border: 'none', borderRadius: 10, padding: '9px 15px', fontWeight: 700, cursor: 'pointer', color: T.text, fontSize: 15 }}>‹</button>
          <div style={{ fontWeight: 800, color: T.text, fontSize: 16 }}>🌱 Análise — {fmtD(e.data)}</div>
        </div>
        <div style={{ padding: '0 14px' }}>
          <div style={{ background: T.gPale, borderRadius: 14, padding: 14, marginBottom: 12, border: `1.5px solid ${T.gLight}40` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
              <div>
                <div style={{ fontWeight: 800, color: T.gDark, fontSize: 15 }}>📍 {e.nomePasto || 'Sem pasto'}</div>
                <div style={{ fontSize: 12, color: T.gray }}>📅 {fmtD(e.data)} · {e.areaHa} ha</div>
              </div>
            </div>
          </div>

          <div style={{ fontWeight: 800, color: T.text, fontSize: 13, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>🔬 Diagnóstico do Solo</div>
          <div style={grayBox}><div style={{ fontSize: 14, color: T.text, lineHeight: 1.6 }}>{r.diagnostico}</div></div>

          {r.needsCalc && <>
            <div style={{ fontWeight: 800, color: T.text, fontSize: 13, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>🪨 Correção com Calcário</div>
            <div style={{ ...greenBox, background: 'linear-gradient(135deg,#5c4a1e,#a07a2a)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, opacity: .7, fontWeight: 700 }}>POR HECTARE</div>
                  <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{r.calcTha}<span style={{ fontSize: 14 }}> t/ha</span></div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, opacity: .7, fontWeight: 700 }}>TOTAL ({e.areaHa} ha)</div>
                  <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{r.calcTTotal}<span style={{ fontSize: 14 }}> t</span></div>
                </div>
              </div>
            </div>
          </>}
          {!r.needsCalc && <div style={{ background: '#D8F3DC', borderRadius: 12, padding: 12, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 20 }}>✅</span><div style={{ fontSize: 13, color: '#1B4332', fontWeight: 600 }}>pH e V% adequados — sem necessidade de calcário</div></div>}

          <div style={{ fontWeight: 800, color: T.text, fontSize: 13, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>🌿 Adubação de Plantio</div>
          <div style={greenBox}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{r.produto}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[['kg/ha', `${r.qtdPTha}`], ['sacos/ha', `${r.pSacosHa}`], ['total sacos', `${r.pSacosTotal}`]].map(([l, v]) => (
                <div key={l} style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 10, padding: '8px 4px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, opacity: .8, fontWeight: 700, textTransform: 'uppercase' }}>{l}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.1 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, opacity: .75, marginTop: 8 }}>Total: {r.qtdPTotal} kg para {e.areaHa} ha</div>
          </div>

          <div style={{ fontWeight: 800, color: T.text, fontSize: 13, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>🌾 Adubação de Cobertura</div>
          <div style={{ ...greenBox, background: `linear-gradient(135deg,${T.blue},${T.bLight})` }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{r.prodCob}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[['kg/ha', `${r.qtdCTha}`], ['sacos/ha', `${r.cSacosHa}`], ['total sacos', `${r.cSacosTotal}`]].map(([l, v]) => (
                <div key={l} style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 10, padding: '8px 4px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, opacity: .8, fontWeight: 700, textTransform: 'uppercase' }}>{l}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.1 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, opacity: .75, marginTop: 8 }}>Total: {r.qtdCTotal} kg para {e.areaHa} ha</div>
          </div>

          <div style={{ fontWeight: 800, color: T.text, fontSize: 13, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>📦 Resumo Total</div>
          <div style={{ background: T.card, borderRadius: 14, padding: 14, marginBottom: 10, border: `1.5px solid ${T.border}` }}>
            {r.needsCalc && <InfoRow label="🪨 Calcário"         value={`${r.calcTTotal} toneladas`}              color='#a07a2a' />}
            <InfoRow label={`🌿 ${r.produto}`}   value={`${r.pSacosTotal} sacos · ${r.qtdPTotal} kg`} color={T.green} />
            <InfoRow label={`🌾 ${r.prodCob}`}   value={`${r.cSacosTotal} sacos · ${r.qtdCTotal} kg`} color={T.blue}  />
          </div>

          <div style={{ fontWeight: 800, color: T.text, fontSize: 13, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>💡 Justificativa</div>
          <div style={{ ...grayBox, border: `1.5px solid ${T.border}` }}>
            <div style={{ fontSize: 13, color: T.text, lineHeight: 1.7 }}>{r.justificativa}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
            <button onClick={() => gerarRelatorio(e)} style={{ background: T.purple, border: 'none', borderRadius: 13, padding: '13px 0', color: '#FFF', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>📄 Relatório</button>
            <button onClick={() => handleEdit(e)}     style={{ background: T.blue,   border: 'none', borderRadius: 13, padding: '13px 0', color: '#FFF', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>✏️ Editar</button>
          </div>

          {confirmDel === e.id
            ? <div style={{ background: '#FFE4E6', borderRadius: 13, padding: 14, marginTop: 8 }}>
                <div style={{ fontWeight: 700, color: T.red, marginBottom: 8 }}>⚠️ Excluir esta análise?</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button onClick={() => setConfirmDel(null)} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: '11px', fontWeight: 700, cursor: 'pointer', color: T.gray }}>Cancelar</button>
                  <button onClick={() => handleDelete(e.id)}  style={{ background: T.red,  border: 'none',                  borderRadius: 10, padding: '11px', fontWeight: 700, cursor: 'pointer', color: '#FFF' }}>🗑️ Excluir</button>
                </div>
              </div>
            : <button onClick={() => setConfirmDel(e.id)} style={{ width: '100%', background: '#FFE4E6', border: 'none', borderRadius: 13, padding: '13px 0', color: T.red, fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 8 }}>🗑️ Excluir Análise</button>
          }
          <div style={{ height: 24 }} />
        </div>
      </div>
    )
  }

  // ── Render: relatório ─────────────────────────────────────────────
  if (view === 'relatorio' && relatorio) {
    return (
      <div style={{ paddingBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 14px 10px' }}>
          <button onClick={() => setView('detalhe')} style={{ background: T.bg, border: 'none', borderRadius: 10, padding: '9px 15px', fontWeight: 700, cursor: 'pointer', color: T.text, fontSize: 15 }}>‹</button>
          <div style={{ fontWeight: 800, color: T.text, fontSize: 16 }}>📄 Relatório</div>
        </div>
        <div style={{ padding: '0 14px' }}>
          <div style={{ background: T.card, borderRadius: 14, border: `1.5px solid ${T.border}`, padding: 16, marginBottom: 14 }}>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 13, color: T.text, lineHeight: 1.8, fontFamily: 'inherit', margin: 0 }}>{relatorio}</pre>
          </div>
          <button
            onClick={() => {
              if (navigator.share) { navigator.share({ title: 'Recomendação de Adubação', text: relatorio }) }
              else { navigator.clipboard?.writeText(relatorio).then(() => alert('Copiado!')) }
            }}
            style={{ width: '100%', background: T.green, border: 'none', borderRadius: 13, padding: '14px 0', color: '#FFF', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 10 }}
          >📋 Copiar / Compartilhar</button>
          <button onClick={() => setView('detalhe')} style={{ width: '100%', background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 13, padding: '13px 0', color: T.text, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>‹ Voltar</button>
          <div style={{ height: 24 }} />
        </div>
      </div>
    )
  }

  // ── Render: nova análise / edição ─────────────────────────────────
  if (view === 'nova') {
    const preview = formValid ? calcRecomendacao(form, form.areaHa) : null
    return (
      <div style={{ paddingBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 14px 10px' }}>
          <button onClick={() => { setView('historico'); setForm(emptyForm); setEditId(null) }} style={{ background: T.bg, border: 'none', borderRadius: 10, padding: '9px 15px', fontWeight: 700, cursor: 'pointer', color: T.text, fontSize: 15 }}>‹</button>
          <div style={{ fontWeight: 800, color: T.text, fontSize: 16 }}>{editId ? '✏️ Editar' : '🌱 Nova'} Análise de Solo</div>
        </div>
        <div style={{ padding: '0 14px' }}>
          <div style={{ background: T.gPale, borderRadius: 14, padding: 12, marginBottom: 14, border: `1.5px solid ${T.gLight}40` }}>
            <div style={{ fontSize: 11, color: T.gDark, fontWeight: 700 }}>📋 Preencha os dados da análise de solo. Campos obrigatórios: pH, P, K, CTC, V% e Área.</div>
          </div>
          <Sel label="Pasto *" value={form.pastoId} onChange={ff('pastoId')} opts={[{ v: '', l: 'Selecionar pasto...' }, ...pastos.map(p => ({ v: String(p.id), l: p.nome }))]} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Inp label="Área (ha) *" value={form.areaHa} onChange={ff('areaHa')} type="number" placeholder="Ex: 12" />
            <Inp label="Data"        value={form.data}   onChange={ff('data')}   type="date" />
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.gray, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8, marginTop: 4 }}>Dados da Análise de Solo</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Inp label="pH *"              value={form.pH}  onChange={ff('pH')}  type="number" placeholder="Ex: 5.2" />
            <Inp label="MO (%)"            value={form.MO}  onChange={ff('MO')}  type="number" placeholder="Ex: 2.8" />
            <Inp label="P (mg/dm³) *"      value={form.P}   onChange={ff('P')}   type="number" placeholder="Ex: 8" />
            <Inp label="K (mg/dm³)"        value={form.K}   onChange={ff('K')}   type="number" placeholder="Ex: 55" />
            <Inp label="Ca (cmolc/dm³)"    value={form.Ca}  onChange={ff('Ca')}  type="number" placeholder="Ex: 1.8" />
            <Inp label="Mg (cmolc/dm³)"    value={form.Mg}  onChange={ff('Mg')}  type="number" placeholder="Ex: 0.6" />
            <Inp label="Al (cmolc/dm³)"    value={form.Al}  onChange={ff('Al')}  type="number" placeholder="Ex: 0.4" />
            <Inp label="H+Al (cmolc/dm³)"  value={form.HAl} onChange={ff('HAl')} type="number" placeholder="Ex: 4.8" />
            <Inp label="CTC (cmolc/dm³) *" value={form.CTC} onChange={ff('CTC')} type="number" placeholder="Ex: 7.2" />
            <Inp label="V% *"              value={form.V}   onChange={ff('V')}   type="number" placeholder="Ex: 38" />
          </div>
          <Inp label="Observações" value={form.obs} onChange={ff('obs')} placeholder="Opcional..." />

          {preview && (
            <div style={{ background: T.gDark, borderRadius: 14, padding: 14, marginBottom: 14 }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700, marginBottom: 10 }}>⚡ PRÉ-VISUALIZAÇÃO DA RECOMENDAÇÃO</div>
              <div style={{ color: '#FFF', fontSize: 13, lineHeight: 1.7 }}>
                {preview.needsCalc && <div>🪨 Calcário: <b>{preview.calcTha} t/ha</b> · Total: <b>{preview.calcTTotal} t</b></div>}
                <div>🌿 Plantio: <b>{preview.produto}</b> — {preview.qtdPTha} kg/ha · {preview.pSacosHa} saco(s)/ha</div>
                <div>🌾 Cobertura: <b>{preview.prodCob}</b> — {preview.qtdCTha} kg/ha</div>
              </div>
            </div>
          )}

          <Btn l={editId ? '💾 Salvar Alterações' : '✅ Gerar Recomendação'} onClick={handleSave} dis={!formValid} />
          <div style={{ height: 24 }} />
        </div>
      </div>
    )
  }

  // ── Render: histórico (default) ───────────────────────────────────
  return (
    <div style={{ paddingBottom: 20 }}>
      <Btn l="+ Nova Análise de Solo" icon="🌱" onClick={() => { setForm(emptyForm); setEditId(null); setView('nova') }} style={{ margin: '12px 0 14px' }} />
      {adubacoes.length === 0
        ? <div style={{ textAlign: 'center', padding: '40px 20px', color: T.gray }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Nenhuma análise registrada</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>Clique em "Nova Análise" para começar</div>
          </div>
        : <div>
            {adubacoes.map(e => {
              const r = e.rec
              return (
                <div
                  key={e.id}
                  onClick={() => { setSel(e.id); setView('detalhe') }}
                  style={{ background: T.card, borderRadius: 16, padding: 14, marginBottom: 10, cursor: 'pointer', boxShadow: `0 2px 8px ${T.shadow}`, border: `1.5px solid ${T.border}` }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: T.text }}>📍 {e.nomePasto || 'Sem pasto'}</div>
                      <div style={{ fontSize: 12, color: T.gray, marginTop: 2 }}>📅 {fmtD(e.data)} · {e.areaHa} ha</div>
                    </div>
                    <span style={{ color: T.gray, fontSize: 20 }}>›</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                    {r.needsCalc && <div style={{ background: '#FFF8E1', borderRadius: 10, padding: '8px 10px' }}><div style={{ fontSize: 10, color: '#7B5800', fontWeight: 700 }}>🪨 CALCÁRIO</div><div style={{ fontSize: 13, fontWeight: 800, color: '#a07a2a' }}>{r.calcTTotal} t</div></div>}
                    <div style={{ background: T.gPale,   borderRadius: 10, padding: '8px 10px' }}><div style={{ fontSize: 10, color: T.gDark, fontWeight: 700 }}>🌿 PLANTIO</div><div style={{ fontSize: 13, fontWeight: 800, color: T.green }}>{r.pSacosTotal} sc · {r.produto}</div></div>
                    <div style={{ background: T.bluePale, borderRadius: 10, padding: '8px 10px' }}><div style={{ fontSize: 10, color: T.blue,  fontWeight: 700 }}>🌾 COBERTURA</div><div style={{ fontSize: 13, fontWeight: 800, color: T.blue }}>{r.cSacosTotal} sc · Ureia</div></div>
                  </div>
                </div>
              )
            })}
          </div>
      }
    </div>
  )
}
