import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/index.jsx'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="spinner" />
    </div>
  )

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}
