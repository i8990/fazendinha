// ═══ CONSTANTS — tema, paletas e enums globais ════════════════════
// Importado por: ui.jsx, storage.js (TODAY via utils), todas as páginas via useT()
// Zero dependências externas.

import { createContext, useContext } from 'react'

// ── Theme context ─────────────────────────────────────────────────
export const TC   = createContext({})
export const useT = () => useContext(TC)

// ── Paleta Light — Apple Rural / Fazenda Premium ──────────────────
export const LIGHT = {
  // Brand (terra, oliva, argila)
  green:'#55604D', gDark:'#4E3B31', gLight:'#8A6B55', gPale:'#EDE8DF',
  // System colors — dessaturados
  orange:'#B87333', yellow:'#C8A84B', red:'#9B4C3C',
  blue:'#5B7B8A', bLight:'#8AAAB8',
  // Surfaces
  bg:'#ECE9E2', card:'#F9F7F3',
  // Typography
  text:'#2E2D2A', gray:'#7A6F65',
  // Structural
  border:'#D7C7AE',
  // Accents
  pink:'#9B4C3C', pinkPale:'#F5EDE9', pinkDark:'#7A3228',
  bluePale:'#E8EFF2', blueMid:'#5B7B8A',
  purple:'#7A6B8A', purplePale:'#EDE9F2',
  // Shadow
  shadow:'rgba(78,59,49,0.08)'
}

// ── Paleta Dark ───────────────────────────────────────────────────
export const DARK = {
  // Brand
  green:'#8A9A7A', gDark:'#3A2D25', gLight:'#A0906C', gPale:'#2A2018',
  // System colors
  orange:'#C89050', yellow:'#C8A84B', red:'#C46A58',
  blue:'#7A9BAA', bLight:'#8AAAB8',
  // Surfaces
  bg:'#1A1512', card:'#252018',
  // Typography
  text:'#F0EBE3', gray:'#9A8A7A',
  // Structural
  border:'#3A3028',
  // Accents
  pink:'#C46A58', pinkPale:'#2D1A16', pinkDark:'#C46A58',
  bluePale:'#0F1E24', blueMid:'#7A9BAA',
  purple:'#9A8AAA', purplePale:'#1E1828',
  // Shadow
  shadow:'rgba(0,0,0,0.4)'
}

// ── Status de pasto ───────────────────────────────────────────────
export const PS = {
  ocupado:     { l:'Ocupado',     c:'#8A6B55', bg:'#EDE8DF' },
  vazio:       { l:'Vazio',       c:'#55604D', bg:'#E4E8DF' },
  descanso:    { l:'Descanso',    c:'#7A6B8A', bg:'#EDE9F2' },
  degradado:   { l:'Degradado',   c:'#9B4C3C', bg:'#F5EDE9' },
  recuperando: { l:'Recuperando', c:'#C8A84B', bg:'#F5F0E0' }
}

// ── Estado do pasto ───────────────────────────────────────────────
export const PE = {
  bom:       { l:'Bom',       c:'#55604D' },
  medio:     { l:'Médio',     c:'#C8A84B' },
  ruim:      { l:'Ruim',      c:'#B87333' },
  muito_ruim:{ l:'Muito Ruim',c:'#9B4C3C' }
}

// ── Tipos de manejo ───────────────────────────────────────────────
export const TM = [
  { v:'ivermectina', l:'Ivermectina',  icon:'💉', c:'#7A6B8A' },
  { v:'fio_do_lombo',l:'Fio do Lombo', icon:'🩺', c:'#9B4C3C' },
  { v:'antibiotico', l:'Antibiótico',  icon:'💊', c:'#B87333' },
  { v:'vacina',      l:'Vacina',       icon:'🩹', c:'#55604D' },
  { v:'vermifugo',   l:'Vermífugo',    icon:'🔬', c:'#5B7B8A' },
  { v:'outro',       l:'Outro',        icon:'✚',  c:'#7A6F65' }
]

// ── Meses ─────────────────────────────────────────────────────────
export const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
]
