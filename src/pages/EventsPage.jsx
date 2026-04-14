import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { eventsService } from '../services/api.js'
import { useToast } from '../context/index.jsx'
import { useDebounce, useConfirm, useRole } from '../hooks/index.js'
import { Spinner, ErrorState, EmptyState, Pagination, SortTh, ConfirmDialog } from '../components/ui.jsx'
import { CATEGORY_CONFIG, STATUS_CONFIG, formatDate, formatTime, truncate } from '../utils/index.js'
import EventCard from '../components/EventCard.jsx'

export default function EventsPage() {
  const toast = useToast()
  const { canCreate, canEdit, canDelete } = useRole()
  const { confirmState, confirm, closeConfirm, handleConfirm } = useConfirm()

  const [view,      setView]      = useState('grid')
  const [search,    setSearch]    = useState('')
  const [category,  setCategory]  = useState('')
  const [status,    setStatus]    = useState('')
  const [sortBy,    setSortBy]    = useState('eventDate')
  const [sortOrder, setSortOrder] = useState('asc')
  const [page,      setPage]      = useState(1)
  const [events,    setEvents]    = useState([])
  const [totalPages,setTotalPages]= useState(1)
  const [total,     setTotal]     = useState(0)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  const debouncedSearch = useDebounce(search, 350)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const r = await eventsService.getAll({
        search: debouncedSearch, category, status,
        sortBy, sortOrder, page, limit: view === 'grid' ? 9 : 10,
      })
      setEvents(r.data); setTotalPages(r.totalPages); setTotal(r.total)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [debouncedSearch, category, status, sortBy, sortOrder, page, view])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [debouncedSearch, category, status, sortBy, view])

  function handleSort(field) {
    if (sortBy === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortOrder('asc') }
  }

  function handleDelete(id, title) {
    confirm({
      title: 'Delete Event',
      message: `Delete "${truncate(title, 40)}"? This cannot be undone.`,
      onConfirm: async () => {
        try { await eventsService.remove(id); toast.success('Event deleted'); load() }
        catch (e) { toast.error('Error', e.message) }
      },
    })
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Events</h1>
          <p className="page-header-subtitle">{total} event{total !== 1 ? 's' : ''} found</p>
        </div>
        <div className="page-header-actions">
          <button className={`btn btn-sm ${view==='grid'?'btn-primary':'btn-secondary'}`} onClick={() => setView('grid')}>⊞ Grid</button>
          <button className={`btn btn-sm ${view==='table'?'btn-primary':'btn-secondary'}`} onClick={() => setView('table')}>☰ Table</button>
          {canCreate && <Link to="/events/create" className="btn btn-primary">✚ Create Event</Link>}
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: 20 }}>
        <div className="filters-row">
          <div className="search-bar">
            <span className="search-icon">⌕</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search events, locations, organizers…" />
          </div>
          <select className="form-control" style={{ width:'auto', minWidth:150 }}
            value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_CONFIG).map(([k,v]) => (
              <option key={k} value={k}>{v.icon} {v.label}</option>
            ))}
          </select>
          <select className="form-control" style={{ width:'auto', minWidth:140 }}
            value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([k,v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          {(search || category || status) && (
            <button className="btn btn-ghost btn-sm"
              onClick={() => { setSearch(''); setCategory(''); setStatus('') }}>
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={load} /> :
        events.length === 0 ? (
          <EmptyState icon="📭" title="No events found"
            description="Try adjusting your filters or create the first event."
            action={canCreate ? <Link to="/events/create" className="btn btn-primary">✚ Create Event</Link> : null} />
        ) : view === 'grid' ? (
          <>
            <div className="grid-auto">{events.map(e => <EventCard key={e.id} event={e} />)}</div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <SortTh field="title"     sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort}>Title</SortTh>
                    <SortTh field="category"  sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort}>Category</SortTh>
                    <SortTh field="status"    sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort}>Status</SortTh>
                    <SortTh field="eventDate" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort}>Date</SortTh>
                    <th>Location</th>
                    <SortTh field="price"     sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort}>Price</SortTh>
                    <th>Seats</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(ev => {
                    const cat = CATEGORY_CONFIG[ev.category] || { icon:'📅', badge:'badge-neutral', label:ev.category }
                    const sta = STATUS_CONFIG[ev.status]     || { badge:'badge-neutral', label:ev.status }
                    return (
                      <tr key={ev.id}>
                        <td><Link to={`/events/${ev.id}`} style={{ fontWeight:600, color:'var(--text-primary)' }}>{truncate(ev.title,45)}</Link></td>
                        <td><span className={`badge ${cat.badge}`}>{cat.icon} {cat.label}</span></td>
                        <td><span className={`badge ${sta.badge}`}>{sta.label}</span></td>
                        <td style={{ fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.5 }}>
                          {formatDate(ev.eventDate)}<br />{formatTime(ev.startTime)}
                        </td>
                        <td style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>{truncate(ev.city||ev.location,30)}</td>
                        <td style={{ fontWeight:600, color:ev.price===0?'var(--success)':'var(--text-primary)' }}>
                          {ev.price===0?'Free':`$${ev.price}`}
                        </td>
                        <td style={{ fontSize:'0.8rem' }}>{ev.registered}/{ev.capacity}</td>
                        <td>
                          <div style={{ display:'flex', gap:5 }}>
                            <Link to={`/events/${ev.id}`} className="btn btn-ghost btn-sm">👁</Link>
                            {canEdit   && <Link to={`/events/${ev.id}/edit`} className="btn btn-ghost btn-sm">✏</Link>}
                            {canDelete && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ev.id, ev.title)}>🗑</button>}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )
      }

      <ConfirmDialog open={confirmState.open} onClose={closeConfirm} onConfirm={handleConfirm}
        title={confirmState.title} message={confirmState.message} />
    </div>
  )
}
