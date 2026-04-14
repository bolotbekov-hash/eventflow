import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { eventsService } from '../services/api.js'
import { useToast } from '../context/index.jsx'
import { Spinner, ErrorState } from '../components/ui.jsx'
import EventForm from '../components/EventForm.jsx'

export default function EditEventPage() {
  const { id }  = useParams()
  const navigate = useNavigate()
  const toast    = useToast()
  const [event,     setEvent]     = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [submitting,setSubmitting]= useState(false)
  const [error,     setError]     = useState(null)

  async function load() {
    setLoading(true); setError(null)
    try { setEvent(await eventsService.getById(id)) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  async function handleSubmit(values) {
    setSubmitting(true)
    try {
      await eventsService.update(id, values)
      toast.success('Event updated!', 'Your changes have been saved.')
      navigate(`/events/${id}`)
    } catch (e) {
      toast.error('Update failed', e.message)
    } finally { setSubmitting(false) }
  }

  if (loading) return <Spinner />
  if (error)   return <ErrorState message={error} onRetry={load} />

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <Link to="/events" style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>← Events</Link>
            <span style={{ color:'var(--border-strong)' }}>/</span>
            <Link to={`/events/${id}`} style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>#{id}</Link>
          </div>
          <h1 className="page-header-title">Edit Event</h1>
        </div>
        <div className="page-header-actions">
          <Link to={`/events/${id}`} className="btn btn-secondary">Cancel</Link>
        </div>
      </div>
      <div style={{ maxWidth: 760 }}>
        <div className="card">
          <div className="card-body">
            {event && (
              <EventForm initialValues={event} onSubmit={handleSubmit}
                submitLabel="✓ Save Changes" loading={submitting} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
