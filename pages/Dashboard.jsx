// ═══ DASHBOARD — tela principal ═══════════════════════════════════
// Props:
//   pastos       : array
//   animais      : array
//   sal          : array
//   fin          : array
//   cfg          : object
//   setPage()    : navega para outra página
//   setAction()  : abre um GlobalModal ('sal' | 'nascimento' | 'pasto')

import { useT }           from '../constants.js'
import { TODAY, calcSal, calcIdade, fmtR } from '../utils.js'
import { Card, Badge }    from '../ui.jsx'
import { ClimaWidget }    from '../widgets.jsx'

export function Dashboard({ pastos, animais, sal, fin, cfg, setPage, setAction }) {
  const T = useT()

  const ativos    = animais.filter(a => a.status === 'ativo')
  const bezRecent = ativos.filter(a => {
    if (a.cat !== 'Bezerro' || !a.dataNasc) return false
    const ms = Date.now() - new Date(a.dataNasc + 'T12:00')
    return ms >= 0 && ms < 30 * 86400000
  })

  // Receita e despesa do mês atual
  const mes    = TODAY.slice(0, 7)
  const receita = fin.filter(f => f.tipo === 'receita' && f.data?.startsWith(mes)).reduce((s, f) => s + (+f.valor || 0), 0)
  const despesa = fin.filter(f => f.tipo === 'despesa' && f.data?.startsWith(mes)).reduce((s, f) => s + (+f.valor || 0), 0)

  // Alertas críticos
  const alertas = []

  // Animais sem pasto
  const semPasto = ativos.filter(a => !a.pastoId)
  if (semPasto.length) alertas.push({ icon: '🚜', msg: `${semPasto.length} animal(is) sem pasto`, cor: T.orange, page: 'animais' })

  // Sal em alerta
  pastos.filter(p => p.status === 'ocupado').forEach(p => {
    const an = ativos.filter(a => a.pastoId === p.id).length
    if (an === 0) return
    const st = calcSal(p.id, an, sal, cfg?.taxaSal || 225)
    if (st.alerta) alertas.push({ icon: '🧂', msg: `Sal baixo: ${p.nome}`, cor: T.red, page: 'pastos' })
  })

  // Bezerros recentes
  if (bezRecent.length) alertas.push({ icon: '🐣', msg: `${bezRecent.length} bezerro(s) nos últimos 30 dias`, cor: T.green, page: 'animais' })

  // Pastos degradados
  const degradados = pastos.filter(p => p.status === 'degradado')
  if (degradados.length) alertas.push({ icon: '🌱', msg: `${degradados.length} pasto(s) degradado(s)`, cor: T.orange, page: 'pastos' })

  // Quick-actions
  const QA = [
    { icon: '🧂', l: 'Sal Mineral',  action: 'sal'        },
    { icon: '🐮', l: 'Nascimento',   action: 'nascimento' },
    { icon: '🌿', l: 'Mover Pasto',  action: 'pasto'      }
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ background: `linear-gradient(145deg,${T.gDark},${T.green})`, padding: '22px 20px 36px' }}>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
        <div style={{ color: '#FFF', fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginTop: 4 }}>
          Fazendinha 🌾
        </div>
        {cfg?.nomeFazenda && (
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 2 }}>{cfg.nomeFazenda}</div>
        )}
      </div>

      <div style={{ padding: '0 14px', marginTop: -18 }}>

        {/* KPIs */}
        <Card ch={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0 }}>
            {[
              { l: 'Animais', v: ativos.length,            icon: '🐄', page: 'animais' },
              { l: 'Pastos',  v: pastos.length,            icon: '🌿', page: 'pastos'  },
              { l: 'Pastando',v: pastos.filter(p => p.status === 'ocupado').length, icon: '✅', page: 'pastos' }
            ].map((k, i) => (
              <div
                key={i}
                onClick={() => setPage(k.page)}
                style={{
                  textAlign: 'center', padding: '14px 6px',
                  borderRight: i < 2 ? `1px solid ${T.border}` : 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: 22 }}>{k.icon}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: T.text, lineHeight: 1.1 }}>{k.v}</div>
                <div style={{ fontSize: 11, color: T.gray, fontWeight: 500 }}>{k.l}</div>
              </div>
            ))}
          </div>
        } />

        {/* Alertas */}
        {alertas.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.gray, marginBottom: 8, paddingLeft: 2 }}>
              ⚠️ Atenção
            </div>
            {alertas.map((al, i) => (
              <Card
                key={i}
                onClick={() => setPage(al.page)}
                ch={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{al.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: al.cor, flex: 1 }}>{al.msg}</span>
                    <span style={{ color: T.gray, fontSize: 18 }}>›</span>
                  </div>
                }
                style={{ marginBottom: 8, border: `1px solid ${al.cor}30` }}
              />
            ))}
          </div>
        )}

        {/* Clima */}
        <ClimaWidget />

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
          {QA.map(q => (
            <button
              key={q.action}
              onClick={() => setAction(q.action)}
              style={{
                background: T.card,
                border: `1px solid ${T.border}`,
                borderRadius: 18, padding: '14px 8px',
                cursor: 'pointer', textAlign: 'center',
                boxShadow: `0 1px 6px ${T.shadow}`
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 5 }}>{q.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text, lineHeight: 1.2 }}>{q.l}</div>
            </button>
          ))}
        </div>

        {/* Bezerros recentes */}
        {bezRecent.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.gray, marginBottom: 8, paddingLeft: 2 }}>
              🐣 Bezerros recentes
            </div>
            {bezRecent.map(b => {
              const id = calcIdade(b.dataNasc)
              return (
                <Card key={b.id} ch={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: T.text }}>{b.ident}</div>
                      <div style={{ fontSize: 12, color: T.gray }}>{b.sexo === 'M' ? '♂ Macho' : '♀ Fêmea'} · {b.raca || 'Sem raça'}</div>
                    </div>
                    {id && <Badge l={id.label} c={id.cor} bg={id.cor + '22'} />}
                  </div>
                } />
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
