import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth, useToast } from '../context/index.jsx'
import { useForm } from '../hooks/index.js'
import { authService } from '../services/api.js'
import { validateLogin } from '../utils/index.js'

export default function LoginPage() {
  const { login }    = useAuth()
  const toast        = useToast()
  const navigate     = useNavigate()
  const location     = useLocation()
  const [busy, setBusy] = useState(false)
  const from = location.state?.from?.pathname || '/dashboard'

  const { values, errors, touched, handleChange, handleBlur, validateAll } =
    useForm({ email: '', password: '' }, validateLogin)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validateAll()) return
    setBusy(true)
    try {
      const { user, token } = await authService.login(values)
      login(user, token)
      toast.success('Welcome back!', `Good to see you, ${user.name}`)
      navigate(from, { replace: true })
    } catch (err) {
      toast.error('Login failed', err.message)
    } finally { setBusy(false) }
  }

  async function demoLogin(role) {
    setBusy(true)
    const accounts = {
      Admin:     { name: 'Admin User',     email: 'admin@eventflow.app',    password: 'demo1234', role: 'Admin' },
      Organizer: { name: 'Alex Organizer', email: 'organizer@eventflow.app', password: 'demo1234', role: 'Organizer' },
      Attendee:  { name: 'Sam Attendee',   email: 'attendee@eventflow.app',  password: 'demo1234', role: 'Attendee' },
    }
    const acc = accounts[role]
    try {
      try { await authService.register(acc) } catch { /* already exists */ }
      const { user, token } = await authService.login({ email: acc.email, password: acc.password })
      login(user, token)
      toast.success(`Logged in as ${role}`, user.name)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error('Demo failed', err.message)
    } finally { setBusy(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <div className="auth-logo-icon">🎪</div>
          <span className="auth-logo-text">EventFlow</span>
        </div>

        <div className="auth-card fade-in">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to manage your events</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className={`form-control${touched.email && errors.email ? ' error' : ''}`}
                type="email" name="email" value={values.email}
                onChange={handleChange} onBlur={handleBlur} placeholder="you@example.com" />
              {touched.email && errors.email && <span className="form-error">⚠ {errors.email}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className={`form-control${touched.password && errors.password ? ' error' : ''}`}
                type="password" name="password" value={values.password}
                onChange={handleChange} onBlur={handleBlur} placeholder="••••••••" />
              {touched.password && errors.password && <span className="form-error">⚠ {errors.password}</span>}
            </div>
            <button type="submit" className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
              {busy ? '⏳ Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div className="auth-divider"><span>or try a demo account</span></div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn-secondary" style={{ justifyContent: 'space-between' }}
              onClick={() => demoLogin('Admin')} disabled={busy}>
              <span>👑 Admin Demo</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Full access</span>
            </button>
            <button className="btn btn-secondary" style={{ justifyContent: 'space-between' }}
              onClick={() => demoLogin('Organizer')} disabled={busy}>
              <span>🎪 Organizer Demo</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Create & manage events</span>
            </button>
            <button className="btn btn-secondary" style={{ justifyContent: 'space-between' }}
              onClick={() => demoLogin('Attendee')} disabled={busy}>
              <span>🎟 Attendee Demo</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Browse & register</span>
            </button>
          </div>

          <p className="auth-switch">
            No account? <Link to="/register">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
