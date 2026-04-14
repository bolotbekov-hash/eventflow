import { createContext, useContext, useState, useEffect, useCallback } from 'react'

/* ══ AUTH ══ */
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const u = localStorage.getItem('ef_user')
      const t = localStorage.getItem('ef_token')
      if (u && t) setUser(JSON.parse(u))
    } catch {
      localStorage.removeItem('ef_user')
      localStorage.removeItem('ef_token')
    }
    setLoading(false)
  }, [])

  const login = useCallback((userData, token) => {
    setUser(userData)
    localStorage.setItem('ef_user', JSON.stringify(userData))
    localStorage.setItem('ef_token', token)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('ef_user')
    localStorage.removeItem('ef_token')
  }, [])

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const next = { ...prev, ...updates }
      localStorage.setItem('ef_user', JSON.stringify(next))
      return next
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}

/* ══ TOAST ══ */
const ToastContext = createContext(null)
let tid = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts(p => p.map(t => t.id === id ? { ...t, removing: true } : t))
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 300)
  }, [])

  const add = useCallback((type, title, message, duration = 4000) => {
    const id = ++tid
    setToasts(p => [...p, { id, type, title, message }])
    if (duration > 0) setTimeout(() => remove(id), duration)
  }, [remove])

  const toast = {
    success: (t, m) => add('success', t, m),
    error:   (t, m) => add('error',   t, m),
    warning: (t, m) => add('warning', t, m),
    info:    (t, m) => add('info',    t, m),
  }

  const ICONS = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}${t.removing ? ' removing' : ''}`}>
            <span className="toast-icon">{ICONS[t.type]}</span>
            <div className="toast-content">
              <div className="toast-title">{t.title}</div>
              {t.message && <div className="toast-message">{t.message}</div>}
            </div>
            <button className="toast-close" onClick={() => remove(t.id)}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}

/* ══ THEME ══ */
const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('ef_theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('ef_theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => setTheme(t => t === 'light' ? 'dark' : 'light'), [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider')
  return ctx
}
