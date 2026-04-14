import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { eventsService, registrationsService } from '../services/api.js'
import { useAuth, useToast } from '../context/index.jsx'
import { Spinner, EmptyState } from '../components/ui.jsx'
import { CATEGORY_CONFIG, STATUS_CONFIG, formatDate, formatTime, formatDateTime } from '../utils/index.js'

export default function MyEventsPage() {
  const { user } = useAuth()
  const toast    = useToast()
  const [myEvents, setMyEvents] = useState([])
  const [loading,  setLoading]  = useState(true)

  async function load() {
    setLoading(true)
    try {
      const regs    = registrationsService.getByUser(user.email)
      const details = await Promise.all(
        regs.map(async r => {
          try { return { reg: r, event: await eventsService.getById(r.eventId) } }
          catch  { return null }
        })
      )
      setMyEvents(details.filter(Boolean))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleUnregister(eventId, eventTitle) {
    try {
      await registrationsService.unregister(eventId, user.email)
      toast.info('Unregistered', `Removed from "${eventTitle}"`)
      load()
    } catch (e) { toast.error('Error', e.message) }
  }

  if (loading) return <Spinner />

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">My Registrations</h1>
          <p className="page-header-subtitle">
            {myEvents.length} event{myEvents.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <div className="page-header-actions">
          <Link to="/events" className="btn btn-primary">Browse Events</Link>
        </div>
      </div>

      {myEvents.length === 0 ? (
        <EmptyState icon="🎟" title="No registrations yet"
          description="Browse events and register to see them here."
          action={<Link to="/events" className="btn btn-primary">Browse Events</Link>} />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {myEvents.map(({ reg, event }) => {
            const cat = CATEGORY_CONFIG[event.category] || { icon:'📅', badge:'badge-neutral', label:event.category }
            const sta = STATUS_CONFIG[event.status]     || { badge:'badge-neutral', label:event.status }
            return (
              <div key={reg.id} className="card" style={{ padding:20 }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:16, flexWrap:'wrap' }}>
                  <div style={{ fontSize:'1.8rem', width:52, height:52,
                    background:'var(--accent-light)', borderRadius:'var(--radius-md)',
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {cat.icon}
                  </div>
                  <div style={{ flex:1, minWidth:200 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:6 }}>
                      <Link to={`/events/${event.id}`}
                        style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem', color:'var(--text-primary)' }}>
                        {event.title}
                      </Link>
                      <span className={`badge ${sta.badge}`}>{sta.label}</span>
                      <span className={`badge ${cat.badge}`}>{cat.label}</span>
                    </div>
                    <div style={{ display:'flex', gap:16, flexWrap:'wrap', fontSize:'0.82rem', color:'var(--text-secondary)' }}>
                      <span>📅 {formatDate(event.eventDate)} · {formatTime(event.startTime)}</span>
                      <span>📍 {event.location}</span>
                      <span style={{ color:'var(--text-muted)' }}>
                        Registered {formatDateTime(reg.registeredAt)}
                      </span>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    <Link to={`/events/${event.id}`} className="btn btn-secondary btn-sm">View</Link>
                    <button className="btn btn-danger btn-sm"
                      onClick={() => handleUnregister(event.id, event.title)}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
