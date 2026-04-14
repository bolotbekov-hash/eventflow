import axios from 'axios'

const api = axios.create({ baseURL: 'https://jsonplaceholder.typicode.com', timeout: 10000 })
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('ef_token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

const LS_EV   = 'ef_events'
const LS_REG  = 'ef_registrations'
const LS_USR  = 'ef_users'

function getLsEvents()  { try { return JSON.parse(localStorage.getItem(LS_EV))  || null } catch { return null } }
function saveLsEvents(d){ localStorage.setItem(LS_EV,  JSON.stringify(d)) }
function getLsRegs()    { try { return JSON.parse(localStorage.getItem(LS_REG)) || []   } catch { return []   } }
function saveLsRegs(d)  { localStorage.setItem(LS_REG, JSON.stringify(d)) }
function getLsUsers()   { try { return JSON.parse(localStorage.getItem(LS_USR)) || []   } catch { return []   } }

async function seed() {
  const ex = getLsEvents()
  if (ex) return ex

  const [pr, ur] = await Promise.all([
    api.get('/posts?_limit=24'),
    api.get('/users?_limit=8'),
  ])

  const users = ur.data
  const cats  = ['conference','concert','workshop','meetup','webinar','festival','sports','exhibition']
  const stats = ['upcoming','upcoming','upcoming','ongoing','completed','cancelled']
  const cities= ['New York','London','Tokyo','Paris','Berlin','Sydney','Dubai','Toronto']
  const venues= ['Grand Convention Center','City Arena','Tech Hub','Rooftop Gardens',
                 'Online','Cultural Center','Sports Complex','Art Gallery']
  const now   = new Date()

  const events = pr.data.map((p, i) => {
    const cat    = cats[i % cats.length]
    const stat   = stats[i % stats.length]
    const offset = stat === 'completed' ? -(i+1)*3 : stat === 'ongoing' ? 0 : (i+1)*4
    const cap    = [50,100,150,200,300,500][i % 6]
    return {
      id:             p.id,
      title:          p.title.charAt(0).toUpperCase() + p.title.slice(1),
      description:    p.body,
      category:       cat,
      status:         stat,
      eventDate:      new Date(now.getTime() + offset*86400000).toISOString().split('T')[0],
      startTime:      ['09:00','10:00','14:00','16:00','18:00','19:00'][i % 6],
      endTime:        ['12:00','13:00','17:00','19:00','21:00','22:00'][i % 6],
      location:       `${venues[i % venues.length]}, ${cities[i % cities.length]}`,
      city:           cities[i % cities.length],
      organizer:      users[i % users.length].name,
      organizerEmail: users[i % users.length].email,
      organizerId:    users[i % users.length].id,
      capacity:       cap,
      registered:     Math.floor(Math.random() * cap),
      price:          [0,0,10,25,50,99,149,199][i % 8],
      isFeatured:     i < 3,
      tags:           [cat],
      createdAt:      new Date(now.getTime() - (30-i)*86400000).toISOString(),
      updatedAt:      new Date(now.getTime() - i*7200000).toISOString(),
    }
  })
  saveLsEvents(events)
  return events
}

/* ══ EVENTS ══ */
export const eventsService = {
  async getAll({ search='', category='', status='', sortBy='eventDate', sortOrder='asc', page=1, limit=9 } = {}) {
    let ev = await seed()
    if (search) {
      const q = search.toLowerCase()
      ev = ev.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q)
      )
    }
    if (category) ev = ev.filter(e => e.category === category)
    if (status)   ev = ev.filter(e => e.status   === status)
    ev = [...ev].sort((a,b) => {
      let av = a[sortBy], bv = b[sortBy]
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      return av < bv ? (sortOrder==='asc'?-1:1) : av > bv ? (sortOrder==='asc'?1:-1) : 0
    })
    const total      = ev.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    return { data: ev.slice((page-1)*limit, page*limit), total, totalPages, page }
  },

  async getFeatured() {
    return (await seed()).filter(e => e.isFeatured).slice(0, 3)
  },

  async getById(id) {
    const e = (await seed()).find(e => e.id === Number(id))
    if (!e) throw new Error('Event not found')
    return e
  },

  async create(payload, userId) {
    const ev  = await seed()
    const neo = {
      ...payload,
      id:          Date.now(),
      registered:  0,
      isFeatured:  false,
      organizerId: userId || null,
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    }
    saveLsEvents([neo, ...ev])
    return neo
  },

  async update(id, payload) {
    const ev  = await seed()
    const idx = ev.findIndex(e => e.id === Number(id))
    if (idx === -1) throw new Error('Event not found')
    const updated = { ...ev[idx], ...payload, updatedAt: new Date().toISOString() }
    ev[idx] = updated
    saveLsEvents(ev)
    return updated
  },

  async remove(id) {
    saveLsEvents((await seed()).filter(e => e.id !== Number(id)))
    return true
  },

  async getStats() {
    const ev = await seed()
    return {
      total:          ev.length,
      upcoming:       ev.filter(e => e.status==='upcoming').length,
      ongoing:        ev.filter(e => e.status==='ongoing').length,
      completed:      ev.filter(e => e.status==='completed').length,
      cancelled:      ev.filter(e => e.status==='cancelled').length,
      totalAttendees: ev.reduce((s,e) => s+(e.registered||0), 0),
      freeEvents:     ev.filter(e => e.price===0).length,
    }
  },
}

/* ══ REGISTRATIONS ══ */
export const registrationsService = {
  getAll()             { return getLsRegs() },
  getByEvent(eventId)  { return getLsRegs().filter(r => r.eventId === Number(eventId)) },
  getByUser(email)     { return getLsRegs().filter(r => r.userEmail === email) },
  isRegistered(eid, email) {
    return getLsRegs().some(r => r.eventId === Number(eid) && r.userEmail === email)
  },

  async register(eventId, user) {
    await delay(500)
    const regs = getLsRegs()
    if (regs.some(r => r.eventId===Number(eventId) && r.userEmail===user.email))
      throw new Error('Already registered')
    const ev = await seed()
    const e  = ev.find(e => e.id===Number(eventId))
    if (!e) throw new Error('Event not found')
    if (e.registered >= e.capacity) throw new Error('Event is fully booked')
    const reg = { id: Date.now(), eventId: Number(eventId), eventTitle: e.title,
                  userEmail: user.email, userName: user.name, registeredAt: new Date().toISOString() }
    saveLsRegs([...regs, reg])
    const idx = ev.findIndex(e => e.id===Number(eventId))
    ev[idx] = { ...ev[idx], registered: ev[idx].registered+1 }
    saveLsEvents(ev)
    return reg
  },

  async unregister(eventId, email) {
    await delay(400)
    saveLsRegs(getLsRegs().filter(r => !(r.eventId===Number(eventId) && r.userEmail===email)))
    const ev  = getLsEvents() || []
    const idx = ev.findIndex(e => e.id===Number(eventId))
    if (idx !== -1 && ev[idx].registered > 0) {
      ev[idx] = { ...ev[idx], registered: ev[idx].registered-1 }
      saveLsEvents(ev)
    }
    return true
  },
}

/* ══ AUTH ══ */
export const authService = {
  async register({ name, email, password, role='Attendee' }) {
    await delay(600)
    const users = getLsUsers()
    if (users.find(u => u.email===email)) throw new Error('Email already registered')
    const user = { id: Date.now(), name, email, role, createdAt: new Date().toISOString() }
    localStorage.setItem(LS_USR, JSON.stringify([...users, { ...user, password }]))
    return { user, token: btoa(`${email}:${Date.now()}`) }
  },

  async login({ email, password }) {
    await delay(600)
    const found = getLsUsers().find(u => u.email===email && u.password===password)
    if (!found) throw new Error('Invalid email or password')
    const { password: _, ...user } = found
    return { user, token: btoa(`${email}:${Date.now()}`) }
  },

  getAll() { return getLsUsers().map(({ password: _, ...u }) => u) },

  async updateRole(userId, newRole) {
    await delay(300)
    const users = getLsUsers()
    const idx   = users.findIndex(u => u.id === userId)
    if (idx === -1) throw new Error('User not found')
    users[idx] = { ...users[idx], role: newRole }
    localStorage.setItem(LS_USR, JSON.stringify(users))
    return users[idx]
  },

  async deleteUser(userId) {
    await delay(300)
    localStorage.setItem(LS_USR, JSON.stringify(getLsUsers().filter(u => u.id !== userId)))
    return true
  },
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }
export default api
