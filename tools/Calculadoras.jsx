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

// ═══ PESO POR FITA ════════════════════════════════════════════════
export function CalcPesoFita() {
  const T = useT()
  const [torax, setTorax] = useState('')
  const [comp,  setComp]  = useState('')

  const calcPeso = () => {
    if (!torax) return null
    const ct = +torax
    const cg = comp ? +comp : 125
    return Math.round((ct * ct * cg) / 10800)
  }

  const peso = calcPeso()
  const faixaMin = peso ? Math.round(peso * 0.90) : null
  const faixaMax = peso ? Math.round(peso * 1.10) : null
  const usouComp = !!comp

  return (
    <div>
      <div style={{
        background: '#FFF8E1',
        borderRadius: 14,
        padding: 14,
        marginBottom: 18,
        border: '1.5px solid #FFD54F60'
      }}>
        <div style={{ fontWeight: 800, color: '#E65100', fontSize: 13, marginBottom: 6 }}>
          📏 Como medir
        </div>
        <pre style={{
          fontFamily: 'monospace',
          fontSize: 11,
          color: '#5D4037',
          lineHeight: 1.45,
          margin: '0 0 10px',
          background: 'rgba(0,0,0,0.04)',
          borderRadius: 8,
          padding: '8px 10px',
          overflowX: 'auto'
        }}>
{`   Cabeça
     |
  __/ \\__
 |       |
 | ═════ | ← fita aqui
 |_______|
     |
  patas`}
        </pre>
        <div style={{ fontSize: 13, color: '#5D4037', lineHeight: 1.6 }}>
          <b>Tórax:</b> passe a fita ao redor do peito, logo atrás das patas dianteiras, na parte mais larga.
          Mantenha justa, sem apertar.
        </div>
        <div style={{ fontSize: 12, color: '#8D6E63', marginTop: 6, lineHeight: 1.5 }}>
          <b>Comprimento</b> (opcional): da ponta do pescoço até a base da cauda. Melhora a precisão.
        </div>
      </div>

      <Inp
        label="Circunferência torácica (cm)"
        value={torax}
        onChange={setTorax}
        type="number"
        placeholder="Ex: 168"
      />
      <Inp
        label="Comprimento corporal (cm) — opcional"
        value={comp}
        onChange={setComp}
        type="number"
        placeholder="Ex: 130"
      />

      {peso && (
        <div style={{
          background: 'linear-gradient(135deg,#E65100,#FF8F00)',
          borderRadius: 16,
          padding: 24,
          textAlign: 'center',
          marginTop: 8
        }}>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
            PESO ESTIMADO
          </div>
          <div style={{ color: '#FFF', fontSize: 64, fontWeight: 800, lineHeight: 1 }}>
            {peso} <span style={{ fontSize: 24 }}>kg</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: 700, marginTop: 12 }}>
            Faixa provável: {faixaMin}–{faixaMax} kg
          </div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 6 }}>
            {usouComp
              ? `Tórax ${torax} cm × Comp. ${comp} cm`
              : `Tórax ${torax} cm — comprimento estimado`}
          </div>
        </div>
      )}

      {peso && (
        <div style={{
          background: T.card,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: '10px 14px',
          marginTop: 14
        }}>
          <div style={{ fontSize: 12, color: T.gray, lineHeight: 1.6 }}>
            ⚠️ Aproximação de campo. Raça, idade, prenhez, escore corporal e genética
            podem alterar o resultado real em até 15%.
          </div>
        </div>
      )}

      {(torax || comp) && (
        <button
          onClick={() => { setTorax(''); setComp('') }}
          style={{
            marginTop: 16,
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            border: `1.5px solid ${T.border}`,
            background: 'transparent',
            color: T.gray,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Limpar
        </button>
      )}
    </div>
  )
}

// ═══ POPULAÇÃO DE PLANTAS ═════════════════════════════════════════
// Milho: metros lineares, pop/ha, plantas/m, adubo por metro.
// Capim: sementes necessárias e plantas esperadas pelo VC%.
export function CalcPopPlanta() {
  const T = useT()
  const [cultura, setCultura] = useState('milho')

  // ── estado milho ──
  const [area,     setArea]     = useState('')
  const [eLinhas,  setELinhas]  = useState('0.90')
  const [ePlantas, setEPlantas] = useState('')
  const [popAlvo,  setPopAlvo]  = useState('')
  const [adubDisp, setAdubDisp] = useState('')

  // ── estado capim ──
  const [areaC,    setAreaC]    = useState('')
  const [semKg,    setSemKg]    = useState('')
  const [vc,       setVc]       = useState('60')
  const [txSem,    setTxSem]    = useState('')
  const [eLinhasC, setELinhasC] = useState('0.50')

  // ── cálculos milho ──
  const mlPHa = +eLinhas > 0 ? Math.round(10000 / +eLinhas) : 0
  const mlTot = area && mlPHa ? Math.round(+area * mlPHa) : null

  let pop = null, pxm = null, epl = null
  if (popAlvo && +popAlvo > 0 && +eLinhas > 0) {
    pop = +popAlvo
    epl = (10000 / (pop * +eLinhas)).toFixed(2)
    pxm = (1 / +epl).toFixed(1)
  } else if (ePlantas && +ePlantas > 0 && +eLinhas > 0) {
    epl = +ePlantas
    pxm  = (1 / +ePlantas).toFixed(1)
    pop  = Math.round(10000 / (+eLinhas * +ePlantas))
  }

  const adubGm  = adubDisp && mlTot  ? Math.round(+adubDisp * 1000 / mlTot) : null
  const adubKha = adubDisp && area   ? Math.round(+adubDisp / +area)        : null

  // ── cálculos capim ──
  const mlPHaC = eLinhasC !== 'broadcast' && +eLinhasC > 0
    ? Math.round(10000 / +eLinhasC) : null
  const mlTotC = areaC && mlPHaC ? Math.round(+areaC * mlPHaC) : null
  const kgSem  = areaC && txSem  ? (+areaC * +txSem).toFixed(1) : null

  let planHaC = null, planMC = null
  if (semKg && vc && txSem) {
    planHaC = Math.round(+txSem * +semKg * (+vc / 100))
    planMC  = mlPHaC ? (planHaC / mlPHaC).toFixed(1) : null
  }

  const GRD = 'linear-gradient(135deg,#2E7D32,#43A047)'
  const hasMilho = mlTot || pop
  const hasCapim = kgSem  || planHaC

  const btnPreset = (active) => ({
    border: `2px solid ${active ? T.green : T.border}`,
    borderRadius: 12, padding: '10px 4px', cursor: 'pointer',
    background: active ? T.gPale : T.card, textAlign: 'center'
  })

  return (
    <div>
      {/* seletor cultura */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[['milho','🌽','Milho'],['capim','🌾','Capim']].map(([id, ic, lb]) => (
          <button key={id} onClick={() => setCultura(id)} style={btnPreset(cultura === id)}>
            <div style={{ fontSize: 26 }}>{ic}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: cultura === id ? T.green : T.text, marginTop: 4 }}>{lb}</div>
          </button>
        ))}
      </div>

      {/* ─── MILHO ─────────────────────────────────────── */}
      {cultura === 'milho' && (
        <>
          <div style={{ background: T.gPale, borderRadius: 14, padding: 14, marginBottom: 18, border: `1.5px solid ${T.gLight}30` }}>
            <div style={{ fontWeight: 800, color: T.gDark, fontSize: 13, marginBottom: 4 }}>🌽 Milho — População de Plantas</div>
            <div style={{ fontSize: 13, color: T.gray, lineHeight: 1.6 }}>
              Informe a <b>área</b> e o <b>espaçamento</b> — ou a <b>pop. recomendada pelo fabricante</b> — para calcular metros lineares e plantas por metro.
            </div>
          </div>

          <Inp label="Área (ha)" value={area} onChange={setArea} type="number" placeholder="Ex: 10" />

          {/* espaçamento linhas */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.gray, marginBottom: 9, textTransform: 'uppercase', letterSpacing: '.5px' }}>
              Espaçamento entre linhas
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[['0.50','50 cm'],['0.75','75 cm'],['0.90','90 cm']].map(([v,l]) => (
                <button key={v} onClick={() => setELinhas(v)} style={btnPreset(eLinhas === v)}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: eLinhas === v ? T.green : T.text }}>{l}</div>
                </button>
              ))}
            </div>
          </div>

          {/* pop alvo OU espaçamento plantas */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.gray, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>
              Informe um dos dois
            </div>
            <Inp
              label="Pop. alvo fabricante (plantas/ha)"
              value={popAlvo}
              onChange={v => { setPopAlvo(v); setEPlantas('') }}
              type="number"
              placeholder="Ex: 65000"
            />
            <div style={{ textAlign: 'center', fontSize: 12, color: T.gray, margin: '2px 0 10px' }}>— ou —</div>
            <Inp
              label="Espaçamento entre plantas (m)"
              value={ePlantas}
              onChange={v => { setEPlantas(v); setPopAlvo('') }}
              type="number"
              placeholder="Ex: 0.25"
            />
          </div>

          <Inp label="Adubo disponível (kg) — opcional" value={adubDisp} onChange={setAdubDisp} type="number" placeholder="Ex: 2000" />

          {hasMilho && (
            <>
              <div style={{ background: GRD, borderRadius: 16, padding: 22, textAlign: 'center', marginTop: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>METROS LINEARES</div>
                    <div style={{ color: '#FFF', fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{mlTot?.toLocaleString('pt-BR') ?? '—'}</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 }}>{mlPHa.toLocaleString('pt-BR')} m/ha</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>POPULAÇÃO/ha</div>
                    <div style={{ color: '#FFF', fontSize: 32, fontWeight: 800, lineHeight: 1 }}>
                      {pop ? `${Math.round(pop / 1000)}k` : '—'}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 }}>{pxm ? `${pxm} plantas/m` : '—'}</div>
                  </div>
                </div>
                {epl && (
                  <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600, marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                    1 planta a cada {Math.round(+epl * 100)} cm na linha
                  </div>
                )}
              </div>

              {adubGm && (
                <div style={{ background: '#FFF8E1', borderRadius: 14, padding: 16, marginTop: 12, border: '1.5px solid #FFD54F60' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#E65100', marginBottom: 10 }}>🧪 Distribuição de adubo</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ textAlign: 'center', background: 'rgba(230,81,0,0.07)', borderRadius: 10, padding: '10px 6px' }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: '#E65100', lineHeight: 1 }}>{adubGm}<span style={{ fontSize: 14 }}> g</span></div>
                      <div style={{ fontSize: 11, color: T.gray, marginTop: 4 }}>por metro linear</div>
                    </div>
                    <div style={{ textAlign: 'center', background: 'rgba(230,81,0,0.07)', borderRadius: 10, padding: '10px 6px' }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: '#E65100', lineHeight: 1 }}>{adubKha}<span style={{ fontSize: 14 }}> kg</span></div>
                      <div style={{ fontSize: 11, color: T.gray, marginTop: 4 }}>por hectare</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {(area || popAlvo || ePlantas || adubDisp) && (
            <button
              onClick={() => { setArea(''); setPopAlvo(''); setEPlantas(''); setAdubDisp('') }}
              style={{ marginTop: 16, width: '100%', padding: '14px', borderRadius: 12, border: `1.5px solid ${T.border}`, background: 'transparent', color: T.gray, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >Limpar</button>
          )}
        </>
      )}

      {/* ─── CAPIM ─────────────────────────────────────── */}
      {cultura === 'capim' && (
        <>
          <div style={{ background: T.gPale, borderRadius: 14, padding: 14, marginBottom: 18, border: `1.5px solid ${T.gLight}30` }}>
            <div style={{ fontWeight: 800, color: T.gDark, fontSize: 13, marginBottom: 4 }}>🌾 Capim — Semeadura</div>
            <div style={{ fontSize: 13, color: T.gray, lineHeight: 1.6 }}>
              Use os dados da embalagem (<b>sementes/kg</b> e <b>VC%</b>) para calcular o total de sementes e a população esperada.
            </div>
          </div>

          <Inp label="Área (ha)" value={areaC} onChange={setAreaC} type="number" placeholder="Ex: 50" />
          <Inp label="Sementes por kg (embalagem)" value={semKg} onChange={setSemKg} type="number" placeholder="Ex: 200000" />

          {/* VC% */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.gray, marginBottom: 9, textTransform: 'uppercase', letterSpacing: '.5px' }}>
              VC% — Valor Cultural (embalagem)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 10 }}>
              {['40','50','60','70'].map(v => (
                <button key={v} onClick={() => setVc(v)} style={btnPreset(vc === v)}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: vc === v ? T.green : T.text }}>{v}%</div>
                </button>
              ))}
            </div>
            <Inp label="Ou digite o VC%" value={vc} onChange={setVc} type="number" placeholder="Ex: 60" />
          </div>

          <Inp label="Taxa de semeadura (kg/ha)" value={txSem} onChange={setTxSem} type="number" placeholder="Ex: 8" />

          {/* espaçamento */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.gray, marginBottom: 9, textTransform: 'uppercase', letterSpacing: '.5px' }}>
              Espaçamento entre linhas
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[['0.50','50 cm'],['0.75','75 cm'],['broadcast','Lanço']].map(([v,l]) => (
                <button key={v} onClick={() => setELinhasC(v)} style={btnPreset(eLinhasC === v)}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: eLinhasC === v ? T.green : T.text }}>{l}</div>
                </button>
              ))}
            </div>
          </div>

          {hasCapim && (
            <div style={{ background: GRD, borderRadius: 16, padding: 22, marginTop: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: kgSem && planHaC ? '1fr 1fr' : '1fr', gap: 12, textAlign: 'center' }}>
                {kgSem && (
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>SEMENTES NECESSÁRIAS</div>
                    <div style={{ color: '#FFF', fontSize: 36, fontWeight: 800, lineHeight: 1 }}>{kgSem} <span style={{ fontSize: 16 }}>kg</span></div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 }}>{txSem} kg/ha × {areaC} ha</div>
                  </div>
                )}
                {planHaC && (
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>PLANTAS/ha (esperadas)</div>
                    <div style={{ color: '#FFF', fontSize: 36, fontWeight: 800, lineHeight: 1 }}>{(planHaC / 1000).toFixed(0)}k</div>
                    {planMC && eLinhasC !== 'broadcast' && (
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 }}>{planMC} plantas/m</div>
                    )}
                  </div>
                )}
              </div>
              {mlTotC && eLinhasC !== 'broadcast' && (
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600, marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
                  {mlTotC.toLocaleString('pt-BR')} metros lineares
                </div>
              )}
            </div>
          )}

          {(areaC || semKg || txSem) && (
            <button
              onClick={() => { setAreaC(''); setSemKg(''); setTxSem('') }}
              style={{ marginTop: 16, width: '100%', padding: '14px', borderRadius: 12, border: `1.5px solid ${T.border}`, background: 'transparent', color: T.gray, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >Limpar</button>
          )}
        </>
      )}
    </div>
  )
}
