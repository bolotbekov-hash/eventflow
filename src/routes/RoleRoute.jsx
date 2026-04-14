import { Navigate } from 'react-router-dom'
import { useRole } from '../hooks/index.js'

/**
 * RoleRoute — wraps a page and redirects if the user lacks the required permission.
 * Usage: <RoleRoute action="create"><CreateEventPage /></RoleRoute>
 */
export default function RoleRoute({ children, action }) {
  const { can } = useRole()

  if (!can(action)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
