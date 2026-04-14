import { Link } from 'react-router-dom'
import { useAuth } from '../context/index.jsx'
import { useRole } from '../hooks/index.js'
import { ROLE_CONFIG } from '../utils/index.js'

const FEATURES = [
  { icon: '📅', title: 'Event Management',    desc: 'Create and manage conferences, concerts, workshops and more with full CRUD.' },
  { icon: '🎟', title: 'Registration System', desc: 'Register for events, track seat capacity, manage your attendance list.' },
  { icon: '👑', title: 'Role-Based Access',   desc: 'Admin, Organizer, Venue Manager, Attendee — each role sees different features.' },
  { icon: '🔍', title: 'Search & Filter',     desc: 'Find events by name, category, status. Sort by date, price, or capacity.' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'Live stats: total events, attendees, status breakdown, featured events.' },
  { icon: '🌙', title: 'Dark Mode',           desc: 'Full dark/light theme support, saved automatically to localStorage.' },
]

const ROLE_FEATURES = [
  { role: 'Admin',           icon: '👑', perms: ['Everything: full access', 'Manage all users & roles', 'Delete any event', 'View all statistics'] },
  { role: 'Organizer',       icon: '🎪', perms: ['Create & publish events', 'Edit and delete own events', 'View event statistics', 'Manage registrations'] },
  { role: 'Venue Manager',   icon: '🏛', perms: ['Edit venue/location info', 'View statistics', 'Browse all events', 'Cannot create events'] },
  { role: 'Attendee',        icon: '🎟', perms: ['Browse all events', 'Register & unregister', 'View my registrations', 'No create/edit access'] },
]

export default function HomePage() {
  const { isAuthenticated, user } = useAuth()
  const { role } = useRole()
  const rc = ROLE_CONFIG[role] || {}

  return (
    <div className="fade-in">
      {/* Hero */}
      <div className="home-hero">
        <div className="home-hero-tag">🎪 Event Management System</div>
        <h1 className="home-hero-title">Manage events<br /><span>like a pro.</span></h1>
        <p className="home-hero-desc">
          EventFlow is a full-featured event management platform with role-based access control.
          Organizers create events, Attendees register, Admins manage everything.
        </p>
        <div className="home-hero-actions">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard</Link>
              <Link to="/events" className="btn btn-secondary btn-lg">Browse Events</Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
              <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
            </>
          )}
        </div>
      </div>

      {/* Welcome banner */}
      {isAuthenticated && (
        <div style={{
          background: rc.bg || 'var(--accent-light)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 24px',
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
        }}>
          <span style={{ fontSize: '1.6rem' }}>{rc.icon}</span>
          <div>
            <strong>Welcome back, {user?.name}!</strong>
            <span style={{ marginLeft: 8, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              You are signed in as <span style={{ color: rc.color, fontWeight: 700 }}>{role}</span>
            </span>
          </div>
          <Link to="/dashboard" className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>
            Dashboard →
          </Link>
        </div>
      )}

      {/* Features grid */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, marginBottom: 16 }}>
        Everything you need
      </h2>
      <div className="grid-3" style={{ marginBottom: 32 }}>
        {FEATURES.map(f => (
          <div key={f.title} className="card card-hover" style={{ padding: 24 }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>{f.icon}</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Role comparison */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, marginBottom: 16 }}>
        Role-based access
      </h2>
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {ROLE_FEATURES.map(r => {
          const rc2 = ROLE_CONFIG[r.role] || {}
          return (
            <div key={r.role} className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>{r.icon}</div>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem',
                color: rc2.color, marginBottom: 12,
              }}>{r.role}</div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {r.perms.map(p => (
                  <li key={p} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: 6 }}>
                    <span style={{ color: rc2.color, flexShrink: 0 }}>✓</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {!isAuthenticated && (
        <div className="card" style={{ padding: 28, textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>
            Try different roles instantly
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 20 }}>
            Use the demo accounts on the login page to experience how each role works.
          </p>
          <Link to="/login" className="btn btn-primary btn-lg">Go to Login →</Link>
        </div>
      )}
    </div>
  )
}
