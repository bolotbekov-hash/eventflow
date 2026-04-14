import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { eventsService, registrationsService } from '../services/api.js'
import { useAuth, useToast } from '../context/index.jsx'
import { useConfirm, useRole } from '../hooks/index.js'
import { Spinner, ErrorState, ConfirmDialog, CapacityBar } from '../components/ui.jsx'
import { CATEGORY_CONFIG, STATUS_CONFIG, BANNER_COLORS, formatDate, formatTime, formatDateTime } from '../utils/index.js'

export default function EventDetailPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const toast     = useToast()
  const { canEdit, canDelete, canRegister, role } = useRole()
  const { confirmState, confirm, closeConfirm, handleConfirm } = useConfirm()

  const [event,       setEvent]       = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [registering, setRegistering] = useState(false)
  const [isRegistered,setIsRegistered]= useState(false)

  async function load() {
    setLoading(true); setError(null)
    try {
      const data = await eventsService.getById(id)
      setEvent(data)
      if (user) setIsRegistered(registrationsService.isRegistered(id, user.email))
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  async function handleRegister() {
    setRegistering(true)
    try {
      await registrationsService.register(id, user)
      setIsRegistered(true)
      setEvent(p => ({ ...p, registered: p.registered + 1 }))
      toast.success('Registered!', `You're going to "${event.title}"`)
    } catch (e) { toast.error('Registration failed', e.message) }
    finally { setRegistering(false) }
  }

  async function handleUnregister() {
    setRegistering(true)
    try {
      await registrationsService.unregister(id, user.email)
      setIsRegistered(false)
      setEvent(p => ({ ...p, registered: Math.max(0, p.registered - 1) }))
      toast.info('Unregistered', `Removed from "${event.title}"`)
    } catch (e) { toast.error('Error', e.message) }
    finally { setRegistering(false) }
  }

  function handleDelete() {
    confirm({
      title: 'Delete Event',
      message: 'Are you sure? This cannot be undone.',
      onConfirm: async () => {
        try { await eventsService.remove(id); toast.success('Event deleted'); navigate('/events') }
        catch (e) { toast.error('Error', e.message) }
      },
    })
  }

  if (loading) return <Spinner />
  if (error)   return <ErrorState message={error} onRetry={load} />
  if (!event)  return null

  const cat    = CATEGORY_CONFIG[event.category] || { icon:'📅', label:event.category, badge:'badge-neutral' }
  const sta    = STATUS_CONFIG[event.status]     || { label:event.status, badge:'badge-neutral' }
  const banner = BANNER_COLORS[event.category]   || 'linear-gradient(135deg,#667eea,#764ba2)'
  const isFull = event.registered >= event.capacity
  const canRegisterNow = (canRegister || role === 'Organizer' || role === 'Admin' || role === 'Venue Manager')
    && (event.status === 'upcoming' || event.status === 'ongoing')

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <Link to="/events" style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>← Events</Link>
            <span style={{ color:'var(--border-strong)' }}>/</span>
            <span style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>#{event.id}</span>
          </div>
          <h1 className="page-header-title" style={{ fontSize:'1.35rem' }}>{event.title}</h1>
        </div>
        <div className="page-header-actions">
          {canEdit   && <Link to={`/events/${id}/edit`} className="btn btn-secondary">✏ Edit</Link>}
          {canDelete && <button className="btn btn-danger" onClick={handleDelete}>🗑 Delete</button>}
        </div>
      </div>

      <div className="detail-grid">
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {/* Banner */}
          <div style={{ height:180, background:banner, borderRadius:'var(--radius-xl)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'4rem', position:'relative' }}>
            <span style={{ filter:'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}>{cat.icon}</span>
            {event.isFeatured && (
              <span className="badge badge-warning" style={{ position:'absolute', top:14, left:16 }}>⭐ Featured</span>
            )}
            <span className={`badge ${sta.badge}`} style={{ position:'absolute', top:14, right:16 }}>
              {sta.label}
            </span>
          </div>

          {/* Tags */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <span className={`badge ${cat.badge}`}>{cat.icon} {cat.label}</span>
            {event.price === 0
              ? <span className="badge badge-success">🎁 Free Event</span>
              : <span className="badge badge-neutral">💰 ${event.price} per ticket</span>
            }
            {event.tags?.map(t => <span key={t} className="badge badge-neutral">#{t}</span>)}
          </div>

          {/* Description */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize:'0.95rem', fontWeight:700 }}>About this Event</h3>
            </div>
            <div className="card-body">
              <p style={{ color:'var(--text-secondary)', lineHeight:1.8, whiteSpace:'pre-wrap' }}>
                {event.description}
              </p>
            </div>
          </div>

          {/* Capacity */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize:'0.95rem', fontWeight:700 }}>Attendance</h3>
              <span style={{ fontSize:'0.875rem', color:'var(--text-muted)' }}>
                {event.registered} / {event.capacity} registered
              </span>
            </div>
            <div className="card-body">
              <CapacityBar registered={event.registered} capacity={event.capacity} />
              {isFull && (
                <p style={{ marginTop:10, fontSize:'0.85rem', color:'var(--danger)', fontWeight:600 }}>
                  ⚠ This event is fully booked.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Register CTA */}
          {canRegisterNow && (
            <div className="card" style={{ padding:20 }}>
              <div style={{ fontSize:'1.6rem', fontWeight:800, fontFamily:'var(--font-display)',
                color:event.price===0?'var(--success)':'var(--accent)', marginBottom:12 }}>
                {event.price === 0 ? 'Free' : `$${event.price}`}
              </div>
              {isRegistered ? (
                <>
                  <div style={{ marginBottom:12 }}>
                    <span className="badge badge-success">✓ You're registered</span>
                  </div>
                  <button className="btn btn-secondary" style={{ width:'100%', justifyContent:'center' }}
                    onClick={handleUnregister} disabled={registering}>
                    {registering ? '⏳ …' : 'Cancel Registration'}
                  </button>
                </>
              ) : (
                <button className="btn btn-primary btn-lg" style={{ width:'100%', justifyContent:'center' }}
                  onClick={handleRegister} disabled={registering || isFull}>
                  {registering ? '⏳ Registering…' : isFull ? '⛔ Fully Booked' : '🎟 Register Now'}
                </button>
              )}
            </div>
          )}

          {/* Sponsor/Press cannot register */}
          {(role === 'Sponsor' || role === 'Press') && (
            <div className="card" style={{ padding:16, textAlign:'center' }}>
              <p style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>
                {role === 'Sponsor' ? '💼 Contact organizer to sponsor this event.' : '📰 Press badge required for entry.'}
              </p>
            </div>
          )}

          {/* Meta */}
          <div className="detail-meta">
            <div className="detail-meta-header">Event Details</div>
            {[
              { label:'Date',      value: formatDate(event.eventDate) },
              { label:'Time',      value: `${formatTime(event.startTime)}${event.endTime?' — '+formatTime(event.endTime):''}` },
              { label:'Location',  value: event.location },
              { label:'City',      value: event.city || '—' },
              { label:'Organizer', value: event.organizer || '—' },
              { label:'Contact',   value: event.organizerEmail || '—' },
              { label:'Created',   value: formatDateTime(event.createdAt) },
            ].map(r => (
              <div key={r.label} className="meta-row">
                <span className="meta-label">{r.label}</span>
                <span className="meta-value">{r.value}</span>
              </div>
            ))}
          </div>

          {(canEdit || canDelete) && (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {canEdit   && <Link to={`/events/${id}/edit`} className="btn btn-outline" style={{ justifyContent:'center' }}>✏ Edit Event</Link>}
              {canDelete && <button className="btn btn-danger btn-sm" style={{ justifyContent:'center' }} onClick={handleDelete}>🗑 Delete Event</button>}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog open={confirmState.open} onClose={closeConfirm} onConfirm={handleConfirm}
        title={confirmState.title} message={confirmState.message} />
    </div>
  )
}
