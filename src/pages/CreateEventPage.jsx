import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { eventsService } from '../services/api.js'
import { useAuth, useToast } from '../context/index.jsx'
import EventForm from '../components/EventForm.jsx'

export default function CreateEventPage() {
  const navigate    = useNavigate()
  const toast       = useToast()
  const { user }    = useAuth()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(values) {
    setLoading(true)
    try {
      const ev = await eventsService.create(values, user?.id)
      toast.success('Event created!', `"${ev.title}" is now live.`)
      navigate(`/events/${ev.id}`)
    } catch (e) {
      toast.error('Failed to create event', e.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <div style={{ marginBottom:8 }}>
            <Link to="/events" style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>← Events</Link>
          </div>
          <h1 className="page-header-title">Create New Event</h1>
          <p className="page-header-subtitle">Fill in the details to publish your event.</p>
        </div>
      </div>
      <div style={{ maxWidth: 760 }}>
        <div className="card">
          <div className="card-body">
            <EventForm onSubmit={handleSubmit} submitLabel="✚ Publish Event" loading={loading} />
          </div>
        </div>
      </div>
    </div>
  )
}
