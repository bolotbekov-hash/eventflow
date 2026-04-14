export function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
export function formatDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
export function formatTime(t) {
  if (!t) return '—'
  const [h, m] = t.split(':')
  const hr = parseInt(h)
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
}
export function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7)  return `${days}d ago`
  return formatDate(d)
}
export function truncate(s, n = 80) {
  if (!s) return ''
  return s.length > n ? s.slice(0, n) + '…' : s
}

export const CATEGORY_CONFIG = {
  conference: { label: 'Conference', icon: '🎙', badge: 'badge-info' },
  concert:    { label: 'Concert',    icon: '🎵', badge: 'badge-accent' },
  workshop:   { label: 'Workshop',   icon: '🛠', badge: 'badge-warning' },
  meetup:     { label: 'Meetup',     icon: '🤝', badge: 'badge-success' },
  webinar:    { label: 'Webinar',    icon: '💻', badge: 'badge-neutral' },
  festival:   { label: 'Festival',   icon: '🎪', badge: 'badge-danger' },
  sports:     { label: 'Sports',     icon: '⚽', badge: 'badge-success' },
  exhibition: { label: 'Exhibition', icon: '🎨', badge: 'badge-accent' },
}

export const STATUS_CONFIG = {
  upcoming:  { label: 'Upcoming',  badge: 'badge-info',    color: '#2e90fa' },
  ongoing:   { label: 'Ongoing',   badge: 'badge-success', color: '#12b76a' },
  completed: { label: 'Completed', badge: 'badge-neutral', color: '#9890b8' },
  cancelled: { label: 'Cancelled', badge: 'badge-danger',  color: '#f04438' },
  postponed: { label: 'Postponed', badge: 'badge-warning', color: '#f79009' },
}

export const BANNER_COLORS = {
  conference: 'linear-gradient(135deg,#667eea,#764ba2)',
  concert:    'linear-gradient(135deg,#f093fb,#f5576c)',
  workshop:   'linear-gradient(135deg,#4facfe,#00f2fe)',
  meetup:     'linear-gradient(135deg,#43e97b,#38f9d7)',
  webinar:    'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  festival:   'linear-gradient(135deg,#f9d423,#f83600)',
  sports:     'linear-gradient(135deg,#0ba360,#3cba92)',
  exhibition: 'linear-gradient(135deg,#ff9a9e,#fecfef)',
}

export const ROLE_CONFIG = {
  Admin:           { color: '#f04438', bg: '#fef3f2', label: 'Admin',          icon: '👑' },
  Organizer:       { color: '#6c47ff', bg: '#ede9ff', label: 'Organizer',      icon: '🎪' },
  'Venue Manager': { color: '#f79009', bg: '#fffaeb', label: 'Venue Manager',  icon: '🏛' },
  Attendee:        { color: '#12b76a', bg: '#ecfdf5', label: 'Attendee',       icon: '🎟' },
  Sponsor:         { color: '#2e90fa', bg: '#eff8ff', label: 'Sponsor',        icon: '💼' },
  Press:           { color: '#9890b8', bg: '#f0eeff', label: 'Press',          icon: '📰' },
}

export function validateLogin({ email, password }) {
  const e = {}
  if (!email)                                      e.email    = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email'
  if (!password)                                   e.password = 'Password is required'
  else if (password.length < 6)                    e.password = 'Min. 6 characters'
  return e
}

export function validateRegister({ name, email, password, confirmPassword }) {
  const e = {}
  if (!name || name.trim().length < 2)             e.name            = 'At least 2 characters'
  if (!email)                                      e.email           = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email       = 'Enter a valid email'
  if (!password)                                   e.password        = 'Password is required'
  else if (password.length < 6)                    e.password        = 'Min. 6 characters'
  if (password !== confirmPassword)                e.confirmPassword = 'Passwords do not match'
  return e
}

export function validateEvent({ title, description, category, status, eventDate, startTime, location, capacity, price }) {
  const e = {}
  if (!title || title.trim().length < 3)           e.title       = 'At least 3 characters'
  if (!description || description.trim().length < 10) e.description = 'At least 10 characters'
  if (!category)                                   e.category    = 'Select a category'
  if (!status)                                     e.status      = 'Select a status'
  if (!eventDate)                                  e.eventDate   = 'Date is required'
  if (!startTime)                                  e.startTime   = 'Start time is required'
  if (!location || location.trim().length < 3)     e.location    = 'Location is required'
  if (!capacity || isNaN(capacity) || Number(capacity) < 1) e.capacity = 'At least 1 seat'
  if (price === '' || isNaN(price) || Number(price) < 0)    e.price    = 'Price must be ≥ 0'
  return e
}
