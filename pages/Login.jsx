// ═══ LOGIN ════════════════════════════════════════════════════════
import { useState }             from 'react'
import { LIGHT, DARK }          from '../constants.js'
import { signIn, signUp }       from '../supabase.js'

export default function Login({ onLogin }) {
  const T = LIGHT
  const [modo,    setModo]    = useState('entrar')
  const [email,   setEmail]   = useState('')
  const [senha,   setSenha]   = useState('')
  const [loading, setLoading] = useState(false)
  const [erro,    setErro]    = useState('')
  const [sucesso, setSucesso] = useState('')

  const limpar = () => { setErro(''); setSucesso('') }

  const handleEntrar = async () => {
    if (!email.trim() || !senha) return
    setLoading(true); limpar()
    try {
      const user = await signIn(email, senha)
      onLogin(user)
    } catch {
      setErro('E-mail ou senha incorretos.')
    }
    setLoading(false)
  }

  const handleCadastrar = async () => {
    if (!email.trim() || !senha) return
    if (senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return }
    setLoading(true); limpar()
    try {
      const user = await signUp(email, senha)
      if (user) onLogin(user)
      else setSucesso('Verifique seu e-mail para confirmar o cadastro.')
    } catch {
      setErro('Não foi possível criar a conta. Tente outro e-mail.')
    }
    setLoading(false)
  }

  const inp = (label, value, onChange, type, placeholder) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.gray, marginBottom: 6 }}>{label}</label>
      <input
        value={value}
        onChange={e => { onChange(e.target.value); limpar() }}
        type={type}
        placeholder={placeholder}
        style={{
          width: '100%', border: 'none', borderRadius: 13,
          padding: '0 15px', height: 50, fontSize: 16,
          outline: 'none', boxSizing: 'border-box',
          background: '#F2F2F7', color: '#1C1C1E',
          boxShadow: `0 0 0 1px ${T.border}`
        }}
      />
    </div>
  )

  return (
    <div style={{
      minHeight: '100dvh', background: T.bg,
      display: 'flex', flexDirection: 'column',
      maxWidth: 500, margin: '0 auto'
    }}>

      {/* Topo */}
      <div style={{
        background: 'linear-gradient(160deg,#1a3a1a 0%,#2D6A4F 100%)',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 60px)',
        paddingBottom: 48, paddingLeft: 28, paddingRight: 28,
        textAlign: 'center', borderRadius: '0 0 36px 36px'
      }}>
        <div style={{
          width: 88, height: 88, borderRadius: 26, overflow: 'hidden',
          margin: '0 auto 18px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
          border: '3px solid rgba(255,255,255,0.2)'
        }}>
          <img src="/logo.png" alt="Fazendinha" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ color: '#FFF', fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>Fazendinha 🌾</div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 6 }}>Gestão rural no campo</div>

        {/* Tabs */}
        <div style={{
          display: 'flex', background: 'rgba(0,0,0,0.18)',
          borderRadius: 14, padding: 4, marginTop: 28, gap: 4
        }}>
          {[['entrar','Entrar'],['cadastrar','Criar conta']].map(([id, label]) => (
            <button key={id} onClick={() => { setModo(id); limpar() }} style={{
              flex: 1, border: 'none', borderRadius: 11, padding: '10px 0',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              background: modo === id ? '#FFF' : 'transparent',
              color: modo === id ? '#1a3a1a' : 'rgba(255,255,255,0.7)',
              boxShadow: modo === id ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              transition: 'all 0.2s'
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Formulário */}
      <div style={{ flex: 1, padding: '32px 24px 40px' }}>

        {erro && (
          <div style={{
            background: '#FFE4E6', border: '1.5px solid #FFB3BA',
            borderRadius: 14, padding: '12px 16px', marginBottom: 18,
            fontSize: 13, color: '#C0392B', fontWeight: 600, lineHeight: 1.5
          }}>⚠️ {erro}</div>
        )}
        {sucesso && (
          <div style={{
            background: '#E8F5E9', border: '1.5px solid #A5D6A7',
            borderRadius: 14, padding: '12px 16px', marginBottom: 18,
            fontSize: 13, color: '#1a3a1a', fontWeight: 600, lineHeight: 1.5
          }}>✅ {sucesso}</div>
        )}

        {inp('E-mail', email, setEmail, 'email', 'seuemail@exemplo.com')}
        {inp('Senha',  senha, setSenha, 'password', modo === 'cadastrar' ? 'Mínimo 6 caracteres' : '••••••••')}

        <button
          onClick={modo === 'entrar' ? handleEntrar : handleCadastrar}
          disabled={loading || !email.trim() || !senha}
          style={{
            width: '100%', height: 52, border: 'none', borderRadius: 16,
            background: loading || !email.trim() || !senha ? '#C7C7CC' : '#2D6A4F',
            color: '#FFF', fontSize: 16, fontWeight: 700,
            cursor: loading || !email.trim() || !senha ? 'not-allowed' : 'pointer',
            marginTop: 8, transition: 'background 0.2s'
          }}
        >
          {loading ? '...' : modo === 'entrar' ? '🌾 Entrar' : '🌱 Criar conta'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 40, fontSize: 11, color: T.gray, lineHeight: 1.6 }}>
          Seus dados ficam seguros e sincronizados.
        </div>
      </div>
    </div>
  )
}
