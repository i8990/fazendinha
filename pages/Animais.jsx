// ═══ ANIMAIS — rebanho, bezerros e pastos ══════════════════════════
import { useState }                          from 'react'
import { useT, PS, TM }                      from '../constants.js'
import { TODAY, fmtD, calcIdade }            from '../utils.js'
import { Card, Badge, Btn, Inp, Sel, Modal,
         DetailPage, Section, InfoRow,
         DeleteBtn, PgH }                    from '../ui.jsx'
import { Pastos }                            from './Pastos.jsx'
import { HistoricoManejo }                   from './Historico.jsx'

// ═══ ANIMAL DETAIL PAGE ═══════════════════════════════════════════
export function AnimalDetailPage({ animal, onBack, animais, pastos, movs, manejos, setAnimais, setMovs }) {
  const T = useT()
  const id          = calcIdade(animal.dataNasc)
  const mae         = animal.maeId ? animais.find(a => a.id === animal.maeId) : null
  const pasto       = pastos.find(p => p.id === animal.pastoId)
  const movAnimal   = [...movs.filter(m => m.ident === animal.ident)].sort((a, b) => b.data.localeCompare(a.data))
  const manejoAnimal = [...manejos.filter(m => m.animaisIds?.includes(animal.id))].sort((a, b) => b.data.localeCompare(a.data))
  const filhos      = animais.filter(a => a.maeId === animal.id)
  const vacas       = animais.filter(a => a.status === 'ativo' && (a.cat === 'Vaca' || a.cat === 'Novilha') && a.id !== animal.id)

  const [moveM, setMoveM] = useState(false)
  const [dest,  setDest]  = useState('')
  const [obsM,  setObsM]  = useState('')
  const [editM, setEditM] = useState(false)
  const [ef,    setEf]    = useState({ ...animal })

  const nomePasto = id2 => pastos.find(p => p.id === id2)?.nome || '—'

  const mover = () => {
    if (!dest) return
    setMovs(m => [{ id: Date.now(), ident: animal.ident, de: nomePasto(animal.pastoId), para: nomePasto(+dest), data: TODAY, obs: obsM }, ...m])
    setAnimais(a => a.map(x => x.id === animal.id ? { ...x, pastoId: +dest } : x))
    setMoveM(false); setDest(''); setObsM(''); onBack()
  }

  const deleteAnimal = () => { setAnimais(a => a.filter(x => x.id !== animal.id)); onBack() }

  const salvarEditAnimal = () => {
    if (!ef.ident?.trim()) return
    setAnimais(a => a.map(x => x.id === animal.id
      ? { ...ef, peso: +ef.peso || 0, pastoId: ef.pastoId ? +ef.pastoId : null, maeId: ef.maeId ? +ef.maeId : null }
      : x))
    setEditM(false); onBack()
  }

  const corTopo = animal.sexo === 'M'
    ? `linear-gradient(135deg,${T.blueMid},${T.bLight})`
    : `linear-gradient(135deg,${T.pinkDark},${T.pink})`

  return (
    <DetailPage onBack={onBack} title={animal.ident} icon={animal.cat === 'Bezerro' ? '🐮' : animal.sexo === 'M' ? '🐂' : '🐄'} color={corTopo}>
      <Section title="Dados do Animal">
        <Card ch={<>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <Badge l={animal.cat} c={T.green} bg={T.gPale} />
            <Badge l={animal.sexo === 'M' ? '♂ Macho' : '♀ Fêmea'} c={animal.sexo === 'M' ? T.blueMid : T.pinkDark} bg={animal.sexo === 'M' ? T.bluePale : T.pinkPale} />
          </div>
          <InfoRow label="Raça"        value={animal.raca} />
          <InfoRow label="Lote"        value={animal.lote} />
          <InfoRow label="Peso"        value={animal.peso > 0 ? `${animal.peso} kg` : null} />
          <InfoRow label="Pasto atual" value={pasto?.nome} color={T.green} />
          {animal.dataNasc && <InfoRow label="Nascimento" value={fmtD(animal.dataNasc)} />}
          {id && <InfoRow label="Idade" value={id.label} color={id.cor} />}
          {mae && <InfoRow label="Mãe" value={mae.ident} />}
          {animal.obs && <div style={{ marginTop: 10, fontSize: 13, color: T.orange }}>📝 {animal.obs}</div>}
        </>} />
      </Section>

      {filhos.length > 0 && (
        <Section title={`🐮 Filhos (${filhos.length})`}>
          {filhos.map(f => {
            const fi = calcIdade(f.dataNasc)
            return (
              <Card key={f.id} ch={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: T.text }}>
                      {f.ident} <span style={{ fontSize: 11, color: f.sexo === 'M' ? T.blueMid : T.pinkDark }}>{f.sexo === 'M' ? '♂' : '♀'}</span>
                    </div>
                    <div style={{ fontSize: 12, color: T.gray }}>{fi ? fi.label : '—'}</div>
                  </div>
                </div>
              } style={{ marginBottom: 8 }} />
            )
          })}
        </Section>
      )}

      <Section title={`🔄 Movimentações (${movAnimal.length})`} empty={movAnimal.length === 0 ? 'Nenhuma movimentação' : null}>
        {movAnimal.map(m => (
          <Card key={m.id} ch={<>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontWeight: 700, color: T.text, fontSize: 13 }}>📅 {fmtD(m.data)}</span>
            </div>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center', fontSize: 13, background: T.bg, borderRadius: 8, padding: '6px 10px' }}>
              <span style={{ color: T.red,   fontWeight: 600 }}>📍 {m.de}</span>
              <span style={{ color: T.gray }}>→</span>
              <span style={{ color: T.green, fontWeight: 600 }}>📍 {m.para}</span>
            </div>
            {m.obs && <div style={{ fontSize: 11, color: T.orange, marginTop: 4 }}>📝 {m.obs}</div>}
          </>} style={{ marginBottom: 8 }} />
        ))}
      </Section>

      <Section title={`💉 Manejos (${manejoAnimal.length})`} empty={manejoAnimal.length === 0 ? 'Nenhum manejo' : null}>
        {manejoAnimal.map(m => {
          const ti = TM.find(t => t.v === m.tipoManejo) || { icon: '💉', c: T.gray }
          return (
            <Card key={m.id} ch={<>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, color: T.text }}>{ti.icon} {m.nomeManejo}</div>
                  <div style={{ fontSize: 12, color: T.gray }}>📅 {fmtD(m.data)}{m.dose ? ` · ${m.dose}` : ''}</div>
                </div>
                <Badge l={ti.icon} c={ti.c} bg={ti.c + '18'} />
              </div>
              {m.obs && <div style={{ fontSize: 11, color: T.gray, marginTop: 4 }}>📝 {m.obs}</div>}
            </>} style={{ marginBottom: 8 }} />
          )
        })}
      </Section>

      <Btn l="✏️ Editar Animal"  color={T.blue}  onClick={() => { setEf({ ...animal, peso: animal.peso || '', pastoId: animal.pastoId ? String(animal.pastoId) : '', maeId: animal.maeId ? String(animal.maeId) : '' }); setEditM(true) }} style={{ marginBottom: 10 }} />
      <Btn l="🌿 Mover de Pasto" color={T.green} onClick={() => setMoveM(true)} style={{ marginBottom: 10 }} />
      <DeleteBtn label={animal.ident} onConfirm={deleteAnimal} />
      <div style={{ height: 20 }} />

      <Modal open={moveM} onClose={() => setMoveM(false)} title={`Mover ${animal.ident}`}>
        <div style={{ background: T.gPale, borderRadius: 12, padding: 11, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, color: T.text }}>{animal.ident}</div>
          <div style={{ fontSize: 12, color: T.gray }}>📍 {nomePasto(animal.pastoId)}</div>
        </div>
        <Sel label="Destino" value={dest} onChange={setDest}
          opts={[{ v: '', l: 'Selecionar pasto...' }, ...pastos.filter(p => p.id !== animal.pastoId).map(p => ({ v: String(p.id), l: `${p.nome} · ${PS[p.status]?.l}` }))]}
        />
        <Inp label="Observação" value={obsM} onChange={setObsM} placeholder="Motivo..." />
        <Btn l="✅ Confirmar" onClick={mover} dis={!dest} />
      </Modal>

      <Modal open={editM} onClose={() => setEditM(false)} title="✏️ Editar Animal">
        <Sel label="Categoria" value={ef.cat} onChange={v => setEf(e => ({ ...e, cat: v }))} opts={['Boi', 'Vaca', 'Novilha', 'Bezerro', 'Touro'].map(v => ({ v, l: v }))} />
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.gray, marginBottom: 7, textTransform: 'uppercase' }}>Sexo</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[['M', '♂ Macho', T.blueMid, T.bluePale], ['F', '♀ Fêmea', T.pinkDark, T.pinkPale]].map(([v, l, c, bg]) => (
              <button key={v} onClick={() => setEf(e => ({ ...e, sexo: v }))} style={{ border: `2.5px solid ${ef.sexo === v ? c : T.border}`, borderRadius: 11, padding: '11px 0', fontWeight: 700, fontSize: 13, cursor: 'pointer', background: ef.sexo === v ? bg : T.card, color: ef.sexo === v ? c : T.gray }}>{l}</button>
            ))}
          </div>
        </div>
        <Inp label="Identificador *" value={ef.ident} onChange={v => setEf(e => ({ ...e, ident: v }))} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Inp label="Raça" value={ef.raca} onChange={v => setEf(e => ({ ...e, raca: v }))} />
          <Inp label="Lote" value={ef.lote} onChange={v => setEf(e => ({ ...e, lote: v }))} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Inp label="Peso (kg)"    value={ef.peso}     onChange={v => setEf(e => ({ ...e, peso: v }))}     type="number" />
          <Inp label="Nascimento"   value={ef.dataNasc} onChange={v => setEf(e => ({ ...e, dataNasc: v }))} type="date" />
        </div>
        <Sel label="Pasto" value={ef.pastoId} onChange={v => setEf(e => ({ ...e, pastoId: v }))}
          opts={[{ v: '', l: 'Sem pasto' }, ...pastos.map(p => ({ v: String(p.id), l: p.nome }))]}
        />
        <Sel label="Mãe" value={ef.maeId} onChange={v => setEf(e => ({ ...e, maeId: v }))}
          opts={[{ v: '', l: 'Nenhuma' }, ...vacas.map(v => ({ v: String(v.id), l: `${v.ident}${v.raca ? ' · ' + v.raca : ''}` }))]}
        />
        <Inp label="Observações" value={ef.obs} onChange={v => setEf(e => ({ ...e, obs: v }))} placeholder="Opcional..." />
        <Btn l="💾 Salvar Alterações" onClick={salvarEditAnimal} dis={!ef.ident?.trim()} />
      </Modal>
    </DetailPage>
  )
}

// ═══ ANIMAIS (lista rebanho, bezerros e pastos) ════════════════════
export function Animais({ animais, setAnimais, pastos, setPastos, movs, setMovs, sal, setSal, manejos, setManejos, fin, setFin }) {
  const T = useT()
  const [aba,          setAba]         = useState('rebanho')
  const [addM,         setAddM]        = useState(false)
  const [busca,        setBusca]       = useState('')
  const [detailAnimal, setDetailAnimal] = useState(null)

  const vacas   = animais.filter(a => a.status === 'ativo' && (a.cat === 'Vaca' || a.cat === 'Novilha'))
  const eF      = { ident: '', cat: 'Boi', raca: '', lote: 'A', pastoId: '', peso: '', obs: '', sexo: 'M', dataNasc: '', maeId: '' }
  const [form, setForm] = useState(eF)

  const ativos   = animais.filter(a => a.status === 'ativo')
  const rebanho  = ativos.filter(a => a.cat !== 'Bezerro')
  const bezerros = ativos.filter(a => a.cat === 'Bezerro')

  const filtrR = busca ? rebanho.filter(a => a.ident.toLowerCase().includes(busca.toLowerCase()) || a.lote.toLowerCase().includes(busca.toLowerCase())) : rebanho
  const filtrB = busca ? bezerros.filter(a => a.ident.toLowerCase().includes(busca.toLowerCase())) : bezerros
  const bezOrd = [...filtrB].sort((a, b) => { if (a.dataNasc && b.dataNasc) return b.dataNasc.localeCompare(a.dataNasc); if (a.dataNasc) return -1; return 1 })

  const nomePasto = id => pastos.find(p => p.id === id)?.nome || '—'
  const cI = { Boi: '🐂', Vaca: '🐄', Novilha: '🐄', Bezerro: '🐮', Touro: '🐂' }

  const addAnimal = () => {
    if (!form.ident.trim()) return
    setAnimais(a => [...a, { ...form, id: Date.now(), status: 'ativo', pastoId: form.pastoId ? +form.pastoId : null, peso: +form.peso || 0, maeId: form.maeId ? +form.maeId : null }])
    setAddM(false); setForm(eF)
  }

  if (detailAnimal) {
    const fresh = animais.find(a => a.id === detailAnimal.id)
    if (!fresh) return null
    return <AnimalDetailPage animal={fresh} onBack={() => setDetailAnimal(null)} animais={animais} pastos={pastos} movs={movs} manejos={manejos} setAnimais={setAnimais} setMovs={setMovs} />
  }

  const TABS = [
    { id: 'rebanho',  label: `🐄 Rebanho (${rebanho.length})`   },
    { id: 'bezerros', label: `🐮 Bezerros (${bezerros.length})`  },
    { id: 'pastos',   label: `🌿 Pastos (${pastos.length})`      },
    { id: 'manejo',   label: '📋 Manejo'                        },
  ]

  return (
    <div style={{ paddingBottom: 100 }}>
      <PgH sub="Gestão de" title="Animais 🐄" extra={
        <div style={{ display: 'flex', gap: 5 }}>
          <Badge l={`${rebanho.length} reb.`}  c='#FFF' bg='rgba(255,255,255,0.2)' />
          <Badge l={`${bezerros.length} bez.`} c='#FFF' bg='rgba(255,255,255,0.2)' />
        </div>
      } />

      {/* Tabs */}
      <div style={{ display: 'flex', background: T.gDark, padding: '0 16px', gap: 4, overflowX: 'auto' }}>
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setAba(id)} style={{
            flexShrink: 0, border: 'none', background: 'none',
            color: aba === id ? '#FFF' : 'rgba(255,255,255,0.45)',
            fontWeight: aba === id ? 600 : 400, fontSize: 13,
            padding: '13px 8px', cursor: 'pointer',
            borderBottom: aba === id ? '2.5px solid #FFF' : '2.5px solid transparent',
            whiteSpace: 'nowrap'
          }}>{label}</button>
        ))}
      </div>

      {/* Aba Pastos — renderiza o componente Pastos completo */}
      {aba === 'pastos' && (
        <Pastos
          pastos={pastos}   setPastos={setPastos}
          animais={animais} sal={sal} setSal={setSal}
          manejos={manejos} movs={movs}
        />
      )}

      {/* Aba Manejo */}
      {aba === 'manejo' && (
        <HistoricoManejo
          movs={movs}       setMovs={setMovs}
          manejos={manejos} setManejos={setManejos}
          animais={animais} fin={fin} setFin={setFin}
          pastos={pastos}
        />
      )}

      {/* Abas Rebanho e Bezerros */}
      {aba !== 'pastos' && (
        <div style={{ padding: '12px 14px 0' }}>
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="🔍 Buscar..."
            style={{ width: '100%', border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '11px 13px', fontSize: 14, outline: 'none', background: T.card, color: T.text, marginBottom: 11 }}
          />

          {aba === 'rebanho' && <>
            {filtrR.map(a => (
              <Card key={a.id} onClick={() => setDetailAnimal(a)} ch={<>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
                    <div style={{ fontSize: 32, flexShrink: 0 }}>{cI[a.cat] || '🐄'}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: T.text }}>{a.ident}</div>
                      <div style={{ fontSize: 12, color: T.gray }}>{a.cat}{a.raca ? ` · ${a.raca}` : ''} · Lote {a.lote}</div>
                      <div style={{ fontSize: 11, color: T.green, marginTop: 2 }}>📍 {nomePasto(a.pastoId)}</div>
                      {a.peso > 0 && <div style={{ fontSize: 11, color: T.gray }}>⚖️ {a.peso}kg</div>}
                    </div>
                  </div>
                  <span style={{ color: T.gray, fontSize: 18 }}>›</span>
                </div>
                {a.obs && <div style={{ fontSize: 11, color: T.orange, marginTop: 5 }}>📝 {a.obs}</div>}
              </>} />
            ))}
            {filtrR.length === 0 && busca && <div style={{ textAlign: 'center', padding: 20, color: T.gray }}>Nenhum resultado</div>}
          </>}

          {aba === 'bezerros' && <>
            {bezerros.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7, marginBottom: 12 }}>
                {[['Total', bezerros.length, T.text, T.bg], ['♂ Machos', bezerros.filter(b => b.sexo === 'M').length, T.blueMid, T.bluePale], ['♀ Fêmeas', bezerros.filter(b => b.sexo === 'F').length, T.pinkDark, T.pinkPale]].map(([l, v, c, bg]) => (
                  <div key={l} style={{ background: bg, borderRadius: 12, padding: '9px 6px', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: c }}>{v}</div>
                    <div style={{ fontSize: 10, color: c, fontWeight: 700 }}>{l}</div>
                  </div>
                ))}
              </div>
            )}
            {bezOrd.length === 0 && (
              <div style={{ textAlign: 'center', padding: '36px 20px', color: T.gray }}>
                <div style={{ fontSize: 44 }}>🐮</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 10 }}>Nenhum bezerro</div>
              </div>
            )}
            {bezOrd.map(b => {
              const id   = calcIdade(b.dataNasc)
              const fase = !id ? null : id.dias < 30 ? 'Neonato' : id.dias < 90 ? 'Lactente' : id.dias < 210 ? 'Desmame' : 'Recria'
              const mae  = b.maeId ? animais.find(a => a.id === b.maeId) : null
              return (
                <div key={b.id} onClick={() => setDetailAnimal(b)} style={{ background: T.card, borderRadius: 16, marginBottom: 11, boxShadow: `0 2px 8px ${T.shadow}`, overflow: 'hidden', cursor: 'pointer' }}>
                  <div style={{ background: b.sexo === 'M' ? `linear-gradient(135deg,${T.blueMid},${T.bLight})` : `linear-gradient(135deg,${T.pinkDark},${T.pink})`, padding: '7px 13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 20 }}>🐮</span>
                      <span style={{ color: '#FFF', fontWeight: 800, fontSize: 14 }}>{b.ident}</span>
                      <span style={{ background: 'rgba(255,255,255,0.25)', color: '#FFF', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{b.sexo === 'M' ? '♂' : '♀'}</span>
                    </div>
                    {fase && <span style={{ background: 'rgba(255,255,255,0.2)', color: '#FFF', borderRadius: 20, padding: '1px 9px', fontSize: 10, fontWeight: 700 }}>{fase}</span>}
                  </div>
                  <div style={{ padding: '10px 13px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 7 }}>
                      <div style={{ background: T.bg, borderRadius: 9, padding: '7px 9px' }}>
                        <div style={{ fontSize: 9, color: T.gray, fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>⏱ Idade</div>
                        {id ? <div style={{ fontWeight: 800, color: id.cor, fontSize: 14 }}>{id.label}</div> : <div style={{ color: T.gray, fontSize: 12 }}>—</div>}
                        {b.dataNasc && <div style={{ fontSize: 10, color: T.gray }}>📅 {fmtD(b.dataNasc)}</div>}
                      </div>
                      <div style={{ background: T.bg, borderRadius: 9, padding: '7px 9px' }}>
                        <div style={{ fontSize: 9, color: T.gray, fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>🐄 Mãe</div>
                        {mae ? <><div style={{ fontWeight: 700, color: T.text, fontSize: 13 }}>{mae.ident}</div><div style={{ fontSize: 10, color: T.gray }}>{mae.raca || '—'}</div></> : <div style={{ color: T.gray, fontSize: 12 }}>—</div>}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: T.green }}>📍 {pastos.find(p => p.id === b.pastoId)?.nome || 'Sem pasto'}{b.peso > 0 ? ` · ⚖️ ${b.peso}kg` : ''}</div>
                  </div>
                </div>
              )
            })}
          </>}

          <Btn l={`+ Cadastrar ${aba === 'bezerros' ? 'Bezerro' : 'Animal'}`} onClick={() => { setForm({ ...eF, cat: aba === 'bezerros' ? 'Bezerro' : 'Boi' }); setAddM(true) }} />
        </div>
      )}

      <Modal open={addM} onClose={() => setAddM(false)} title="Cadastrar Animal">
        <Sel label="Categoria" value={form.cat} onChange={v => setForm(f => ({ ...f, cat: v }))} opts={['Boi', 'Vaca', 'Novilha', 'Bezerro', 'Touro'].map(v => ({ v, l: v }))} />
        {form.cat === 'Bezerro' && (
          <div style={{ background: T.pinkPale, borderRadius: 12, padding: 12, marginBottom: 12 }}>
            <div style={{ fontWeight: 700, color: T.pinkDark, fontSize: 12, marginBottom: 10 }}>🐮 Dados do Bezerro</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              {[['M', '♂ Macho', T.blueMid, T.bluePale], ['F', '♀ Fêmea', T.pinkDark, T.pinkPale]].map(([v, l, c, bg]) => (
                <button key={v} onClick={() => setForm(f => ({ ...f, sexo: v }))} style={{ border: `2.5px solid ${form.sexo === v ? c : T.border}`, borderRadius: 11, padding: '11px 0', fontWeight: 700, fontSize: 13, cursor: 'pointer', background: form.sexo === v ? bg : T.card, color: form.sexo === v ? c : T.gray }}>{l}</button>
              ))}
            </div>
            <Inp label="📅 Data de nascimento" value={form.dataNasc} onChange={v => setForm(f => ({ ...f, dataNasc: v }))} type="date" />
            {form.dataNasc && (() => { const id = calcIdade(form.dataNasc); return id ? <div style={{ fontSize: 12, color: id.cor, fontWeight: 600, marginBottom: 11 }}>⏱ {id.label}</div> : null })()}
            <Sel label="🐄 Mãe" value={form.maeId} onChange={v => setForm(f => ({ ...f, maeId: v }))}
              opts={[{ v: '', l: 'Selecionar mãe...' }, ...vacas.map(v => ({ v: String(v.id), l: `${v.ident}${v.raca ? ' · ' + v.raca : ''}` }))]}
            />
          </div>
        )}
        {form.cat !== 'Bezerro' && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.gray, marginBottom: 7, textTransform: 'uppercase' }}>Sexo</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[['M', '♂ Macho', T.blueMid, T.bluePale], ['F', '♀ Fêmea', T.pinkDark, T.pinkPale]].map(([v, l, c, bg]) => (
                <button key={v} onClick={() => setForm(f => ({ ...f, sexo: v }))} style={{ border: `2.5px solid ${form.sexo === v ? c : T.border}`, borderRadius: 11, padding: '11px 0', fontWeight: 700, fontSize: 13, cursor: 'pointer', background: form.sexo === v ? bg : T.card, color: form.sexo === v ? c : T.gray }}>{l}</button>
              ))}
            </div>
          </div>
        )}
        <Inp label="Identificador *" value={form.ident} onChange={v => setForm(f => ({ ...f, ident: v }))} placeholder="Ex: BOI-023" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Inp label="Raça" value={form.raca} onChange={v => setForm(f => ({ ...f, raca: v }))} placeholder="Nelore" />
          <Inp label="Lote" value={form.lote} onChange={v => setForm(f => ({ ...f, lote: v }))} placeholder="A" />
        </div>
        <Inp label="Peso (kg)" value={form.peso} onChange={v => setForm(f => ({ ...f, peso: v }))} type="number" placeholder="480" />
        <Sel label="Pasto" value={form.pastoId} onChange={v => setForm(f => ({ ...f, pastoId: v }))}
          opts={[{ v: '', l: 'Selecionar...' }, ...pastos.map(p => ({ v: String(p.id), l: p.nome }))]}
        />
        <Inp label="Observações" value={form.obs} onChange={v => setForm(f => ({ ...f, obs: v }))} placeholder="Opcional..." />
        <Btn l="💾 Salvar Animal" onClick={addAnimal} dis={!form.ident.trim()} />
      </Modal>
    </div>
  )
}
