import { useEffect } from 'react'

export function Spinner() {
  return (
    <div className="loading-overlay">
      <div className="spinner" />
      <span>Loading…</span>
    </div>
  )
}

export function EmptyState({ icon = '📅', title, description, action }) {
  return (
    <div className="empty-state fade-in">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      {description && <p className="empty-desc">{description}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="empty-state fade-in">
      <div className="empty-icon">⚠️</div>
      <div className="empty-title">Something went wrong</div>
      <p className="empty-desc">{message}</p>
      {onRetry && <button className="btn btn-secondary" onClick={onRetry}>Try Again</button>}
    </div>
  )
}

export function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return
    const fn = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = '' }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} style={{ fontSize:'1.3rem' }}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel='Delete', confirmClass='btn-danger' }) {
  return (
    <Modal open={open} onClose={onClose} title=""
      footer={<>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className={`btn ${confirmClass}`} onClick={onConfirm}>{confirmLabel}</button>
      </>}
    >
      <div className="confirm-icon">🗑️</div>
      <h3 style={{ textAlign:'center', marginBottom:8 }}>{title}</h3>
      <p style={{ textAlign:'center', color:'var(--text-secondary)', fontSize:'0.875rem' }}>{message}</p>
    </Modal>
  )
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (i===1 || i===totalPages || (i>=page-2 && i<=page+2)) pages.push(i)
    else if (pages[pages.length-1] !== '…') pages.push('…')
  }
  return (
    <div className="pagination">
      <button className="page-btn" onClick={() => onChange(page-1)} disabled={page===1}>‹</button>
      {pages.map((p,i) =>
        p === '…'
          ? <span key={`e${i}`} style={{ padding:'0 4px', color:'var(--text-muted)' }}>…</span>
          : <button key={p} className={`page-btn${page===p?' active':''}`} onClick={() => onChange(p)}>{p}</button>
      )}
      <button className="page-btn" onClick={() => onChange(page+1)} disabled={page===totalPages}>›</button>
    </div>
  )
}

export function ProgressBar({ value=0, color }) {
  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width:`${Math.min(100,Math.max(0,value))}%`, background:color||undefined }} />
    </div>
  )
}

export function SortTh({ children, field, sortBy, sortOrder, onSort }) {
  const active = sortBy === field
  return (
    <th className="sortable" onClick={() => onSort(field)}>
      {children}{' '}
      <span style={{ opacity:active?1:0.3, fontSize:'0.8em' }}>
        {active ? (sortOrder==='asc'?'↑':'↓') : '↕'}
      </span>
    </th>
  )
}

export function StatCard({ label, value, icon, color, change }) {
  return (
    <div className="stat-card">
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
        <div className="stat-label">{label}</div>
        {icon && (
          <span style={{ fontSize:'1.3rem', width:40, height:40, borderRadius:'var(--radius-md)',
            background: color?`${color}18`:'var(--accent-light)',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            {icon}
          </span>
        )}
      </div>
      <div className="stat-value" style={color?{color}:{}}>{value}</div>
      {change !== undefined && (
        <div className={`stat-change ${change>=0?'up':'down'}`}>
          {change>=0?'↑':'↓'} {Math.abs(change)}% this month
        </div>
      )}
    </div>
  )
}

export function UserAvatar({ name='', size=34, style:s={} }) {
  const initials = name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || '?'
  return (
    <div className="user-avatar" style={{ width:size, height:size, fontSize:size*0.34, ...s }}>
      {initials}
    </div>
  )
}

export function CapacityBar({ registered, capacity }) {
  const pct   = capacity > 0 ? Math.round((registered/capacity)*100) : 0
  const color = pct>=90?'var(--danger)':pct>=70?'var(--warning)':'var(--success)'
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:'0.78rem' }}>
        <span style={{ color:'var(--text-muted)' }}>{registered} / {capacity} seats</span>
        <span style={{ color, fontWeight:700 }}>{pct}%</span>
      </div>
      <ProgressBar value={pct} color={color} />
    </div>
  )
}

export function RoleBadge({ role }) {
  const colors = {
    Admin:           { bg:'#fef3f2', color:'#f04438' },
    Organizer:       { bg:'#ede9ff', color:'#6c47ff' },
    'Venue Manager': { bg:'#fffaeb', color:'#f79009' },
    Attendee:        { bg:'#ecfdf5', color:'#12b76a' },
    Sponsor:         { bg:'#eff8ff', color:'#2e90fa' },
    Press:           { bg:'#f0eeff', color:'#9890b8' },
  }
  const icons = { Admin:'👑', Organizer:'🎪', 'Venue Manager':'🏛', Attendee:'🎟', Sponsor:'💼', Press:'📰' }
  const c = colors[role] || colors['Attendee']
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4,
      background:c.bg, color:c.color,
      fontSize:'0.73rem', fontWeight:700,
      padding:'3px 10px', borderRadius:'var(--radius-full)',
      border:`1px solid ${c.color}30`,
    }}>
      {icons[role]} {role}
    </span>
  )
}
