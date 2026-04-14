import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth, useToast, useTheme } from '../context/index.jsx'
import { useRole } from '../hooks/index.js'
import { ROLE_CONFIG } from '../utils/index.js'
import { UserAvatar } from './ui.jsx'

export default function Sidebar({ open, onClose }) {
  const { user, logout }  = useAuth()
  const { toggleTheme, theme } = useTheme()
  const toast             = useToast()
  const navigate          = useNavigate()
  const { role, canCreate, canViewStats, canManageUsers } = useRole()

  const rc = ROLE_CONFIG[role] || ROLE_CONFIG['Attendee']

  function handleLogout() {
    logout()
    toast.success('Logged out', 'See you next time!')
    navigate('/login')
  }

  const nl = (to, icon, label, end = false) => (
    <NavLink to={to} end={end}
      className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
      onClick={onClose}
    >
      <span className="nav-icon">{icon}</span>{label}
    </NavLink>
  )

  return (
    <>
      <div className={`sidebar-overlay${open ? '' : ' hidden'}`} onClick={onClose} />
      <aside className={`sidebar${open ? ' open' : ''}`}>

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🎪</div>
          <span className="sidebar-logo-text">EventFlow</span>
        </div>

        {/* Role badge */}
        <div style={{ padding: '10px 16px 0' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: rc.bg, color: rc.color,
            fontSize: '0.72rem', fontWeight: 700,
            padding: '4px 10px', borderRadius: 'var(--radius-full)',
            border: `1px solid ${rc.color}30`,
          }}>
            {rc.icon} {rc.label}
          </span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Main</div>
          {nl('/', '⌂', 'Home', true)}
          {nl('/dashboard', '⊞', 'Dashboard')}

          <div className="nav-section-label">Events</div>
          {nl('/events', '📅', 'All Events')}

          {/* Create — only for roles with 'create' permission */}
          {canCreate && nl('/events/create', '✚', 'Create Event')}

          {/* My Events — Attendees primarily */}
          {nl('/my-events', '★', 'My Registrations')}

          {/* Stats link — roles with view_stats */}
          {canViewStats && nl('/dashboard', '📊', 'Statistics')}

          {/* Admin panel — Admin only */}
          {canManageUsers && (
            <>
              <div className="nav-section-label">Administration</div>
              {nl('/admin', '👑', 'Admin Panel')}
            </>
          )}

          <div className="nav-section-label">Account</div>
          {nl('/profile', '◉', 'Profile')}
          <button className="nav-link" onClick={toggleTheme}
            style={{ width:'100%', textAlign:'left', cursor:'pointer' }}>
            <span className="nav-icon">{theme === 'dark' ? '☀' : '☾'}</span>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <NavLink to="/profile" className="sidebar-user" onClick={onClose}>
            <UserAvatar name={user?.name} />
            <div className="user-info">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-role">{user?.role || 'Member'}</div>
            </div>
          </NavLink>
          <button className="nav-link" onClick={handleLogout}
            style={{ width:'100%', textAlign:'left', color:'var(--danger)', cursor:'pointer' }}>
            <span className="nav-icon">↩</span>Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
