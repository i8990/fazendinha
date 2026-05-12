// ═══ CALCULADORAS — ferramentas de cálculo puras ══════════════════
// Exporta: CalcUA, CalcLotacao, CalcSalMineral, CalcGMD
// Nenhuma persiste dados — estado local apenas.
// Usadas dentro de Ferramentas.jsx via ToolScreen.

import { useState }   from 'react'
import { useT }       from '../constants.js'
import { Inp }        from '../ui.jsx'

// ═══ UNIDADE ANIMAL ═══════════════════════════════════════════════
// 1 UA = animal de 450 kg; usado para dimensionar pressão de pastejo.
export function CalcUA() {
  const T = useT()
  const [nBois,  setNBois]  = useState('')
  const [pMedio, setPMedio] = useState('')

  const ua = nBois && pMedio ? (+nBois * (+pMedio / 450)).toFixed(2) : null

  return (
    <div>
      <div style={{ background: T.gPale, borderRadius: 14, padding: 14, marginBottom: 18, border: `1.5px solid ${T.gLight}30` }}>
        <div style={{ fontWeight: 800, color: T.gDark, fontSize: 13, marginBottom: 4 }}>⚖️ Cálculo de Unidade Animal</div>
        <div style={{ fontSize: 13, color: T.gray, lineHeight: 1.6 }}>
          1 UA = animal de <b>450 kg</b>. Use para dimensionar a pressão de pastejo no pasto.
        </div>
      </div>
      <Inp label="Número de animais"  value={nBois}  onChange={setNBois}  type="number" placeholder="Ex: 40" />
      <Inp label="Peso médio (kg)"    value={pMedio} onChange={setPMedio} type="number" placeholder="Ex: 380" />
      {ua && (
        <div style={{ background: T.green, borderRadius: 16, padding: 24, textAlign: 'center', marginTop: 8 }}>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>TOTAL EM UA</div>
          <div style={{ color: '#FFF', fontSize: 56, fontWeight: 800, lineHeight: 1 }}>{ua}</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 8 }}>
            {nBois} animais × {pMedio} kg ÷ 450
          </div>
        </div>
      )}
    </div>
  )
}

// ═══ LOTAÇÃO DO PASTO ══════════════════════════════════════════════
// Calcula quantas UA o pasto suporta pela área e taxa de lotação.
export function CalcLotacao() {
  const T = useT()
  const [haLot,   setHaLot]   = useState('')
  const [taxaLot, setTaxaLot] = useState('1.0')

  const lotMax = haLot && taxaLot ? (+haLot * +taxaLot).toFixed(1) : null

  const PRESETS = [
    ['0.5', 'Extensivo',  '0,5 UA/ha'],
    ['1.0', 'Médio',      '1,0 UA/ha'],
    ['1.5', 'Intensivo',  '1,5 UA/ha'],
    ['2.5', 'Super-int.', '2,5 UA/ha']
  ]

  return (
    <div>
      <div style={{ background: T.gPale, borderRadius: 14, padding: 14, marginBottom: 18, border: `1.5px solid ${T.gLight}30` }}>
        <div style={{ fontWeight: 800, color: T.gDark, fontSize: 13, marginBottom: 4 }}>🌿 Lotação do Pasto</div>
        <div style={{ fontSize: 13, color: T.gray, lineHeight: 1.6 }}>
          Calcula quantas UA o pasto suporta com base na área e na taxa de lotação desejada.
        </div>
      </div>
      <Inp label="Área do pasto (ha)" value={haLot} onChange={setHaLot} type="number" placeholder="Ex: 50" />

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.gray, marginBottom: 9, textTransform: 'uppercase', letterSpacing: '.5px' }}>
          Taxa de lotação (UA/ha)
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          {PRESETS.map(([v, l, sub]) => (
            <button
              key={v}
              onClick={() => setTaxaLot(v)}
              style={{
                border: `2px solid ${taxaLot === v ? T.green : T.border}`,
                borderRadius: 12, padding: '12px 8px', cursor: 'pointer',
                background: taxaLot === v ? T.gPale : T.card, textAlign: 'center'
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: taxaLot === v ? T.green : T.text }}>{l}</div>
              <div style={{ fontSize: 11, color: T.gray, marginTop: 2 }}>{sub}</div>
            </button>
          ))}
        </div>
        <Inp label="Ou digite manualmente" value={taxaLot} onChange={setTaxaLot} type="number" placeholder="UA/ha" />
      </div>

      {lotMax && (
        <div style={{ background: T.green, borderRadius: 16, padding: 24, textAlign: 'center', marginTop: 8 }}>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>CAPACIDADE MÁXIMA</div>
          <div style={{ color: '#FFF', fontSize: 56, fontWeight: 800, lineHeight: 1 }}>{lotMax} <span style={{ fontSize: 22 }}>UA</span></div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 8 }}>{haLot} ha × {taxaLot} UA/ha</div>
        </div>
      )}
    </div>
  )
}

// ═══ SAL MINERAL ══════════════════════════════════════════════════
// Calcula kg e sacos de 30 kg para suprir o rebanho num período.
export function CalcSalMineral() {
  const T = useT()
  const [nAnimSal,  setNAnimSal]  = useState('')
  const [txSal,     setTxSal]     = useState('225')
  const [diasSalC,  setDiasSalC]  = useState('30')

  const kgSal    = nAnimSal && txSal && diasSalC ? ((+nAnimSal * +txSal * +diasSalC) / 1000).toFixed(1) : null
  const sacosNec = kgSal ? Math.ceil(+kgSal / 30) : null

  return (
    <div>
      <div style={{ background: '#FFF3E0', borderRadius: 14, padding: 14, marginBottom: 18, border: '1.5px solid #F4A26140' }}>
        <div style={{ fontWeight: 800, color: '#E65100', fontSize: 13, marginBottom: 4 }}>🧂 Cálculo de Sal Mineral</div>
        <div style={{ fontSize: 13, color: T.gray, lineHeight: 1.6 }}>
          Calcula quantos kg e sacos de 30 kg você precisa comprar para suprir o rebanho por um período.
        </div>
      </div>
      <Inp label="Número de animais"          value={nAnimSal}  onChange={setNAnimSal}  type="number" placeholder="Ex: 60" />
      <Inp label="Taxa de sal (g/animal/dia)" value={txSal}     onChange={setTxSal}     type="number" placeholder="225" />
      <Inp label="Período (dias)"             value={diasSalC}  onChange={setDiasSalC}  type="number" placeholder="30" />

      {kgSal && (
        <div style={{ background: 'linear-gradient(135deg,#E65100,#F4A261)', borderRadius: 16, padding: 24, textAlign: 'center', marginTop: 8 }}>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>VOCÊ VAI PRECISAR DE</div>
          <div style={{ color: '#FFF', fontSize: 56, fontWeight: 800, lineHeight: 1 }}>{kgSal} <span style={{ fontSize: 22 }}>kg</span></div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, fontWeight: 800, marginTop: 10 }}>
            {sacosNec} saco{sacosNec !== 1 ? 's' : ''} de 30 kg
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 6 }}>
            {nAnimSal} animais × {txSal}g × {diasSalC} dias
          </div>
        </div>
      )}
    </div>
  )
}

// ═══ GANHO MÉDIO DIÁRIO ════════════════════════════════════════════
// GMD = (peso final − peso inicial) / dias.
// Meta Nelore: 0,700 – 0,900 kg/dia.
export function CalcGMD() {
  const T = useT()
  const [pIni,    setPIni]    = useState('')
  const [pFim,    setPFim]    = useState('')
  const [diasGmd, setDiasGmd] = useState('')

  const gmd = pIni && pFim && diasGmd && +diasGmd > 0
    ? ((+pFim - +pIni) / +diasGmd).toFixed(3)
    : null

  const corGmd = !gmd ? T.green
    : +gmd >= 0.7 ? T.green
    : +gmd >= 0.4 ? T.orange
    : T.red

  return (
    <div>
      <div style={{ background: T.bluePale, borderRadius: 14, padding: 14, marginBottom: 18, border: `1.5px solid ${T.blueMid}30` }}>
        <div style={{ fontWeight: 800, color: T.blue, fontSize: 13, marginBottom: 4 }}>📈 Ganho Médio Diário</div>
        <div style={{ fontSize: 13, color: T.gray, lineHeight: 1.6 }}>
          Mede o desempenho de crescimento do animal ou lote. Meta Nelore: <b>0,700 – 0,900 kg/dia</b>.
        </div>
      </div>
      <Inp label="Peso inicial (kg)"  value={pIni}    onChange={setPIni}    type="number" placeholder="Ex: 280" />
      <Inp label="Peso final (kg)"    value={pFim}    onChange={setPFim}    type="number" placeholder="Ex: 350" />
      <Inp label="Intervalo (dias)"   value={diasGmd} onChange={setDiasGmd} type="number" placeholder="Ex: 90" />

      {gmd && (
        <div style={{ background: corGmd, borderRadius: 16, padding: 24, textAlign: 'center', marginTop: 8 }}>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>GANHO MÉDIO DIÁRIO</div>
          <div style={{ color: '#FFF', fontSize: 56, fontWeight: 800, lineHeight: 1 }}>{gmd} <span style={{ fontSize: 22 }}>kg/dia</span></div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, marginTop: 10, fontWeight: 700 }}>
            {+gmd >= 0.7 ? '✅ Excelente desempenho' : +gmd >= 0.4 ? '⚠️ Desempenho médio' : '🚨 Abaixo do esperado'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 6 }}>
            Ganho total: {(+pFim - +pIni).toFixed(1)} kg em {diasGmd} dias
          </div>
        </div>
      )}
    </div>
  )
}
