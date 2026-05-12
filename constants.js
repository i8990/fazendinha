// ═══ CONSTANTS — tema, paletas e enums globais ════════════════════
// Importado por: ui.jsx, storage.js (TODAY via utils), todas as páginas via useT()
// Zero dependências externas.

import { createContext, useContext } from 'react'

// ── Theme context ─────────────────────────────────────────────────
export const TC   = createContext({})
export const useT = () => useContext(TC)

// ── Paleta Light ──────────────────────────────────────────────────
export const LIGHT = {
  // Brand greens (farm identity)
  green:'#1A7A4A', gDark:'#0F4D2E', gLight:'#30A86A', gPale:'#EAF7F0',
  // System colors (Apple-inspired)
  orange:'#FF9F0A', yellow:'#FFD60A', red:'#FF3B30',
  blue:'#007AFF', bLight:'#5AC8FA',
  // Surfaces
  bg:'#F5F5F7', card:'#FFFFFF',
  // Typography
  text:'#1D1D1F', gray:'#6E6E73',
  // Structural
  border:'#E5E5EA',
  // Accents
  pink:'#FF2D55', pinkPale:'#FFF0F4', pinkDark:'#C7002C',
  bluePale:'#EBF5FF', blueMid:'#007AFF',
  purple:'#BF5AF2', purplePale:'#F5EEFF',
  // Shadow
  shadow:'rgba(0,0,0,0.06)'
}

// ── Paleta Dark ───────────────────────────────────────────────────
export const DARK = {
  // Brand greens
  green:'#30D158', gDark:'#1A3A28', gLight:'#30D158', gPale:'#0D2B1A',
  // System colors
  orange:'#FF9F0A', yellow:'#FFD60A', red:'#FF453A',
  blue:'#0A84FF', bLight:'#5AC8FA',
  // Surfaces
  bg:'#000000', card:'#1C1C1E',
  // Typography
  text:'#FFFFFF', gray:'#8E8E93',
  // Structural
  border:'#38383A',
  // Accents
  pink:'#FF375F', pinkPale:'#2D0A14', pinkDark:'#FF375F',
  bluePale:'#001A3A', blueMid:'#0A84FF',
  purple:'#BF5AF2', purplePale:'#2A0D3C',
  // Shadow
  shadow:'rgba(0,0,0,0.4)'
}

// ── Status de pasto ───────────────────────────────────────────────
export const PS = {
  ocupado:     { l:'Ocupado',     c:'#F4A261', bg:'#FFF3E0' },
  vazio:       { l:'Vazio',       c:'#52B788', bg:'#D8F3DC' },
  descanso:    { l:'Descanso',    c:'#7B61FF', bg:'#EDE9FE' },
  degradado:   { l:'Degradado',   c:'#E63946', bg:'#FFE4E6' },
  recuperando: { l:'Recuperando', c:'#E9C46A', bg:'#FEFCE8' }
}

// ── Estado do pasto ───────────────────────────────────────────────
export const PE = {
  bom:       { l:'Bom',       c:'#52B788' },
  medio:     { l:'Médio',     c:'#E9C46A' },
  ruim:      { l:'Ruim',      c:'#F4A261' },
  muito_ruim:{ l:'Muito Ruim',c:'#E63946' }
}

// ── Tipos de manejo ───────────────────────────────────────────────
export const TM = [
  { v:'ivermectina', l:'Ivermectina',  icon:'💉', c:'#7B61FF' },
  { v:'fio_do_lombo',l:'Fio do Lombo', icon:'🩺', c:'#E63946' },
  { v:'antibiotico', l:'Antibiótico',  icon:'💊', c:'#F4A261' },
  { v:'vacina',      l:'Vacina',       icon:'🩹', c:'#52B788' },
  { v:'vermifugo',   l:'Vermífugo',    icon:'🔬', c:'#0077B6' },
  { v:'outro',       l:'Outro',        icon:'✚',  c:'#6B7280' }
]

// ── Meses ─────────────────────────────────────────────────────────
export const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
]
