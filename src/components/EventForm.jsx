import { useMemo } from 'react'
import { useForm } from '../hooks/index.js'
import { validateEvent, CATEGORY_CONFIG, STATUS_CONFIG } from '../utils/index.js'


const F = ({ name, label, required, values, touched, errors, handleChange, handleBlur, ...rest }) => (
  <div className="form-group">
    <label className="form-label">
      {label}{required && <span className="required">*</span>}
    </label>
    <input
      className={`form-control${touched[name] && errors[name] ? ' error' : ''}`}
      name={name} 
      value={values[name] || ''} 
      onChange={handleChange} 
      onBlur={handleBlur}
      {...rest}
    />
    {touched[name] && errors[name] && <span className="form-error">⚠ {errors[name]}</span>}
  </div>
)

export default function EventForm({ initialValues, onSubmit, submitLabel = 'Save Event', loading = false }) {
  const tagsStr = useMemo(() => {
    if (Array.isArray(initialValues?.tags)) return initialValues.tags.join(', ')
    return initialValues?.tags || ''
  }, [initialValues?.tags])

  const initial = useMemo(() => ({
    title: '',
    description: '',
    category: 'conference',
    status: 'upcoming',
    eventDate: '',
    startTime: '10:00',
    endTime: '12:00',
    location: '',
    city: '',
    organizer: '',
    organizerEmail: '',
    capacity: 100,
    price: 0,
    ...initialValues,
    tags: tagsStr,
  }), [initialValues, tagsStr])

  const { values, errors, touched, handleChange, handleBlur, validateAll } = useForm(initial, validateEvent)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validateAll()) return
    await onSubmit({
      ...values,
      capacity: Number(values.capacity),
      price: Number(values.price),
      tags: values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    })
  }

  const fieldProps = { values, touched, errors, handleChange, handleBlur }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        
        <F {...fieldProps} name="title" label="Event Title" required placeholder="e.g. React Conference 2025" maxLength={120} />

        <div className="form-group">
          <label className="form-label">Description<span className="required">*</span></label>
          <textarea
            className={`form-control${touched.description && errors.description ? ' error' : ''}`}
            name="description" 
            value={values.description || ''}
            onChange={handleChange} 
            onBlur={handleBlur}
            placeholder="Describe your event…" 
            rows={4}
          />
          {touched.description && errors.description && <span className="form-error">⚠ {errors.description}</span>}
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Category<span className="required">*</span></label>
            <select className={`form-control${touched.category && errors.category ? ' error' : ''}`}
              name="category" value={values.category} onChange={handleChange} onBlur={handleBlur}>
              {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
            {touched.category && errors.category && <span className="form-error">⚠ {errors.category}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Status<span className="required">*</span></label>
            <select className={`form-control${touched.status && errors.status ? ' error' : ''}`}
              name="status" value={values.status} onChange={handleChange} onBlur={handleBlur}>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            {touched.status && errors.status && <span className="form-error">⚠ {errors.status}</span>}
          </div>
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">Event Date<span className="required">*</span></label>
            <input type="date"
              className={`form-control${touched.eventDate && errors.eventDate ? ' error' : ''}`}
              name="eventDate" value={values.eventDate} onChange={handleChange} onBlur={handleBlur} />
            {touched.eventDate && errors.eventDate && <span className="form-error">⚠ {errors.eventDate}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Start Time<span className="required">*</span></label>
            <input type="time"
              className={`form-control${touched.startTime && errors.startTime ? ' error' : ''}`}
              name="startTime" value={values.startTime} onChange={handleChange} onBlur={handleBlur} />
            {touched.startTime && errors.startTime && <span className="form-error">⚠ {errors.startTime}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">End Time</label>
            <input type="time" className="form-control"
              name="endTime" value={values.endTime} onChange={handleChange} />
          </div>
        </div>

        <div className="grid-2">
          <F {...fieldProps} name="location" label="Venue / Address" required placeholder="Grand Hall, 123 Main St" />
          <F {...fieldProps} name="city" label="City" placeholder="New York" />
        </div>

        <div className="grid-2">
          <F {...fieldProps} name="organizer" label="Organizer Name" placeholder="Your name or organization" />
          <F {...fieldProps} name="organizerEmail" label="Organizer Email" type="email" placeholder="contact@example.com" />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Capacity (seats)<span className="required">*</span></label>
            <input type="number" min={1}
              className={`form-control${touched.capacity && errors.capacity ? ' error' : ''}`}
              name="capacity" value={values.capacity} onChange={handleChange} onBlur={handleBlur} />
            {touched.capacity && errors.capacity && <span className="form-error">⚠ {errors.capacity}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Ticket Price ($)<span className="required">*</span></label>
            <input type="number" min={0}
              className={`form-control${touched.price && errors.price ? ' error' : ''}`}
              name="price" value={values.price} onChange={handleChange} onBlur={handleBlur} />
            {touched.price && errors.price && <span className="form-error">⚠ {errors.price}</span>}
            <span className="form-hint">Set 0 for a free event</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Tags</label>
          <input className="form-control" name="tags" value={values.tags} onChange={handleChange}
            placeholder="react, frontend, networking (comma separated)" />
          <span className="form-hint">Separate tags with commas</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? '⏳ Saving…' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  )
}