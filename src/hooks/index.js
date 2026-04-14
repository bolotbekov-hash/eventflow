import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useAuth } from '../context/index.jsx'

/* ══════════════════════════════════════════
   useRole — role-based access control
   Admin ROLE ПРИСУТСТВУЕТ НИЖЕ
══════════════════════════════════════════ */
const PERMISSIONS = {
  Admin:           ['view', 'create', 'edit', 'delete', 'manage_users', 'view_stats'],
  Organizer:       ['view', 'create', 'edit', 'delete', 'view_stats'],
  'Venue Manager': ['view', 'edit',   'view_stats'],
  Attendee:        ['view', 'register'],
  Sponsor:         ['view'],
  Press:           ['view'],
}

export function useRole() {
  const { user } = useAuth()
  const role = user?.role || 'Attendee'

  const can = useCallback((action) => {
    return PERMISSIONS[role]?.includes(action) ?? false
  }, [role])

  return useMemo(() => ({
    role,
    can,
    isAdmin:        role === 'Admin',
    isOrganizer:    role === 'Organizer' || role === 'Admin',
    isVenueManager: role === 'Venue Manager',
    isAttendee:     role === 'Attendee',
    canCreate:      PERMISSIONS[role]?.includes('create')       ?? false,
    canEdit:        PERMISSIONS[role]?.includes('edit')         ?? false,
    canDelete:      PERMISSIONS[role]?.includes('delete')       ?? false,
    canRegister:    PERMISSIONS[role]?.includes('register')     ?? false,
    canViewStats:   PERMISSIONS[role]?.includes('view_stats')   ?? false,
    canManageUsers: PERMISSIONS[role]?.includes('manage_users') ?? false,
  }), [role, can])
}

/* ══ useDebounce ══ */
export function useDebounce(value, delay = 300) {
  const [deb, setDeb] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDeb(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return deb
}

/* ══ useLocalStorage ══ */
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try { 
      const s = localStorage.getItem(key)
      return s !== null ? JSON.parse(s) : initial 
    } catch { return initial }
  })
  const set = useCallback((v) => {
    setValue(v)
    try { localStorage.setItem(key, JSON.stringify(v)) } catch {}
  }, [key])
  return [value, set]
}

/* ══ useConfirm ══ */
export function useConfirm() {
  const [state, setState] = useState({ open: false, title: '', message: '', onConfirm: null })
  const confirm = useCallback(({ title, message, onConfirm }) =>
    setState({ open: true, title, message, onConfirm }), [])
  const close = useCallback(() => setState(s => ({ ...s, open: false })), [])
  const handleConfirm = useCallback(() => {
    if (state.onConfirm) state.onConfirm()
    close()
  }, [state.onConfirm, close])
  return { confirmState: state, confirm, closeConfirm: close, handleConfirm }
}

/* ══ useForm (ИСПРАВЛЕН: ФОКУС БОЛЬШЕ НЕ СЛЕТАЕТ) ══ */
export function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Синхронизация, если данные для формы прилетели позже (например, из API)
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setValues(initialValues)
    }
  }, [JSON.stringify(initialValues)])

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    
    // Обновляем только значения. Ошибки здесь не трогаем через зависимости,
    // чтобы не пересоздавать функцию при каждой букве.
    setValues(prev => ({ ...prev, [name]: val }))
    
    // Мягко убираем ошибку поля при начале ввода
    setErrors(prev => {
      if (prev[name]) {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      }
      return prev
    })
  }, []) // Зависимостей нет — функция стабильна, фокус не теряется

  const handleBlur = useCallback((e) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    if (validate) {
      const errs = validate(values)
      setErrors(prev => ({ ...prev, [name]: errs[name] || '' }))
    }
  }, [validate, values])

  const validateAll = useCallback(() => {
    if (!validate) return true
    const errs = validate(values)
    setErrors(errs)
    const allTouched = Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    setTouched(allTouched)
    return Object.values(errs).every(e => !e)
  }, [validate, values])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return { values, errors, touched, handleChange, handleBlur, validateAll, reset, setValues }
}

/* ══ useAsync ══ */
export function useAsync(asyncFn, deps = [], immediate = true) {
  const [state, setState] = useState({ data: null, loading: immediate, error: null })
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  const execute = useCallback(async (...args) => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const data = await asyncFn(...args)
      if (mounted.current) {
        setState({ data, loading: false, error: null })
      }
      return data
    } catch (err) {
      if (mounted.current) {
        setState(s => ({ ...s, loading: false, error: err.message || 'Ошибка' }))
      }
      throw err
    }
  }, deps) // eslint-disable-line

  useEffect(() => {
    if (immediate) execute()
  }, [execute, immediate])

  return { ...state, execute }
}