// ═══ NOME FAZENDA — configuração inicial ══════════════════════════
import { useState }          from 'react'
import { savePerfil, supabaseClient } from '../supabase.js'

export default function NomeFazenda({ user, onSalvo }) {
  const [nome,    setNome]    = useState('')
  const [loading, setLoading] = useState(false)
  const [erro,    setErro]    = useState('')

  const handleSalvar = async () => {
    if (!nome.trim()) return
    setLoading(true); setErro('')
    try {
      // Garante sessão ativa antes de salvar
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) {
        setErro('Sessão expirada. Faça login novamente.')
        setLoading(false)
        return
      }
      const perfil = await savePerfil(user.id, nome.trim())
      onSalvo(perfil)
    } catch (e) {
      console.error('Erro ao salvar perfil:', e)
      setErro('Não foi possível salvar. Tente novamente.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg,#1a3a1a 0%,#2D6A4F 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 28px', maxWidth: 500, margin: '0 auto'
    }}>

      {/* Logo */}
      <div style={{
        width: 88, height: 88, borderRadius: 26, overflow: 'hidden',
        marginBottom: 24, boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
        border: '3px solid rgba(255,255,255,0.2)'
      }}>
        <img src="/logo.png" alt="Fazendinha" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <div style={{ color: '#FFF', fontSize: 24, fontWeight: 800, textAlign: 'center', letterSpacing: '-0.5px' }}>
        Qual o nome da sua fazenda?
      </div>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 10, textAlign: 'center', lineHeight: 1.5 }}>
        Esse nome aparecerá na tela principal do aplicativo.
      </div>

      {/* Card */}
      <div style={{
        background: '#FFF', borderRadius: 24, padding: 24,
        width: '100%', marginTop: 32,
        boxShadow: '0 12px 40px rgba(0,0,0,0.2)'
      }}>
        {erro && (
          <div style={{
            background: '#FFE4E6', borderRadius: 12, padding: '10px 14px',
            marginBottom: 16, fontSize: 13, color: '#C0392B', fontWeight: 600
          }}>⚠️ {erro}</div>
        )}

        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 6 }}>
          Nome da fazenda
        </label>
        <input
          value={nome}
          onChange={e => setNome(e.target.value)}
          placeholder="Ex: Fazenda Santa Clara"
          autoFocus
          onKeyDown={e => e.key === 'Enter' && handleSalvar()}
          style={{
            width: '100%', border: 'none', borderRadius: 13,
            padding: '0 15px', height: 50, fontSize: 16,
            outline: 'none', boxSizing: 'border-box',
            background: '#F2F2F7', color: '#1C1C1E',
            boxShadow: '0 0 0 1px #E5E5EA',
            marginBottom: 16
          }}
        />

        <button
          onClick={handleSalvar}
          disabled={loading || !nome.trim()}
          style={{
            width: '100%', height: 52, border: 'none', borderRadius: 16,
            background: loading || !nome.trim() ? '#C7C7CC' : '#2D6A4F',
            color: '#FFF', fontSize: 16, fontWeight: 700,
            cursor: loading || !nome.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '...' : '🌾 Começar'}
        </button>
      </div>
    </div>
  )
}
