// ═══ DASHBOARD — tela principal ═══════════════════════════════════
import { useT }           from '../constants.js'
import { TODAY, calcSal, calcIdade, fmtR } from '../utils.js'
import { Card, Badge }    from '../ui.jsx'
import { ClimaWidget }    from '../widgets.jsx'

export function Dashboard({ pastos, animais, sal, fin, cfg, setPage, setAction }) {
  const T = useT()

  const ativos    = animais.filter(a => a.status === 'ativo')
  const adultos   = ativos.filter(a => a.cat !== 'Bezerro')
  const bezerros  = ativos.filter(a => a.cat === 'Bezerro')
  const bezRecent = bezerros.filter(a => {
    if (!a.dataNasc) return false
    const ms = Date.now() - new Date(a.dataNasc + 'T12:00')
    return ms >= 0 && ms < 30 * 86400000
  })

  const mes     = TODAY.slice(0, 7)
  const receita = fin.filter(f => f.tipo === 'receita' && f.data?.startsWith(mes)).reduce((s, f) => s + (+f.valor || 0), 0)
  const despesa = fin.filter(f => f.tipo === 'despesa' && f.data?.startsWith(mes)).reduce((s, f) => s + (+f.valor || 0), 0)

  // Alertas críticos agrupados
  const alertas = []
  const semPasto = ativos.filter(a => !a.pastoId)
  if (semPasto.length) alertas.push({ icon: '🚜', msg: `${semPasto.length} animal(is) sem pasto`, cor: T.orange, page: 'animais' })
  pastos.filter(p => p.status === 'ocupado').forEach(p => {
    const an = ativos.filter(a => a.pastoId === p.id).length
    if (an === 0) return
    const st = calcSal(p.id, an, sal, cfg?.taxaSal || 225)
    if (st.alerta) alertas.push({ icon: '🧂', msg: `Sal baixo: ${p.nome}`, cor: T.red, page: 'pastos' })
  })
  const degradados = pastos.filter(p => p.status === 'degradado')
  if (degradados.length) alertas.push({ icon: '🌱', msg: `${degradados.length} pasto(s) degradado(s)`, cor: T.orange, page: 'pastos' })

  const QA = [
    { icon: '🐮', l: 'Nascimento',   action: 'nascimento' },
    { icon: '🧂', l: 'Sal Mineral',  action: 'sal'        },
    { icon: '💸', l: 'Despesa',      action: 'despesa'    },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ background: `linear-gradient(145deg,${T.gDark},${T.green})`, padding: '10px 16px 12px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, letterSpacing: '0.5px', textTransform: 'uppercase', lineHeight: 1 }}>
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <div style={{ color: '#FFF', fontSize: 18, fontWeight: 800, letterSpacing: '-0.4px', marginTop: 2, lineHeight: 1 }}>
              Fazendinha 🌾{cfg?.nomeFazenda ? ` · ${cfg.nomeFazenda}` : ''}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>🐄 {adultos.length} adultos</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>🐣 {bezerros.length} bezerros</span>
            </div>
          </div>

        </div>
      </div>

      <div style={{ padding: '0 14px', marginTop: 14 }}>

        {/* Bezerros recentes */}
        {bezRecent.length > 0 && (
          <Card
            ch={
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.green, marginBottom: 10 }}>
                  🐣 Bezerros recentes — últimos 30 dias
                </div>
                {bezRecent.map((b, i) => {
                  const id = calcIdade(b.dataNasc)
                  const nascDate = new Date(b.dataNasc + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                  return (
                    <div
                      key={b.id}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        paddingTop: i > 0 ? 10 : 0,
                        borderTop: i > 0 ? `1px solid ${T.border}` : 'none',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{b.ident}</div>
                        <div style={{ fontSize: 12, color: T.gray, marginTop: 2 }}>
                          {b.sexo === 'M' ? '♂ Macho' : '♀ Fêmea'} · {b.raca || 'Sem raça'} · nasceu {nascDate}
                        </div>
                      </div>
                      {id && <Badge l={id.label} c={id.cor} bg={id.cor + '22'} />}
                    </div>
                  )
                })}
              </div>
            }
            style={{ border: `1px solid ${T.green}30`, marginBottom: 12 }}
          />
        )}

        {/* Financeiro do mês */}
        <Card ch={
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.gray, marginBottom: 12 }}>
              💰 Financeiro — {new Date().toLocaleDateString('pt-BR', { month: 'long' })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: T.gPale, borderRadius: 14, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: T.gray, fontWeight: 600 }}>Receita</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: T.green }}>{fmtR(receita)}</div>
              </div>
              <div style={{ background: T.pinkPale, borderRadius: 14, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: T.gray, fontWeight: 600 }}>Despesa</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: T.red }}>{fmtR(despesa)}</div>
              </div>
            </div>
            <div
              onClick={() => setPage('financeiro')}
              style={{ textAlign: 'center', marginTop: 10, fontSize: 13, color: T.green, fontWeight: 600, cursor: 'pointer' }}
            >Ver detalhes →</div>
          </div>
        } />

        {/* Quick Actions */}
        <div style={{ fontSize: 13, fontWeight: 600, color: T.gray, marginBottom: 10, paddingLeft: 2 }}>
          Ações Rápidas
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 16 }}>
          {QA.map(q => (
            <button
              key={q.action}
              onClick={() => setAction(q.action)}
              style={{
                background: T.card,
                border: `1px solid ${T.border}`,
                borderRadius: 18, padding: '16px 8px',
                cursor: 'pointer', textAlign: 'center',
                boxShadow: `0 1px 6px ${T.shadow}`
              }}
            >
              <div style={{ fontSize: 26, marginBottom: 6 }}>{q.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text, lineHeight: 1.2 }}>{q.l}</div>
            </button>
          ))}
        </div>

        {/* Clima — ao final */}
        <div style={{ marginBottom: 100 }}>
          <ClimaWidget />
        </div>

      </div>
    </div>
  )
}
