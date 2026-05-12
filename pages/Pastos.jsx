// ═══ PASTOS — gestão de pastos e sal mineral ══════════════════════
// Exporta: Pastos, PastoDetailPage
// Props de Pastos:
//   pastos, setPastos, animais, sal, setSal, manejos, movs

import { useState }                          from 'react'
import { useT, PS, PE, TM }                  from '../constants.js'
import { TODAY, fmtD, calcSal }              from '../utils.js'
import { Card, Badge, Btn, Inp, Sel, Modal,
         DetailPage, Section, InfoRow,
         DeleteBtn, PgH }                    from '../ui.jsx'
import { MapaMedicao }                       from '../widgets.jsx'

// ═══ PASTO DETAIL PAGE ════════════════════════════════════════════
export function PastoDetailPage({ pasto, onBack, animais, sal, setSal, manejos, movs, setPastos, pastos }) {
  const T = useT()
  const animaisNoPasto = animais.filter(a => a.pastoId === pasto.id && a.status === 'ativo')
  const salDoPasto     = [...sal.filter(s => s.pastoId === pasto.id)].sort((a, b) => b.data.localeCompare(a.data))
  const manejosDoPasto = manejos.filter(m => m.animaisIds?.some(id => animaisNoPasto.map(a => a.id).includes(id)))
  const movsDoPasto    = movs.filter(m => m.de === pasto.nome || m.para === pasto.nome)
  const { kg, dias, cd } = calcSal(pasto.id, animaisNoPasto.length, sal, pasto.taxaSal || 225)
  const salCor = dias < 3 ? T.red : dias < 7 ? T.orange : T.gLight
  const st = PS[pasto.status] || {}, es = PE[pasto.estado] || {}

  const [editM, setEditM] = useState(false)
  const [ef, setEf]       = useState({ ...pasto })

  const deletePasto    = () => { setPastos(p => p.filter(x => x.id !== pasto.id)); onBack() }
  const deleteSal      = id => setSal(s => s.filter(x => x.id !== id))
  const salvarEditPasto = () => {
    if (!ef.nome?.trim()) return
    setPastos(p => p.map(x => x.id === pasto.id
      ? { ...ef, tam: +ef.tam || 0, cap: +ef.cap || 0, taxaSal: +ef.taxaSal || 225 }
      : x))
    setEditM(false)
    onBack()
  }

  return (
    <DetailPage onBack={onBack} title={pasto.nome} icon="🌿" color={`linear-gradient(135deg,${T.gDark},${T.green})`}>

      <Section title="Informações do Pasto">
        <Card ch={<>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <Badge l={st.l} c={st.c} bg={st.bg} />
            <Badge l={es.l} c={es.c} bg={es.c + '22'} />
          </div>
          <InfoRow label="Tamanho"       value={`${pasto.tam} ${pasto.un}`} />
          <InfoRow label="Capacidade"    value={`${pasto.cap} animais`} />
          <InfoRow label="Animais atuais" value={String(animaisNoPasto.length)} />
          <InfoRow label="Taxa de sal"   value={`${pasto.taxaSal || 225} g/animal/dia`} />
          {pasto.obs && <div style={{ marginTop: 10, fontSize: 13, color: T.orange }}>📝 {pasto.obs}</div>}
        </>} />
      </Section>

      <Section title="🧂 Sal Mineral — Estoque atual">
        <Card ch={<>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
            {[['Estoque', `${kg.toFixed(1)} kg`], ['Duração', dias > 90 ? '>90d' : `${Math.round(dias)}d`], ['Consumo', `${cd.toFixed(1)}kg/d`]].map(([l, v]) => (
              <div key={l} style={{ background: T.bg, borderRadius: 10, padding: '8px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: T.gray, fontWeight: 700 }}>{l}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: salCor }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ background: T.bg, borderRadius: 8, height: 8, overflow: 'hidden' }}>
            <div style={{ background: salCor, height: '100%', width: `${Math.min(100, Math.max(0, (dias / 30) * 100))}%`, borderRadius: 8 }} />
          </div>
        </>} />
      </Section>

      <Section title={`📦 Histórico de Sal (${salDoPasto.length})`} empty={salDoPasto.length === 0 ? 'Nenhum registro de sal' : null}>
        {salDoPasto.map(s => (
          <Card key={s.id} ch={<>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, color: T.text }}>{s.sacos} sacos ({s.sacos * 30} kg)</div>
                <div style={{ fontSize: 12, color: T.gray }}>📅 {fmtD(s.data)}{s.obs ? ` · ${s.obs}` : ''}</div>
              </div>
              <button onClick={() => deleteSal(s.id)} style={{ background: '#FFE4E6', border: 'none', borderRadius: 8, padding: '6px 12px', color: T.red, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>🗑️</button>
            </div>
          </>} style={{ marginBottom: 8 }} />
        ))}
      </Section>

      <Section title={`🐄 Animais atuais (${animaisNoPasto.length})`} empty={animaisNoPasto.length === 0 ? 'Nenhum animal neste pasto' : null}>
        {animaisNoPasto.map(a => (
          <Card key={a.id} ch={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, color: T.text }}>{a.ident}</div>
                <div style={{ fontSize: 12, color: T.gray }}>{a.cat}{a.raca ? ` · ${a.raca}` : ''} {a.peso > 0 ? `· ⚖️${a.peso}kg` : ''}</div>
              </div>
              <span style={{ fontSize: 13, color: T.gray }}>{a.sexo === 'M' ? '♂' : '♀'}</span>
            </div>
          } style={{ marginBottom: 8 }} />
        ))}
      </Section>

      <Section title={`🔄 Movimentações (${movsDoPasto.length})`} empty={movsDoPasto.length === 0 ? 'Nenhuma movimentação' : null}>
        {[...movsDoPasto].sort((a, b) => b.data.localeCompare(a.data)).map(m => (
          <Card key={m.id} ch={<>
            <div style={{ fontWeight: 700, color: T.text, marginBottom: 4 }}>
              {m.ident} <span style={{ fontSize: 11, color: m.para === pasto.nome ? T.green : T.red }}>{m.para === pasto.nome ? 'entrou' : 'saiu'}</span>
            </div>
            <div style={{ fontSize: 12, color: T.gray }}>📅 {fmtD(m.data)} · {m.de} → {m.para}</div>
            {m.obs && <div style={{ fontSize: 11, color: T.orange, marginTop: 3 }}>📝 {m.obs}</div>}
          </>} style={{ marginBottom: 8 }} />
        ))}
      </Section>

      <Section title={`💉 Manejos recentes (${manejosDoPasto.length})`} empty={manejosDoPasto.length === 0 ? 'Nenhum manejo' : null}>
        {[...manejosDoPasto].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5).map(m => {
          const ti = TM.find(t => t.v === m.tipoManejo) || { icon: '💉', c: T.gray }
          return (
            <Card key={m.id} ch={<>
              <div style={{ fontWeight: 700, color: T.text }}>{ti.icon} {m.nomeManejo}</div>
              <div style={{ fontSize: 12, color: T.gray }}>📅 {fmtD(m.data)}{m.dose ? ` · ${m.dose}` : ''}</div>
            </>} style={{ marginBottom: 8 }} />
          )
        })}
      </Section>

      <Btn l="✏️ Editar Pasto" color={T.blue} onClick={() => { setEf({ ...pasto }); setEditM(true) }} style={{ marginBottom: 10 }} />
      <DeleteBtn label="este pasto" onConfirm={deletePasto} />
      <div style={{ height: 20 }} />

      <Modal open={editM} onClose={() => setEditM(false)} title="✏️ Editar Pasto">
        <Inp label="Nome *" value={ef.nome} onChange={v => setEf(e => ({ ...e, nome: v }))} />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
          <Inp label="Tamanho" value={ef.tam} onChange={v => setEf(e => ({ ...e, tam: v }))} type="number" />
          <Sel label="Unidade" value={ef.un} onChange={v => setEf(e => ({ ...e, un: v }))} opts={[{ v: 'ha', l: 'ha' }, { v: 'ac', l: 'ac' }, { v: 'm²', l: 'm²' }]} />
        </div>
        <Inp label="Capacidade (animais)" value={ef.cap} onChange={v => setEf(e => ({ ...e, cap: v }))} type="number" />
        <Sel label="Status"  value={ef.status}  onChange={v => setEf(e => ({ ...e, status: v }))}  opts={Object.entries(PS).map(([k, v]) => ({ v: k, l: v.l }))} />
        <Sel label="Estado"  value={ef.estado}  onChange={v => setEf(e => ({ ...e, estado: v }))}  opts={Object.entries(PE).map(([k, v]) => ({ v: k, l: v.l }))} />
        <Inp label="Taxa de sal (g/animal/dia)" value={ef.taxaSal || 225} onChange={v => setEf(e => ({ ...e, taxaSal: v }))} type="number" />
        <Inp label="Observações" value={ef.obs} onChange={v => setEf(e => ({ ...e, obs: v }))} placeholder="Opcional..." />
        <Btn l="💾 Salvar Alterações" onClick={salvarEditPasto} dis={!ef.nome?.trim()} />
      </Modal>
    </DetailPage>
  )
}

// ═══ PASTOS (lista + abas Pastos / Sal) ═══════════════════════════
export function Pastos({ pastos, setPastos, animais, sal, setSal, manejos, movs }) {
  const T = useT()
  const [aba, setAba]             = useState('pastos')
  const [filtro, setFiltro]       = useState('todos')
  const [addM, setAddM]           = useState(false)
  const [editM, setEditM]         = useState(null)
  const [detailPasto, setDetailPasto] = useState(null)
  const [mapa, setMapa]           = useState(false)
  const [mapaDest, setMapaDest]   = useState('')
  const [salModal, setSalModal]   = useState(false)

  const eF  = { nome: '', tam: '', un: 'ha', cap: '', estado: 'bom', status: 'vazio', obs: '', taxaSal: '225' }
  const eFS = { pastoId: '', sacos: '', data: TODAY, obs: '' }

  const [form,  setForm]  = useState(eF)
  const [formS, setFormS] = useState(eFS)

  const oc       = pastos.filter(p => p.status === 'ocupado')
  const animN    = id => animais.filter(a => a.pastoId === id && a.status === 'ativo').length
  const filtrados = filtro === 'todos' ? pastos : pastos.filter(p => p.status === filtro)

  const addPasto = () => {
    if (!form.nome.trim()) return
    setPastos(p => [...p, { ...form, id: Date.now(), tam: +form.tam || 0, cap: +form.cap || 0, taxaSal: +form.taxaSal || 225 }])
    setAddM(false); setForm(eF)
  }

  const salvarEdit = () => {
    if (!editM?.nome?.trim()) return
    setPastos(p => p.map(x => x.id === editM.id ? { ...editM, tam: +editM.tam, cap: +editM.cap, taxaSal: +editM.taxaSal } : x))
    setEditM(null)
  }

  const aplicarArea = ha => {
    const v = ha.toFixed(2)
    if (mapaDest === 'add')  setForm(f => ({ ...f, tam: v }))
    if (mapaDest === 'edit') setEditM(e => ({ ...e, tam: v }))
    setMapa(false)
  }

  const addSal = () => {
    if (!formS.pastoId || !formS.sacos) return
    setSal(s => [...s, { ...formS, id: Date.now(), pastoId: +formS.pastoId, sacos: +formS.sacos }])
    setSalModal(false); setFormS(eFS)
  }

  if (detailPasto) return (
    <PastoDetailPage
      pasto={detailPasto} onBack={() => setDetailPasto(null)}
      animais={animais} sal={sal} setSal={setSal}
      manejos={manejos} movs={movs}
      setPastos={setPastos} pastos={pastos}
    />
  )

  return (
    <div style={{ paddingBottom: 100 }}>
      {mapa && <MapaMedicao onAplicar={aplicarArea} onFechar={() => setMapa(false)} />}

      <PgH sub="Gestão de" title="Pastos 🌿" extra={<Badge l={`${pastos.length} pastos`} c='#FFF' bg='rgba(255,255,255,0.25)' />} />

      {/* Tabs */}
      <div style={{ display: 'flex', background: T.gDark, padding: '0 16px', gap: 4 }}>
        {[['pastos', '🌿 Pastos'], ['sal', '🧂 Sal']].map(([id, lbl]) => (
          <button key={id} onClick={() => setAba(id)} style={{
            flex: 1, border: 'none', background: 'none',
            color: aba === id ? '#FFF' : 'rgba(255,255,255,0.45)',
            fontWeight: aba === id ? 600 : 400,
            fontSize: 14, padding: '13px 0', cursor: 'pointer',
            borderBottom: aba === id ? '2.5px solid #FFF' : '2.5px solid transparent',
            letterSpacing: '-0.1px'
          }}>{lbl}</button>
        ))}
      </div>

      {/* Aba Pastos */}
      {aba === 'pastos' && (
        <div style={{ padding: '12px 14px 0' }}>
          {/* Filtros de status */}
          <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 10, scrollbarWidth: 'none' }}>
            {['todos', ...Object.keys(PS)].map(f => (
              <button key={f} onClick={() => setFiltro(f)} style={{
                border: 'none', borderRadius: 20, padding: '7px 14px', fontSize: 12, fontWeight: 600,
                background: filtro === f ? T.green : T.gPale,
                color: filtro === f ? '#FFF' : T.green,
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0
              }}>
                {f === 'todos' ? `Todos (${pastos.length})` : PS[f]?.l}
              </button>
            ))}
          </div>

          {/* Cards de pasto */}
          {filtrados.map(p => {
            const st  = PS[p.status] || {}, es = PE[p.estado] || {}
            const qtd = animN(p.id)
            const oc2 = p.cap > 0 ? (qtd / p.cap) * 100 : 0
            return (
              <Card key={p.id} onClick={() => setDetailPasto(p)} ch={<>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: T.text }}>{p.nome}</div>
                    <div style={{ fontSize: 12, color: T.gray, marginTop: 2 }}>
                      {p.tam} {p.un} · Cap. {p.cap} <span style={{ color: T.gray, fontSize: 10 }}>• Toque para detalhes</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                    <Badge l={st.l} c={st.c} bg={st.bg} />
                    <Badge l={es.l} c={es.c} bg={es.c + '22'} />
                  </div>
                </div>
                {p.status === 'ocupado' && p.cap > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: T.gray }}>Ocupação</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.text }}>{qtd}/{p.cap}</span>
                    </div>
                    <div style={{ background: T.bg, borderRadius: 4, height: 6, overflow: 'hidden' }}>
                      <div style={{ background: oc2 > 90 ? T.red : oc2 > 70 ? T.orange : T.gLight, height: '100%', width: `${Math.min(100, oc2)}%`, borderRadius: 4 }} />
                    </div>
                  </div>
                )}
                {p.obs && <div style={{ fontSize: 11, color: T.orange, marginTop: 7 }}>📝 {p.obs}</div>}
              </>} />
            )
          })}

          <Btn l="+ Adicionar Pasto" onClick={() => { setForm(eF); setAddM(true) }} />
        </div>
      )}

      {/* Aba Sal */}
      {aba === 'sal' && (
        <div style={{ padding: '12px 14px 0' }}>
          {oc.map(p => {
            const n = animais.filter(a => a.pastoId === p.id && a.status === 'ativo').length
            const { kg, dias, cd } = calcSal(p.id, n, sal, p.taxaSal || 225)
            const cor = dias < 3 ? T.red : dias < 7 ? T.orange : T.gLight
            const sta = dias < 3 ? '🚨 Crítico' : dias < 7 ? '⚠️ Baixo' : '✅ OK'
            const pct = Math.min(100, Math.max(0, (dias / 30) * 100))
            return (
              <Card key={p.id} onClick={() => setDetailPasto(p)} ch={<>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{p.nome}</div>
                    <div style={{ fontSize: 11, color: T.gray }}>{n} animais · {cd.toFixed(1)} kg/dia</div>
                  </div>
                  <Badge l={sta} c={cor} bg={cor + '18'} />
                </div>
                <div style={{ background: T.bg, borderRadius: 8, height: 9, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ background: cor, height: '100%', width: `${pct}%`, borderRadius: 8 }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                  {[['Estoque', `${kg.toFixed(1)} kg`], ['Duração', dias > 90 ? '>90d' : `${Math.round(dias)}d`], ['Taxa', `${p.taxaSal || 225}g`]].map(([l, v]) => (
                    <div key={l} style={{ background: T.bg, borderRadius: 8, padding: '7px 5px', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: T.gray, fontWeight: 700 }}>{l}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.text }}>{v}</div>
                    </div>
                  ))}
                </div>
              </>} />
            )
          })}

          <Btn l="+ Registrar Sacos de Sal" icon="🧂" onClick={() => { setFormS(f => ({ ...f, pastoId: String(oc[0]?.id || '') })); setSalModal(true) }} />

          <Modal open={salModal} onClose={() => setSalModal(false)} title="Repor Sal Mineral">
            <Sel label="Pasto" value={formS.pastoId} onChange={v => setFormS(f => ({ ...f, pastoId: v }))} opts={[{ v: '', l: 'Selecionar...' }, ...oc.map(p => ({ v: String(p.id), l: p.nome }))]} />
            <Inp label="Sacos (30 kg/saco)" value={formS.sacos} onChange={v => setFormS(f => ({ ...f, sacos: v }))} type="number" placeholder="3" />
            <Inp label="Data"  value={formS.data} onChange={v => setFormS(f => ({ ...f, data: v }))}  type="date" />
            <Inp label="Observações" value={formS.obs} onChange={v => setFormS(f => ({ ...f, obs: v }))} placeholder="Opcional..." />
            <Btn l="💾 Salvar Reposição" onClick={addSal} dis={!formS.pastoId || !formS.sacos} />
          </Modal>
        </div>
      )}

      {/* Modal Novo Pasto */}
      <Modal open={addM} onClose={() => setAddM(false)} title="Novo Pasto">
        <Inp label="Nome *" value={form.nome} onChange={v => setForm(f => ({ ...f, nome: v }))} placeholder="Ex: Pasto Norte" />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
          <Inp label="Tamanho" value={form.tam} onChange={v => setForm(f => ({ ...f, tam: v }))} type="number" placeholder="45" />
          <Sel label="Unidade" value={form.un}  onChange={v => setForm(f => ({ ...f, un: v }))}  opts={[{ v: 'ha', l: 'ha' }, { v: 'ac', l: 'ac' }, { v: 'm²', l: 'm²' }]} />
        </div>
        <button onClick={() => { setMapaDest('add'); setMapa(true) }} style={{ width: '100%', background: T.gPale, border: `1.5px dashed ${T.gLight}`, borderRadius: 10, padding: 11, fontSize: 13, fontWeight: 600, color: T.green, cursor: 'pointer', marginBottom: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          🛰️ Medir no satélite {form.tam ? `· ${form.tam} ha` : ''}
        </button>
        <Inp label="Capacidade" value={form.cap} onChange={v => setForm(f => ({ ...f, cap: v }))} type="number" placeholder="80" />
        <Sel label="Status" value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} opts={Object.entries(PS).map(([k, v]) => ({ v: k, l: v.l }))} />
        <Sel label="Estado" value={form.estado} onChange={v => setForm(f => ({ ...f, estado: v }))} opts={Object.entries(PE).map(([k, v]) => ({ v: k, l: v.l }))} />
        <Inp label="Taxa de sal (g/dia)" value={form.taxaSal} onChange={v => setForm(f => ({ ...f, taxaSal: v }))} type="number" placeholder="225" />
        <Inp label="Observações" value={form.obs} onChange={v => setForm(f => ({ ...f, obs: v }))} placeholder="Opcional..." />
        <Btn l="💾 Salvar Pasto" onClick={addPasto} dis={!form.nome.trim()} />
      </Modal>

      {/* Modal Editar Pasto */}
      <Modal open={!!editM} onClose={() => setEditM(null)} title="Editar Pasto">
        {editM && <>
          <Inp label="Nome" value={editM.nome} onChange={v => setEditM(e => ({ ...e, nome: v }))} />
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
            <Inp label="Tamanho" value={editM.tam} onChange={v => setEditM(e => ({ ...e, tam: v }))} type="number" />
            <Sel label="Unidade" value={editM.un}  onChange={v => setEditM(e => ({ ...e, un: v }))}  opts={[{ v: 'ha', l: 'ha' }, { v: 'ac', l: 'ac' }, { v: 'm²', l: 'm²' }]} />
          </div>
          <button onClick={() => { setMapaDest('edit'); setMapa(true) }} style={{ width: '100%', background: T.gPale, border: `1.5px dashed ${T.gLight}`, borderRadius: 10, padding: 11, fontSize: 13, fontWeight: 600, color: T.green, cursor: 'pointer', marginBottom: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            🛰️ Medir
          </button>
          <Inp label="Capacidade" value={editM.cap} onChange={v => setEditM(e => ({ ...e, cap: v }))} type="number" />
          <Sel label="Status" value={editM.status} onChange={v => setEditM(e => ({ ...e, status: v }))} opts={Object.entries(PS).map(([k, v]) => ({ v: k, l: v.l }))} />
          <Sel label="Estado" value={editM.estado} onChange={v => setEditM(e => ({ ...e, estado: v }))} opts={Object.entries(PE).map(([k, v]) => ({ v: k, l: v.l }))} />
          <Inp label="Taxa de sal" value={editM.taxaSal || 225} onChange={v => setEditM(e => ({ ...e, taxaSal: +v }))} type="number" />
          <Inp label="Observações" value={editM.obs} onChange={v => setEditM(e => ({ ...e, obs: v }))} />
          <Btn l="💾 Salvar" onClick={salvarEdit} />
        </>}
      </Modal>
    </div>
  )
}
