// ═══ UTILS — funções utilitárias puras ═══════════════════════════
// Importado por: storage.js, ui.jsx e todas as páginas
// Zero dependências externas.

// ── Data ──────────────────────────────────────────────────────────
export const TODAY = new Date().toISOString().slice(0, 10)

// Subtrai n dias de uma data ISO (string)
export const sub = (d, n) => {
  const dt = new Date(d + 'T12:00')
  dt.setDate(dt.getDate() - n)
  return dt.toISOString().slice(0, 10)
}

// Formata data ISO para pt-BR (ex: 12/05/2025)
export const fmtD = d => {
  try { return new Date(d + 'T12:00').toLocaleDateString('pt-BR') }
  catch { return d || '—' }
}

// ── Moeda ─────────────────────────────────────────────────────────
// Formata número para BRL (ex: R$ 1.234,56)
export const fmtR = v =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// ── Idade animal ──────────────────────────────────────────────────
// Retorna { label, dias, meses, anos, cor } ou null se sem data
export function calcIdade(dn) {
  if (!dn) return null
  const ms = new Date() - new Date(dn + 'T12:00')
  if (ms < 0) return { label: 'Não nasceu', dias: 0, cor: '#6B7280' }

  const dias  = Math.floor(ms / 86400000)
  const meses = Math.floor(dias / 30.44)
  const anos  = Math.floor(dias / 365.25)

  let label, cor
  if (dias < 1)   { label = 'Recém-nascido';                          cor = '#F48FB1' }
  else if (dias < 7)  { label = `${dias} dia${dias > 1 ? 's' : ''}`;     cor = '#F48FB1' }
  else if (dias < 30) { label = `${dias} dias`;                           cor = '#F4A261' }
  else if (meses < 12){ const d = dias % 30; label = `${meses}m${d ? ` ${d}d` : ''}`; cor = '#E9C46A' }
  else                { const m = meses % 12; label = `${anos}a${m ? ` ${m}m` : ''}`; cor = '#52B788' }

  return { label, dias, meses, anos, cor }
}

// ── Estoque de sal ────────────────────────────────────────────────
// Calcula kg restante e dias de estoque para um pasto
// pid: id do pasto | n: nº de animais | regs: registros de sal | tx: g/animal/dia
export function calcSal(pid, n, regs, tx = 225) {
  const items = [...regs.filter(s => s.pastoId === pid)]
    .sort((a, b) => a.data.localeCompare(b.data))

  const cd = (n * tx) / 1000  // consumo diário em kg

  if (!items.length) return { kg: 0, dias: 0, cd, alerta: true }

  let kg = 0, ant = null
  for (const it of items) {
    if (ant) {
      const d = (new Date(it.data + 'T12:00') - new Date(ant + 'T12:00')) / 86400000
      kg = Math.max(0, kg - cd * d)
    }
    kg += it.sacos * 30
    ant = it.data
  }

  if (ant) {
    const d = (Date.now() - new Date(ant + 'T12:00')) / 86400000
    kg = Math.max(0, kg - cd * d)
  }

  return { kg, dias: cd > 0 ? kg / cd : 999, cd, alerta: kg < cd * 7 }
}
