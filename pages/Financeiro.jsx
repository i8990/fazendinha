// ═══ FINANCEIRO — controle financeiro mensal ══════════════════════
import { useState }                    from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useT }                        from '../constants.js'
import { TODAY, fmtD, fmtR }           from '../utils.js'
import { Btn, Inp, Sel, Modal,
         DetailPage, Section, Card,
         InfoRow, DeleteBtn, PgH }     from '../ui.jsx'
import { FinanceiroPessoal }           from './FinanceiroPessoal.jsx'

const catR = ['Venda de gado', 'Leite', 'Arrendamento', 'Outros']
const catD = ['Alimentação', 'Manutenção', 'Animal', 'Pasto', 'Combustível', 'Mão de obra', 'Outros']

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export function Financeiro({ fin, setFin, finP, setFinP }) {
  const T = useT()

  const hoje = new Date()
  const [aba,      setAba]      = useState('tudo')
  const [modal,    setM]        = useState(false)
  const [detail,   setDetail]   = useState(null)
  const [editFinM, setEditFinM] = useState(false)
  const [efin,     setEfin]     = useState({})
  const [mesIdx,   setMesIdx]   = useState(hoje.getMonth())
  const [ano,      setAno]      = useState(hoje.getFullYear())
  const [abaGeral, setAbaGeral] = useState('fazenda')

  const eF = { tipo: 'despesa', valor: '', cat: 'Alimentação', desc: '', data: TODAY }
  const [form, setForm] = useState(eF)

  const mes  = `${ano}-${String(mesIdx + 1).padStart(2, '0')}`
  const tM   = fin.filter(t => t.data.startsWith(mes))
  const rec  = tM.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0)
  const desp = tM.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0)
  const saldo = rec - desp

  const lista = (aba === 'tudo' ? tM : tM.filter(t => t.tipo === (aba === 'rec' ? 'receita' : 'despesa')))
    .sort((a, b) => b.data.localeCompare(a.data))

  const add = () => {
    if (!form.valor) return
    setFin(f => [{ ...form, id: Date.now(), valor: +form.valor }, ...f])
    setM(false); setForm(eF)
  }

  const del = id => { setFin(f => f.filter(x => x.id !== id)); setDetail(null) }

  const navMes = (dir) => {
    let m = mesIdx + dir, a = ano
    if (m < 0)  { m = 11; a-- }
    if (m > 11) { m = 0;  a++ }
    setMesIdx(m); setAno(a)
  }

  // ── Dados gráfico 6 meses ────────────────────────────────────────
  const graf = Array.from({ length: 6 }, (_, i) => {
    let m = mesIdx - 5 + i, a = ano
    if (m < 0) { m += 12; a-- }
    const key = `${a}-${String(m + 1).padStart(2, '0')}`
    const tMs = fin.filter(t => t.data.startsWith(key))
    return {
      name: MESES[m].slice(0, 3),
      Entradas: tMs.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0),
      Saídas:   tMs.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0),
    }
  })

  // ── Tela de detalhe ──────────────────────────────────────────────
  if (detail) {
    const isR = detail.tipo === 'receita'
    const cor  = isR ? T.green : T.red

    const salvarEditFin = () => {
      if (!efin.valor) return
      setFin(f => f.map(x => x.id === detail.id ? { ...efin, valor: +efin.valor } : x))
      setEditFinM(false); setDetail(null)
    }

    return (
      <DetailPage
        onBack={() => setDetail(null)}
        title={isR ? 'Receita' : 'Despesa'}
        icon={isR ? '▲' : '▼'}
        color={`linear-gradient(135deg,${isR ? T.gDark : '#7B1D1D'},${isR ? T.green : T.red})`}
      >
        <Section title="Detalhes da Transação">
          <Card ch={<>
            <div style={{ textAlign: 'center', padding: '16px 0', marginBottom: 12 }}>
              <div style={{ fontSize: 40, fontWeight: 800, color: cor }}>{isR ? '+' : '-'}{fmtR(detail.valor)}</div>
              <div style={{ fontSize: 13, color: T.gray, marginTop: 4 }}>{fmtD(detail.data)}</div>
            </div>
            <InfoRow label="Categoria"  value={detail.cat} />
            <InfoRow label="Tipo"       value={isR ? 'Receita' : 'Despesa'} color={cor} />
            <InfoRow label="Descrição"  value={detail.desc || '—'} />
            <InfoRow label="Data"       value={fmtD(detail.data)} />
          </>} />
        </Section>

        <Btn l="✏️ Editar Lançamento" color={T.blue} onClick={() => { setEfin({ ...detail }); setEditFinM(true) }} style={{ marginBottom: 10 }} />
        <DeleteBtn label="esta transação" onConfirm={() => del(detail.id)} />
        <div style={{ height: 20 }} />

        <Modal open={editFinM} onClose={() => setEditFinM(false)} title="✏️ Editar Lançamento">
          <div style={{ display: 'flex', gap: 7, marginBottom: 13 }}>
            {[['receita', '▲ Entrada'], ['despesa', '▼ Saída']].map(([tp, lbl]) => (
              <button key={tp} onClick={() => setEfin(e => ({ ...e, tipo: tp, cat: tp === 'receita' ? catR[0] : catD[0] }))} style={{
                flex: 1, border: 'none', borderRadius: 11, padding: 13, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                background: efin.tipo === tp ? (tp === 'receita' ? T.green : T.red) : T.bg,
                color: efin.tipo === tp ? '#FFF' : T.gray
              }}>{lbl}</button>
            ))}
          </div>
          <Inp label="Valor (R$) *" value={efin.valor} onChange={v => setEfin(e => ({ ...e, valor: v }))} type="number" />
          <Sel label="Categoria" value={efin.cat} onChange={v => setEfin(e => ({ ...e, cat: v }))} opts={(efin.tipo === 'receita' ? catR : catD).map(v => ({ v, l: v }))} />
          <Inp label="Descrição" value={efin.desc} onChange={v => setEfin(e => ({ ...e, desc: v }))} placeholder="Opcional..." />
          <Inp label="Data" value={efin.data} onChange={v => setEfin(e => ({ ...e, data: v }))} type="date" />
          <Btn l="💾 Salvar Alterações" onClick={salvarEditFin} dis={!efin.valor} />
        </Modal>
      </DetailPage>
    )
  }

  // ── Tela principal ───────────────────────────────────────────────
  return (
    <div style={{ paddingBottom: 100 }}>
      <PgH sub="Controle" title="Financeiro 💰" />


      {/* Abas Fazenda / Pessoal */}
      <div style={{ display: 'flex', margin: '10px 14px 0', background: T.bg, borderRadius: 12, padding: 3 }}>
        {[['fazenda','🌾 Fazenda'],['pessoal','👤 Pessoal']].map(([id, lbl]) => (
          <button key={id} onClick={() => setAbaGeral(id)} style={{
            flex: 1, border: 'none', borderRadius: 10, padding: '9px 0',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
            background: abaGeral === id ? T.card : 'none',
            color: abaGeral === id ? T.green : T.gray,
            boxShadow: abaGeral === id ? `0 1px 4px ${T.shadow}` : 'none',
            transition: 'all 0.18s ease'
          }}>{lbl}</button>
        ))}
      </div>

      {abaGeral === 'pessoal' && <FinanceiroPessoal finP={finP} setFinP={setFinP} />}
      {abaGeral === 'fazenda' && <>
      <div style={{ padding: '12px 14px 0' }}>

        {/* Navegação mês/ano */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, background: T.card, borderRadius: 14, padding: '10px 14px', boxShadow: `0 1px 4px ${T.shadow}` }}>
          <button onClick={() => navMes(-1)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: T.green, padding: '0 8px' }}>‹</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: T.text }}>{MESES[mesIdx]}</div>
            <div style={{ fontSize: 12, color: T.gray }}>{ano}</div>
          </div>
          <button onClick={() => navMes(+1)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: T.green, padding: '0 8px' }}>›</button>
        </div>

        {/* Card de saldo */}
        <div style={{
          background: saldo >= 0
            ? `linear-gradient(135deg,${T.gDark},${T.green})`
            : `linear-gradient(135deg,#7B1D1D,${T.red})`,
          borderRadius: 16, padding: 18, marginBottom: 12, color: '#FFF'
        }}>
          <div style={{ fontSize: 11, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Saldo — {MESES[mesIdx]} {ano}</div>
          <div style={{ fontSize: 34, fontWeight: 800 }}>{fmtR(saldo)}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 12 }}>
            <div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>▲ Entradas</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{fmtR(rec)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>▼ Saídas</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{fmtR(desp)}</div>
            </div>
          </div>
        </div>

        {/* Gráfico 6 meses */}
        <div style={{ background: T.card, borderRadius: 14, padding: '14px 8px 8px', marginBottom: 12, boxShadow: `0 1px 4px ${T.shadow}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.5, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, paddingLeft: 8 }}>
            Últimos 6 meses
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={graf} barCategoryGap="30%" barGap={3}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                formatter={(v) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
                contentStyle={{ borderRadius: 10, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Entradas" fill="#4ade80" radius={[4,4,0,0]} />
              <Bar dataKey="Saídas"   fill="#f87171" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 7, marginBottom: 11 }}>
          {[['tudo', 'Tudo'], ['rec', 'Entradas'], ['desp', 'Saídas']].map(([id, lbl]) => (
            <button key={id} onClick={() => setAba(id)} style={{
              flex: 1, border: 'none', borderRadius: 10, padding: '10px 0',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
              background: aba === id ? T.green : T.gPale,
              color: aba === id ? '#FFF' : T.green
            }}>{lbl}</button>
          ))}
        </div>

        {/* Lista */}
        {lista.length === 0 && (
          <div style={{ textAlign: 'center', padding: 22, color: T.gray }}>Nenhum lançamento em {MESES[mesIdx]}</div>
        )}
        {lista.map(t => (
          <div key={t.id} onClick={() => setDetail(t)} style={{
            background: T.card, borderRadius: 12, padding: '11px 14px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 7, boxShadow: `0 1px 4px ${T.shadow}`, cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: t.tipo === 'receita' ? T.gPale : '#FFE4E6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, flexShrink: 0
              }}>{t.tipo === 'receita' ? '▲' : '▼'}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: T.text }}>{t.cat}</div>
                <div style={{ fontSize: 11, color: T.gray }}>{t.desc && t.desc + ' · '}{fmtD(t.data)}</div>
              </div>
            </div>
            <div style={{ fontWeight: 700, color: t.tipo === 'receita' ? T.gLight : T.red, fontSize: 14, flexShrink: 0 }}>
              {t.tipo === 'receita' ? '+' : '-'}{fmtR(t.valor)}
            </div>
          </div>
        ))}

        <Btn l="+ Lançar Transação" onClick={() => setM(true)} />
      </div>

      {/* Modal nova transação */}
      <Modal open={modal} onClose={() => setM(false)} title="Nova Transação">
        <div style={{ display: 'flex', gap: 7, marginBottom: 13 }}>
          {[['receita', '▲ Entrada'], ['despesa', '▼ Saída']].map(([tp, lbl]) => (
            <button key={tp} onClick={() => setForm(f => ({ ...f, tipo: tp, cat: tp === 'receita' ? catR[0] : catD[0] }))} style={{
              flex: 1, border: 'none', borderRadius: 11, padding: 13, fontWeight: 700, fontSize: 14, cursor: 'pointer',
              background: form.tipo === tp ? (tp === 'receita' ? T.green : T.red) : T.bg,
              color: form.tipo === tp ? '#FFF' : T.gray
            }}>{lbl}</button>
          ))}
        </div>
        <Inp label="Valor (R$) *" value={form.valor} onChange={v => setForm(f => ({ ...f, valor: v }))} type="number" placeholder="0,00" />
        <Sel label="Categoria" value={form.cat} onChange={v => setForm(f => ({ ...f, cat: v }))} opts={(form.tipo === 'receita' ? catR : catD).map(v => ({ v, l: v }))} />
        <Inp label="Descrição" value={form.desc} onChange={v => setForm(f => ({ ...f, desc: v }))} placeholder="Opcional..." />
        <Inp label="Data" value={form.data} onChange={v => setForm(f => ({ ...f, data: v }))} type="date" />
        <Btn l="💾 Salvar" onClick={add} dis={!form.valor} />
      </Modal>
      </>}
    </div>
  )
}
