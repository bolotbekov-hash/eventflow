import { Link, useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      flexDirection:'column', padding:24, background:'var(--bg-primary)', textAlign:'center' }}>
      <div style={{ fontFamily:'var(--font-display)', fontSize:'8rem', fontWeight:800, lineHeight:1,
        background:'linear-gradient(135deg,var(--accent),#a78bfa)',
        WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
        marginBottom:16, letterSpacing:'-0.04em' }}>
        404
      </div>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:800, marginBottom:12 }}>
        Page not found
      </h1>
      <p style={{ color:'var(--text-muted)', maxWidth:340, lineHeight:1.7, marginBottom:32 }}>
        The page you're looking for doesn't exist or you don't have permission to access it.
      </p>
      <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
        <button className="btn btn-secondary btn-lg" onClick={() => navigate(-1)}>← Go Back</button>
        <Link to="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard</Link>
      </div>
    </div>
  )
}
