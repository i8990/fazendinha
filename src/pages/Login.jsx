import { useState } from 'react'
import { signIn, signUp } from '../supabase.js'

const T = {
  gDark:  '#1a5c2e',
  green:  '#2d8a4e',
  gPale:  '#e8f5ed',
  red:    '#c0392b',
  white:  '#ffffff',
  gray:   '#6b7280',
  light:  '#f9fafb',
}

export default function Login({ onLogin }) {
  const [aba, setAba]       = useState('entrar')
  const [email, setEmail]   = useState('')
  const [senha, setSenha]   = useState('')
  const [erro, setErro]     = useState('')
  const [ok, setOk]         = useState('')
  const [load, setLoad]     = useState(false)

  const limpa = () => { setErro(''); setOk('') }

  const handleEntrar = async () => {
    limpa()
    if (!email || !senha) { setErro('Preencha e-mail e senha.'); return }
    setLoad(true)
    try {
      const user = await signIn(email, senha)
      onLogin(user)
    } catch (e) {
      setErro(e.message || 'Erro ao entrar.')
    } finally { setLoad(false) }
  }

  const handleCadastrar = async () => {
    limpa()
    if (!email || !senha) { setErro('Preencha e-mail e senha.'); return }
    if (senha.length < 6)  { setErro('Senha precisa ter pelo menos 6 caracteres.'); return }
    setLoad(true)
    try {
      await signUp(email, senha)
      setOk('Conta criada! Agora entre com seus dados.')
      setAba('entrar')
    } catch (e) {
      setErro(e.message || 'Erro ao criar conta.')
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
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 56px)',
      paddingBottom: 40,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
    },
    logo: {
      fontSize: 52,
      lineHeight: 1,
    },
    titulo: {
      fontSize: 26,
      fontWeight: 700,
      color: T.white,
      letterSpacing: -0.5,
    },
    sub: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.75)',
    },
    card: {
      width: '100%',
      flex: 1,
      background: T.white,
      borderRadius: '26px 26px 0 0',
      marginTop: -18,
      padding: '28px 24px 40px',
      boxSizing: 'border-box',
    },
    tabs: {
      display: 'flex',
      background: T.light,
      borderRadius: 14,
      padding: 4,
      marginBottom: 28,
    },
    tab: (ativo) => ({
      flex: 1,
      padding: '10px 0',
      border: 'none',
      borderRadius: 11,
      fontFamily: 'inherit',
      fontSize: 15,
      fontWeight: ativo ? 600 : 400,
      color: ativo ? T.gDark : T.gray,
      background: ativo ? T.white : 'transparent',
      boxShadow: ativo ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
      cursor: 'pointer',
      transition: 'all .2s',
    }),
    label: {
      fontSize: 13,
      fontWeight: 600,
      color: T.gDark,
      marginBottom: 6,
      display: 'block',
    },
    inp: {
      width: '100%',
      padding: '14px 16px',
      borderRadius: 14,
      border: `1.5px solid #e5e7eb`,
      fontSize: 16,
      fontFamily: 'inherit',
      color: '#111',
      background: T.light,
      boxSizing: 'border-box',
      outline: 'none',
      marginBottom: 16,
      transition: 'border .2s',
    },
    btn: {
      width: '100%',
      padding: '16px 0',
      borderRadius: 16,
      border: 'none',
      background: `linear-gradient(160deg, ${T.gDark}, ${T.green})`,
      color: T.white,
      fontSize: 17,
      fontWeight: 700,
      fontFamily: 'inherit',
      cursor: load ? 'not-allowed' : 'pointer',
      opacity: load ? 0.7 : 1,
      marginTop: 4,
      transition: 'opacity .2s',
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
    sucesso: {
      background: T.gPale,
      color: T.gDark,
      borderRadius: 12,
      padding: '12px 16px',
      fontSize: 14,
      marginBottom: 16,
    },
    esqueci: {
      display: 'block',
      textAlign: 'center',
      marginTop: 20,
      fontSize: 14,
      color: T.gray,
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      fontFamily: 'inherit',
    }
  }

  return (
    <div style={s.wrap}>
      <div style={s.hero}>
        <div style={s.logo}>🌿</div>
        <div style={s.titulo}>Fazendinha</div>
        <div style={s.sub}>Gestão do seu campo</div>
      </div>

      <div style={s.card}>
        <div style={s.tabs}>
          <button style={s.tab(aba === 'entrar')}    onClick={() => { setAba('entrar');    limpa() }}>Entrar</button>
          <button style={s.tab(aba === 'cadastrar')} onClick={() => { setAba('cadastrar'); limpa() }}>Criar conta</button>
        </div>

        {erro && <div style={s.erro}>⚠️ {erro}</div>}
        {ok   && <div style={s.sucesso}>✅ {ok}</div>}

        <label style={s.label}>E-mail</label>
        <input
          style={s.inp}
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoCapitalize="none"
        />

        <label style={s.label}>Senha</label>
        <input
          style={s.inp}
          type="password"
          placeholder="••••••••"
          value={senha}
          onChange={e => setSenha(e.target.value)}
        />

        <button
          style={s.btn}
          onClick={aba === 'entrar' ? handleEntrar : handleCadastrar}
          disabled={load}
        >
          {load ? 'Aguarde...' : aba === 'entrar' ? 'Entrar' : 'Criar conta'}
        </button>

        {aba === 'entrar' && (
          <button style={s.esqueci} onClick={() => alert('Em breve: recuperação de senha por e-mail.')}>
            Esqueci minha senha
          </button>
        )}
      </div>
    </div>
  )
}
