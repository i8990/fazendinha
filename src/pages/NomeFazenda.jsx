import { useState } from 'react'
import { savePerfil } from '../supabase.js'

const T = {
  gDark: '#1a5c2e',
  green: '#2d8a4e',
  gPale: '#e8f5ed',
  red:   '#c0392b',
  white: '#ffffff',
  gray:  '#6b7280',
  light: '#f9fafb',
}

export default function NomeFazenda({ user, onSalvo }) {
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState('')
  const [load, setLoad] = useState(false)

  const handleSalvar = async () => {
    setErro('')
    if (!nome.trim()) { setErro('Digite o nome da sua fazenda.'); return }
    setLoad(true)
    try {
      const perfil = await savePerfil(user.id, nome.trim())
      onSalvo(perfil)
    } catch (e) {
      setErro(e.message || 'Erro ao salvar.')
    } finally { setLoad(false) }
  }

  const s = {
    wrap: {
      minHeight: '100dvh',
      background: T.light,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: "'SF Pro Display', system-ui, sans-serif",
      maxWidth: 500,
      margin: '0 auto',
    },
    hero: {
      width: '100%',
      background: `linear-gradient(160deg, ${T.gDark}, ${T.green})`,
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 64px)',
      paddingBottom: 48,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
    },
    logo: {
      fontSize: 56,
      lineHeight: 1,
    },
    titulo: {
      fontSize: 24,
      fontWeight: 700,
      color: T.white,
      letterSpacing: -0.5,
    },
    sub: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.75)',
      textAlign: 'center',
      padding: '0 32px',
    },
    card: {
      width: '100%',
      flex: 1,
      background: T.white,
      borderRadius: '26px 26px 0 0',
      marginTop: -18,
      padding: '32px 24px 40px',
      boxSizing: 'border-box',
    },
    label: {
      fontSize: 13,
      fontWeight: 600,
      color: T.gDark,
      marginBottom: 6,
      display: 'block',
    },
    hint: {
      fontSize: 13,
      color: T.gray,
      marginBottom: 20,
    },
    inp: {
      width: '100%',
      padding: '16px 18px',
      borderRadius: 16,
      border: `1.5px solid #e5e7eb`,
      fontSize: 18,
      fontFamily: 'inherit',
      color: '#111',
      background: T.light,
      boxSizing: 'border-box',
      outline: 'none',
      marginBottom: 24,
    },
    btn: {
      width: '100%',
      padding: '17px 0',
      borderRadius: 16,
      border: 'none',
      background: `linear-gradient(160deg, ${T.gDark}, ${T.green})`,
      color: T.white,
      fontSize: 17,
      fontWeight: 700,
      fontFamily: 'inherit',
      cursor: load ? 'not-allowed' : 'pointer',
      opacity: load ? 0.7 : 1,
      letterSpacing: -0.3,
    },
    erro: {
      background: '#FFE4E6',
      color: T.red,
      borderRadius: 12,
      padding: '12px 16px',
      fontSize: 14,
      marginBottom: 16,
    },
  }

  return (
    <div style={s.wrap}>
      <div style={s.hero}>
        <div style={s.logo}>🏡</div>
        <div style={s.titulo}>Bem-vindo!</div>
        <div style={s.sub}>Como você quer chamar a sua fazenda?</div>
      </div>

      <div style={s.card}>
        {erro && <div style={s.erro}>⚠️ {erro}</div>}

        <label style={s.label}>Nome da fazenda</label>
        <p style={s.hint}>Esse nome aparecerá no seu painel principal.</p>

        <input
          style={s.inp}
          type="text"
          placeholder="Ex: Fazenda São João"
          value={nome}
          onChange={e => setNome(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSalvar()}
          autoFocus
        />

        <button style={s.btn} onClick={handleSalvar} disabled={load}>
          {load ? 'Salvando...' : 'Começar 🌿'}
        </button>
      </div>
    </div>
  )
}
