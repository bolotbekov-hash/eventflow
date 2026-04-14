import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/index.jsx'
import { useRole } from '../hooks/index.js'

export default function Topbar({ title, onMenuClick }) {
  const { toggleTheme, theme } = useTheme()
  const navigate = useNavigate()
  const { canCreate } = useRole()

  return (
    <header className="topbar">
      <button className="icon-btn mobile-menu-btn" onClick={onMenuClick}>☰</button>
      <span className="topbar-title">{title}</span>
      <div className="topbar-actions">
        <button className="icon-btn" onClick={toggleTheme}>
          {theme === 'dark' ? '☀' : '☾'}
        </button>
        {canCreate && (
          <button className="icon-btn" onClick={() => navigate('/events/create')} title="Create Event">
            ✚
          </button>
        )}
      </div>
    </header>
  )
}
