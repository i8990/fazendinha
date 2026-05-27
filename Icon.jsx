// ═══ ICON — spritesheet11.png (1024x1024, grid 5x4, 20 ícones) ═══
const ICONS = {
  touro:         [0, 0],
  vaca:          [1, 0],
  bovino:        [2, 0],
  galpao:        [3, 0],
  fechar:        [4, 0],
  engrenagem:    [0, 1],
  busca:         [1, 1],
  check:         [2, 1],
  localizacao:   [3, 1],
  checkCirculo:  [4, 1],
  balanca:       [0, 2],
  folha:         [1, 2],
  sal:           [2, 2],
  grafico:       [3, 2],
  atencao:       [4, 2],
  alerta:        [0, 3],
  milho:         [1, 3],
  frasco:        [2, 3],
  broto:         [3, 3],
  calendario:    [4, 3],
}

export function Icon({ name, size = 24, style = {} }) {
  const entry = ICONS[name]
  if (!entry) return null
  const [col, row] = entry
  const scale = size / 24
  const bgSize = 120 * scale
  const x = col * 24 * scale
  const y = row * 24 * scale
  return (
    <span style={{
      display: 'inline-block',
      width: size,
      height: size,
      backgroundImage: 'url(/spritesheet11.png)',
      backgroundRepeat: 'no-repeat',
      backgroundSize: `${bgSize}px ${bgSize}px`,
      backgroundPosition: `-${x}px -${y}px`,
      flexShrink: 0,
      ...style
    }} />
  )
}
