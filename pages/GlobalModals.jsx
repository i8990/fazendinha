// ═══ GLOBAL MODALS — ações rápidas do Dashboard ══════════════════
// Três quick-actions acessíveis de qualquer tela via globalAction state:
//   'sal'        → registrar sal mineral
//   'nascimento' → registrar nascimento de bezerro
//   'pasto'      → mover animal de pasto
//
// Props:
//   action      : string — qual modal abrir
//   onClose()   : fecha o modal
//   pastos      : array
//   animais     : array
//   setAnimais  : setter instrumentado
//   setSal      : setter instrumentado
//   setMovs     : setter instrumentado

import { useState, useMemo }                  from 'react'
import { useT }                               from '../constants.js'
import { TODAY, calcIdade }                   from '../utils.js'
import { saveCfg, dbGet }                      from '../storage.js'
import { Modal, Btn, Inp, Sel }               from '../ui.jsx'

export function GlobalModals({ action, onClose, pastos, animais, setAnimais, setSal, setMovs, fin, setFin, setManejos }) {
  const T = useT()

  const oc     = pastos.filter(p => p.status === 'ocupado')
  const ativos = animais.filter(a => a.status === 'ativo')
  const vacas  = ativos.filter(a => a.cat === 'Vaca' || a.cat === 'Novilha')

  const nomePasto = id => pastos.find(p => p.id === id)?.nome || 'Sem pasto'

  // ── Estado: sal ────────────────────────────────────────────────
  const [fS, setFS] = useState({
    pastoId: String(oc[0]?.id || ''),
    sacos: '', data: TODAY, obs: ''
  })

  // ── Estado: nascimento ─────────────────────────────────────────
  const [fN, setFN] = useState({
    ident: '', sexo: 'M', dataNasc: TODAY,
    raca: '', peso: '', maeId: '',
    pastoId: String(oc[0]?.id || ''), lote: 'B', obs: ''
  })

  // ── Estado: mover pasto ────────────────────────────────────────
  const [pBusca, setPBusca] = useState('')
  const [pAnimal, setPAnimal] = useState('')
  const [pDest, setPDest]   = useState('')
  const [pObs, setPObs]     = useState('')

  // ── Estado: despesa ───────────────────────────────────────────
  const [fD, setFD] = useState({
    desc: '', valor: '', cat: 'Alimentação', data: TODAY, obs: ''
  })

  const CATS_DESP = ['Alimentação','Medicamento','Sal Mineral','Manutenção','Combustível','Mão de Obra','Outros']

  // ── Estado: gasolina ──────────────────────────────────────────
  const cfgV = useMemo(() => { try { return JSON.parse(localStorage.getItem('cfgVeiculo') || '{}') } catch { return {} } }, [action])
  const [gDistancia, setGDistancia] = useState(() => String(cfgV.distancia || ''))
  const [gConsumo,   setGConsumo]   = useState(() => String(cfgV.consumo   || ''))
  const [gPreco,     setGPreco]     = useState(() => String(cfgV.preco     || ''))
  const [gObs,       setGObs]       = useState('')
  const [gEditando,  setGEditando]  = useState(false)

  const gValorCalc = (gDistancia && gConsumo && gPreco)
    ? +((+gDistancia * 2) / +gConsumo * +gPreco).toFixed(2)
    : 0
  const [gValorEdit, setGValorEdit] = useState('')
  const gValorFinal = gEditando && gValorEdit ? +gValorEdit : gValorCalc

  const saveGasolina = () => {
    if (!gValorFinal) return
    localStorage.setItem('cfgVeiculo', JSON.stringify({ distancia: +gDistancia, consumo: +gConsumo, preco: +gPreco }))
    setFin(f => [...f, {
      id: Date.now(),
      tipo: 'despesa',
      desc: 'Combustível — Ida à fazenda',
      valor: gValorFinal,
      cat: 'Combustível',
      data: TODAY,
      obs: gObs
    }])
    onClose()
  }

  const saveDespesa = () => {
    if (!fD.valor || !fD.desc.trim()) return
    setFin(f => [...f, {
      ...fD, id: Date.now(),
      tipo: 'despesa',
      valor: +fD.valor
    }])
    onClose()
  }

  const filtr = pBusca
    ? ativos.filter(a => a.ident.toLowerCase().includes(pBusca.toLowerCase()))
    : ativos

  // ── Handlers ──────────────────────────────────────────────────
  const saveSal = () => {
    if (!fS.pastoId || !fS.sacos) return
    setSal(s => [...s, { ...fS, id: Date.now(), pastoId: +fS.pastoId, sacos: +fS.sacos }])
    onClose()
  }

  const saveNasc = () => {
    if (!fN.ident.trim()) return
    setAnimais(a => [...a, {
      ...fN, id: Date.now(), cat: 'Bezerro', status: 'ativo',
      pastoId: fN.pastoId ? +fN.pastoId : null,
      peso: +fN.peso || 0,
      maeId: fN.maeId ? +fN.maeId : null
    }])
    onClose()
  }

  const savePasto = () => {
    if (!pAnimal || !pDest) return
    const a = animais.find(x => x.id === +pAnimal)
    setMovs(m => [{
      id: Date.now(), ident: a.ident,
      de: nomePasto(a.pastoId), para: nomePasto(+pDest),
      data: TODAY, obs: pObs
    }, ...m])
    setAnimais(a2 => a2.map(x => x.id === +pAnimal ? { ...x, pastoId: +pDest } : x))
    onClose()
  }

  // ── Render: sal ────────────────────────────────────────────────
  if (action === 'sal') return (
    <Modal open title="🧂 Registrar Sal Mineral" onClose={onClose}>
      <Sel
        label="Pasto" value={fS.pastoId}
        onChange={v => setFS(f => ({ ...f, pastoId: v }))}
        opts={[{ v: '', l: 'Selecionar...' }, ...oc.map(p => ({ v: String(p.id), l: p.nome }))]}
      />
      <Inp label="Sacos (30 kg/saco)" value={fS.sacos} onChange={v => setFS(f => ({ ...f, sacos: v }))} type="number" placeholder="3" />
      <Inp label="Data" value={fS.data} onChange={v => setFS(f => ({ ...f, data: v }))} type="date" />
      <Inp label="Observações" value={fS.obs} onChange={v => setFS(f => ({ ...f, obs: v }))} placeholder="Opcional..." />
      <Btn l="💾 Salvar" onClick={saveSal} dis={!fS.pastoId || !fS.sacos} />
    </Modal>
  )

  // ── Render: nascimento ─────────────────────────────────────────
  if (action === 'nascimento') return (
    <Modal open title="🐮 Registrar Nascimento" onClose={onClose}>
      <div style={{ background: T.pinkPale, borderRadius: 12, padding: 12, marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.pinkDark, marginBottom: 8, textTransform: 'uppercase' }}>Sexo</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[['M', '♂ Macho', T.blueMid, T.bluePale], ['F', '♀ Fêmea', T.pinkDark, T.pinkPale]].map(([v, l, c, bg]) => (
            <button
              key={v}
              onClick={() => setFN(f => ({ ...f, sexo: v }))}
              style={{
                border: `2.5px solid ${fN.sexo === v ? c : T.border}`,
                borderRadius: 12, padding: '11px 0',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                background: fN.sexo === v ? bg : T.card,
                color: fN.sexo === v ? c : T.gray
              }}
            >{l}</button>
          ))}
        </div>
      </div>
      <Inp label="Identificador *" value={fN.ident} onChange={v => setFN(f => ({ ...f, ident: v }))} placeholder="Ex: BEZ-009" />
      <Inp label="📅 Nascimento" value={fN.dataNasc} onChange={v => setFN(f => ({ ...f, dataNasc: v }))} type="date" />
      {(() => {
        const id = calcIdade(fN.dataNasc)
        return id && fN.dataNasc
          ? <div style={{ fontSize: 12, color: id.cor, fontWeight: 600, marginBottom: 12 }}>⏱ {id.label}</div>
          : null
      })()}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Inp label="Raça" value={fN.raca} onChange={v => setFN(f => ({ ...f, raca: v }))} placeholder="Nelore" />
        <Inp label="Peso (kg)" value={fN.peso} onChange={v => setFN(f => ({ ...f, peso: v }))} type="number" placeholder="35" />
      </div>
      <Sel
        label="🐄 Mãe" value={fN.maeId}
        onChange={v => setFN(f => ({ ...f, maeId: v }))}
        opts={[{ v: '', l: 'Selecionar mãe...' }, ...vacas.map(v => ({ v: String(v.id), l: `${v.ident}${v.raca ? ' · ' + v.raca : ''}` }))]}
      />
      <Sel
        label="Pasto" value={fN.pastoId}
        onChange={v => setFN(f => ({ ...f, pastoId: v }))}
        opts={[{ v: '', l: 'Sem pasto' }, ...pastos.map(p => ({ v: String(p.id), l: p.nome }))]}
      />
      <Btn l="💾 Registrar Nascimento" onClick={saveNasc} dis={!fN.ident.trim()} />
    </Modal>
  )

  // ── Render: mover pasto ────────────────────────────────────────
  if (action === 'pasto') return (
    <Modal open title="🌿 Mover Animal de Pasto" onClose={onClose}>
      {!pAnimal ? <>
        <Inp label="Buscar pelo brinco" value={pBusca} onChange={setPBusca} placeholder="Número do brinco..." />
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {filtr.slice(0, 25).map(a => {
            const pt = pastos.find(p => p.id === a.pastoId)
            return (
              <div
                key={a.id}
                onClick={() => setPAnimal(String(a.id))}
                style={{
                  background: T.bg, borderRadius: 12, padding: '11px 13px',
                  marginBottom: 7, cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: T.text }}>{a.ident}</div>
                  <div style={{ fontSize: 12, color: T.gray }}>{a.cat} · {pt?.nome || 'Sem pasto'}</div>
                </div>
                <span style={{ color: T.green, fontWeight: 700, fontSize: 18 }}>›</span>
              </div>
            )
          })}
          {filtr.length === 0 && (
            <div style={{ textAlign: 'center', padding: 20, color: T.gray }}>Nenhum encontrado</div>
          )}
        </div>
      </> : <>
        <div style={{ background: T.gPale, borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: 800, color: T.text }}>{animais.find(a => a.id === +pAnimal)?.ident}</div>
          <div style={{ fontSize: 12, color: T.gray }}>📍 {nomePasto(animais.find(a => a.id === +pAnimal)?.pastoId)}</div>
          <button
            onClick={() => setPAnimal('')}
            style={{ background: 'none', border: 'none', color: T.green, fontSize: 12, cursor: 'pointer', marginTop: 4, padding: 0, fontWeight: 600 }}
          >← Trocar animal</button>
        </div>
        <Sel
          label="Destino" value={pDest} onChange={setPDest}
          opts={[
            { v: '', l: 'Selecionar pasto...' },
            ...pastos
              .filter(p => String(p.id) !== String(animais.find(a => a.id === +pAnimal)?.pastoId))
              .map(p => ({ v: String(p.id), l: `${p.nome} · ${p.status}` }))
          ]}
        />
        <Inp label="Observação" value={pObs} onChange={setPObs} placeholder="Motivo..." />
        <Btn l="✅ Confirmar Movimentação" onClick={savePasto} dis={!pDest} />
      </>}
    </Modal>
  )

  // ── Render: gasolina ──────────────────────────────────────────
  if (action === 'gasolina') return (
    <Modal open title="⛽ Ida à Fazenda" onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <Inp label="Distância (km ida)" value={gDistancia} onChange={setGDistancia} type="number" placeholder="Ex: 45" />
        <Inp label="Consumo (km/l)" value={gConsumo} onChange={setGConsumo} type="number" placeholder="Ex: 10" />
      </div>
      <Inp label="Preço do combustível (R$/l)" value={gPreco} onChange={setGPreco} type="number" placeholder="Ex: 6.50" />

      {gValorCalc > 0 && (
        <div style={{ background: T.gPale, borderRadius: 14, padding: '12px 16px', marginBottom: 12, border: `1.5px solid ${T.gLight}30` }}>
          <div style={{ fontSize: 11, color: T.gray, marginBottom: 4 }}>
            ({gDistancia} km × 2) ÷ {gConsumo} km/l × R$ {gPreco}/l
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: T.gDark }}>
              R$ {gValorFinal.toFixed(2).replace('.', ',')}
            </div>
            <button onClick={() => { setGEditando(e => !e); setGValorEdit(String(gValorCalc)) }}
              style={{ fontSize: 12, color: T.blue, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              {gEditando ? '↩ Usar cálculo' : '✏️ Editar valor'}
            </button>
          </div>
          {gEditando && (
            <Inp label="Valor final (R$)" value={gValorEdit} onChange={setGValorEdit} type="number" placeholder="0,00" />
          )}
        </div>
      )}

      <Inp label="Observações (opcional)" value={gObs} onChange={setGObs} placeholder="Ex: Visita semanal, urgência..." />
      <Btn l="⛽ Registrar Ida" onClick={saveGasolina} dis={!gValorFinal} />
    </Modal>
  )

  // ── Render: despesa ───────────────────────────────────────────
  if (action === 'despesa') return (
    <Modal open title="💸 Registrar Despesa" onClose={onClose}>
      <Inp
        label="Descrição *"
        value={fD.desc}
        onChange={v => setFD(f => ({ ...f, desc: v }))}
        placeholder="Ex: Ração, vacina, diesel..."
      />
      <Inp
        label="Valor (R$) *"
        value={fD.valor}
        onChange={v => setFD(f => ({ ...f, valor: v }))}
        type="number"
        placeholder="Ex: 850"
      />
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.gray, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.5px' }}>
          Categoria
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {CATS_DESP.map(c => (
            <button
              key={c}
              onClick={() => setFD(f => ({ ...f, cat: c }))}
              style={{
                border: `2px solid ${fD.cat === c ? T.red : T.border}`,
                borderRadius: 20, padding: '6px 13px',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: fD.cat === c ? T.pinkPale : T.card,
                color: fD.cat === c ? T.red : T.gray
              }}
            >{c}</button>
          ))}
        </div>
      </div>
      <Inp
        label="Data"
        value={fD.data}
        onChange={v => setFD(f => ({ ...f, data: v }))}
        type="date"
      />
      <Inp
        label="Observações"
        value={fD.obs}
        onChange={v => setFD(f => ({ ...f, obs: v }))}
        placeholder="Opcional..."
      />
      <Btn
        l="💾 Salvar Despesa"
        onClick={saveDespesa}
        dis={!fD.valor || !fD.desc.trim()}
      />
    </Modal>
  )

  return null
}
