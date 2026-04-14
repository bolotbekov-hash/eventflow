import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import Topbar  from '../components/Topbar.jsx'

const TITLES = {
  '/':              'Home',
  '/dashboard':     'Dashboard',
  '/events':        'All Events',
  '/events/create': 'Create Event',
  '/my-events':     'My Registrations',
  '/profile':       'My Profile',
  '/admin':         'Admin Panel',
}

function getTitle(p) {
  if (TITLES[p])               return TITLES[p]
  if (p.match(/\/events\/\d+\/edit/)) return 'Edit Event'
  if (p.match(/\/events\/\d+/))       return 'Event Details'
  return 'EventFlow'
}

export default function AppLayout() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()

  useEffect(() => setOpen(false), [loc.pathname])
  useEffect(() => {
    const fn = () => { if (window.innerWidth > 768) setOpen(false) }
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  return (
    <div className="app-layout">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="main-content">
        <Topbar title={getTitle(loc.pathname)} onMenuClick={() => setOpen(true)} />
        <main className="page-container fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
