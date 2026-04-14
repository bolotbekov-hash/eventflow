import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/index.jsx'
import { useRole } from '../hooks/index.js'
import { eventsService } from '../services/api.js'
import { StatCard, Spinner, ErrorState } from '../components/ui.jsx'
import { STATUS_CONFIG, ROLE_CONFIG, formatDate, formatTime, truncate } from '../utils/index.js'
import EventCard from '../components/EventCard.jsx'

export default function DashboardPage() {
  const { user }   = useAuth()
  const { role, canCreate, canViewStats, canManageUsers } = useRole()
  const rc         = ROLE_CONFIG[role] || {}
  const [stats,    setStats]   = useState(null)
  const [featured, setFeatured]= useState([])
  const [recent,   setRecent]  = useState([])
  const [loading,  setLoading] = useState(true)
  const [error,    setError]   = useState(null)

  async function load() {
    setLoading(true); setError(null)
    try {
      const [s, f, r] = await Promise.all([
        eventsService.getStats(),
        eventsService.getFeatured(),
        eventsService.getAll({ sortBy: 'createdAt', sortOrder: 'desc', limit: 5 }),
      ])
      setStats(s); setFeatured(f); setRecent(r.data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  if (loading) return <Spinner />
  if (error)   return <ErrorState message={error} onRetry={load} />

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">
            Good {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="page-header-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            You are signed in as
            <span style={{
              background: rc.bg, color: rc.color,
              fontWeight: 700, fontSize: '0.78rem',
              padding: '2px 10px', borderRadius: 'var(--radius-full)',
              border: `1px solid ${rc.color}30`,
            }}>
              {rc.icon} {role}
            </span>
          </p>
        </div>
        <div className="page-header-actions">
          {canCreate && (
            <Link to="/events/create" className="btn btn-primary">✚ Create Event</Link>
          )}
          {canManageUsers && (
            <Link to="/admin" className="btn btn-secondary">👑 Admin Panel</Link>
          )}
        </div>
      </div>

      {/* Stats — only for roles with view_stats permission */}
      {canViewStats ? (
        <div className="stats-grid mb-6">
          <StatCard label="Total Events"    value={stats.total}                          icon="📅" color="var(--accent)" />
          <StatCard label="Upcoming"        value={stats.upcoming}                       icon="🔜" color="var(--info)"   change={3} />
          <StatCard label="Ongoing"         value={stats.ongoing}                        icon="🔴" color="var(--success)" />
          <StatCard label="Completed"       value={stats.completed}                      icon="✅" color="var(--text-muted)" />
          <StatCard label="Total Attendees" value={stats.totalAttendees.toLocaleString()} icon="👥" color="var(--accent)" change={8} />
          <StatCard label="Free Events"     value={stats.freeEvents}                     icon="🎁" color="var(--success)" />
        </div>
      ) : (
        /* Attendees/Sponsors just see a welcome card */
        <div className="card" style={{ padding: 24, marginBottom: 24, background: rc.bg, border: `1px solid ${rc.color}20` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: '2.5rem' }}>{rc.icon}</span>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: rc.color }}>
                {role} Dashboard
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                {{
                  Attendee: 'Browse events and manage your registrations.',
                  Sponsor:  'Explore events to find sponsorship opportunities.',
                  Press:    'Browse upcoming events for coverage.',
                }[role] || 'Welcome to EventFlow.'}
              </p>
            </div>
            <Link to="/events" className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>
              Browse Events →
            </Link>
          </div>
        </div>
      )}

      {/* Featured Events */}
      {featured.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
              ⭐ Featured Events
            </h2>
            <Link to="/events" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          <div className="grid-3">
            {featured.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        </div>
      )}

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Recent events */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
              Recent Events
            </h2>
            <Link to="/events" className="btn btn-ghost btn-sm">All →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recent.map(ev => {
              const sc = STATUS_CONFIG[ev.status] || {}
              return (
                <Link key={ev.id} to={`/events/${ev.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card card-hover" style={{ padding: 14 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 6 }}>
                      {truncate(ev.title, 55)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className={`badge ${sc.badge}`}>{sc.label}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        📅 {formatDate(ev.eventDate)} · {formatTime(ev.startTime)}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        📍 {ev.city || ev.location}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Quick actions — role-aware */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 16 }}>
            Quick Actions
          </h2>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/events" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                📅 Browse All Events
              </Link>
              <Link to="/my-events" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                ★ My Registrations
              </Link>
              {canCreate && (
                <Link to="/events/create" className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
                  ✚ Create New Event
                </Link>
              )}
              {canViewStats && (
                <Link to="/events?status=upcoming" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                  🔜 View Upcoming Events
                </Link>
              )}
              {canManageUsers && (
                <Link to="/admin" className="btn btn-secondary" style={{ justifyContent: 'flex-start', color: 'var(--danger)' }}>
                  👑 Manage Users & Roles
                </Link>
              )}
            </div>
          </div>

          {/* Status breakdown — only for roles with stats */}
          {canViewStats && (
            <div className="card" style={{ padding: 22, marginTop: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', marginBottom: 14 }}>
                Status Breakdown
              </h3>
              {Object.entries(STATUS_CONFIG).map(([key, conf]) => {
                const count = stats[key] ?? 0
                const pct   = stats.total ? Math.round((count / stats.total) * 100) : 0
                return (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{conf.label}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: conf.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
