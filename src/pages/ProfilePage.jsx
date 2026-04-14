import { useState } from 'react'
import { useAuth, useToast } from '../context/index.jsx'
import { useRole } from '../hooks/index.js'
import { registrationsService } from '../services/api.js'
import { RoleBadge } from '../components/ui.jsx'
import { formatDate, ROLE_CONFIG } from '../utils/index.js'

const ROLES = ['Admin', 'Attendee', 'Organizer', 'Venue Manager', 'Sponsor', 'Press']

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const toast   = useToast()
  const { role, canViewStats } = useRole()
  const rc      = ROLE_CONFIG[role] || {}

  const [editing,   setEditing]   = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [form,      setForm]      = useState({ name: user?.name || '', role: user?.role || '' })
  const [formError, setFormError] = useState('')

  const myRegsCount = user ? registrationsService.getByUser(user.email).length : 0
  const initials    = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setFormError('')
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim() || form.name.trim().length < 2) {
      setFormError('Name must be at least 2 characters.')
      return
    }
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    updateUser({ name: form.name.trim(), role: form.role })
    toast.success('Profile updated!')
    setEditing(false)
    setSaving(false)
  }

  // Role-specific permission summary
  const ROLE_PERMISSIONS = {
    Admin:           ['Full access to everything', 'Manage all users & roles', 'Create, edit, delete any event', 'View all statistics'],
    Organizer:       ['Create and publish events', 'Edit and delete own events', 'View event statistics', 'Register for events'],
    'Venue Manager': ['Edit event venue/location info', 'View statistics', 'Browse all events', 'Register for events'],
    Attendee:        ['Browse all events', 'Register and unregister', 'View your registrations', 'No create/edit access'],
    Sponsor:         ['Browse events', 'View event details', 'No registration or edit access'],
    Press:           ['Browse events', 'View event details', 'No registration or edit access'],
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">My Profile</h1>
          <p className="page-header-subtitle">Manage your account details and preferences.</p>
        </div>
      </div>

      {/* Profile hero */}
      <div className="profile-header">
        <div className="profile-avatar-large" style={{ background: rc.bg, color: rc.color }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', marginBottom: 6 }}>
            {user?.name}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 10 }}>
            {user?.email}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <RoleBadge role={role} />
            <span className="badge badge-neutral">
              🎟 {myRegsCount} Registration{myRegsCount !== 1 ? 's' : ''}
            </span>
            <span className="badge badge-neutral">
              📅 Member since {formatDate(user?.createdAt)}
            </span>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditing(true); setFormError('') }}>
          ✏ Edit
        </button>
      </div>

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Account info */}
        <div className="card">
          <div className="card-header" style={{ paddingBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>
              Account Info
            </h3>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            {[
              { label: 'Full Name',    value: user?.name },
              { label: 'Email',        value: user?.email },
              { label: 'Role',         value: <RoleBadge role={role} /> },
              { label: 'Member Since', value: formatDate(user?.createdAt) },
              { label: 'Registrations', value: `${myRegsCount} events` },
            ].map(s => (
              <div key={s.label} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 3 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {s.value || '—'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit profile */}
        <div className="card">
          <div className="card-header" style={{ paddingBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>
              Edit Profile
            </h3>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            {editing ? (
              <form onSubmit={handleSave} noValidate>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className={`form-control${formError ? ' error' : ''}`}
                      name="name" value={form.name} onChange={handleChange} />
                    {formError && <span className="form-error">⚠ {formError}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select className="form-control" name="role" value={form.role} onChange={handleChange}>
                      {ROLES.map(r => <option key={r} value={r}>{ROLE_CONFIG[r]?.icon} {r}</option>)}
                    </select>
                    <span className="form-hint">Changing role affects what you can access.</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? '⏳ Saving…' : '✓ Save'}
                    </button>
                    <button type="button" className="btn btn-secondary"
                      onClick={() => { setEditing(false); setFormError('') }}>
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 16 }}>
                  Update your name or switch roles to change your access level.
                </p>
                <button className="btn btn-secondary" onClick={() => setEditing(true)}>
                  ✏ Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Role permissions */}
        <div className="card" style={{ borderLeft: `3px solid ${rc.color}` }}>
          <div className="card-header" style={{ paddingBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>
              {rc.icon} Your Permissions ({role})
            </h3>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(ROLE_PERMISSIONS[role] || []).map(p => (
                <li key={p} style={{ display: 'flex', gap: 8, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: rc.color, flexShrink: 0, fontWeight: 700 }}>✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Danger zone */}
        <div className="card" style={{ borderColor: 'var(--danger-light)' }}>
          <div className="card-header" style={{ paddingBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--danger)' }}>
              Danger Zone
            </h3>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 16 }}>
              Once you sign out, you'll need your credentials to log back in.
            </p>
            <button className="btn btn-danger" onClick={logout}>↩ Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  )
}
