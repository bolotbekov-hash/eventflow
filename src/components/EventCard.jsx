import { Link } from 'react-router-dom'
import { CATEGORY_CONFIG, STATUS_CONFIG, BANNER_COLORS, formatDate, formatTime, truncate } from '../utils/index.js'
import { CapacityBar } from './ui.jsx'

export default function EventCard({ event }) {
  const cat    = CATEGORY_CONFIG[event.category] || { icon:'📅', label:event.category, badge:'badge-neutral' }
  const sta    = STATUS_CONFIG[event.status]     || { label:event.status, badge:'badge-neutral' }
  const banner = BANNER_COLORS[event.category]   || 'linear-gradient(135deg,#667eea,#764ba2)'

  return (
    <div className="event-card">
      <div className="event-card-banner" style={{ background:banner }}>
        <span style={{ position:'relative', zIndex:1, filter:'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}>
          {cat.icon}
        </span>
        {event.isFeatured && (
          <span style={{ position:'absolute', top:10, left:12, zIndex:2 }}
            className="badge badge-warning">⭐ Featured</span>
        )}
        <span style={{ position:'absolute', top:10, right:12, zIndex:2 }}
          className={`badge ${sta.badge}`}>{sta.label}</span>
      </div>

      <div className="event-card-body">
        <div className="event-card-title">{truncate(event.title, 65)}</div>
        <div className="event-card-meta">
          <div className="event-card-meta-row">
            <span>📅</span><span>{formatDate(event.eventDate)}</span>
            <span style={{ color:'var(--text-muted)' }}>·</span>
            <span>{formatTime(event.startTime)}</span>
          </div>
          <div className="event-card-meta-row">
            <span>📍</span><span>{truncate(event.location, 45)}</span>
          </div>
          <div className="event-card-meta-row">
            <span>👤</span><span>{event.organizer || 'Unknown'}</span>
          </div>
        </div>
        <CapacityBar registered={event.registered} capacity={event.capacity} />
      </div>

      <div className="event-card-footer">
        <div>
          <span className={`badge ${cat.badge}`}>{cat.icon} {cat.label}</span>
          <span style={{ marginLeft:6, fontSize:'0.8rem', fontWeight:700,
            color: event.price===0?'var(--success)':'var(--text-primary)' }}>
            {event.price===0 ? 'Free' : `$${event.price}`}
          </span>
        </div>
        <Link to={`/events/${event.id}`} className="btn btn-outline btn-sm">View →</Link>
      </div>
    </div>
  )
}
