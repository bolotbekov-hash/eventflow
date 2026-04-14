import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, useToast } from '../context/index.jsx'
import { useForm } from '../hooks/index.js'
import { authService } from '../services/api.js'
import { validateRegister, ROLE_CONFIG } from '../utils/index.js'

const ROLES = ['Admin', 'Attendee', 'Organizer', 'Venue Manager', 'Sponsor', 'Press']

export default function RegisterPage() {
  const { login } = useAuth()
  const toast     = useToast()
  const navigate  = useNavigate()
  const [busy, setBusy] = useState(false)

  const { values, errors, touched, handleChange, handleBlur, validateAll } =
    useForm({ name: '', email: '', password: '', confirmPassword: '', role: 'Attendee' }, validateRegister)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validateAll()) return
    setBusy(true)
    try {
      const { user, token } = await authService.register(values)
      login(user, token)
      toast.success('Account created!', `Welcome, ${user.name}`)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error('Registration failed', err.message)
    } finally { setBusy(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: 460 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">🎪</div>
          <span className="auth-logo-text">EventFlow</span>
        </div>

        <div className="auth-card fade-in">
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Start managing events today</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className={`form-control${touched.name && errors.name ? ' error' : ''}`}
                name="name" value={values.name} onChange={handleChange} onBlur={handleBlur}
                placeholder="Jane Smith" />
              {touched.name && errors.name && <span className="form-error">⚠ {errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input className={`form-control${touched.email && errors.email ? ' error' : ''}`}
                type="email" name="email" value={values.email}
                onChange={handleChange} onBlur={handleBlur} placeholder="you@example.com" />
              {touched.email && errors.email && <span className="form-error">⚠ {errors.email}</span>}
            </div>

            {/* Role selector with descriptions */}
            <div className="form-group">
              <label className="form-label">Your Role</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ROLES.map(r => {
                  const rc = ROLE_CONFIG[r]
                  return (
                    <label key={r} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${values.role === r ? rc.color : 'var(--border)'}`,
                      background: values.role === r ? rc.bg : 'var(--bg-primary)',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                      <input type="radio" name="role" value={r}
                        checked={values.role === r} onChange={handleChange}
                        style={{ accentColor: rc.color }} />
                      <span style={{ fontSize: '1.1rem' }}>{rc.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: values.role === r ? rc.color : 'var(--text-primary)' }}>
                          {r}
                        </div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                          {{
                            Admin: 'Full access to system',
                            Attendee:        'Browse and register for events',
                            Organizer:       'Create and manage events',
                            'Venue Manager': 'Manage venues and locations',
                            Sponsor:         'View and support events',
                            Press:           'View events for coverage',
                          }[r]}
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input className={`form-control${touched.password && errors.password ? ' error' : ''}`}
                type="password" name="password" value={values.password}
                onChange={handleChange} onBlur={handleBlur} placeholder="Min. 6 characters" />
              {touched.password && errors.password && <span className="form-error">⚠ {errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className={`form-control${touched.confirmPassword && errors.confirmPassword ? ' error' : ''}`}
                type="password" name="confirmPassword" value={values.confirmPassword}
                onChange={handleChange} onBlur={handleBlur} placeholder="Repeat password" />
              {touched.confirmPassword && errors.confirmPassword &&
                <span className="form-error">⚠ {errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
              {busy ? '⏳ Creating…' : 'Create Account →'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
