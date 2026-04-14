import { useState, useEffect } from 'react'
import { authService } from '../services/api.js'
import { useAuth, useToast } from '../context/index.jsx'
import { useConfirm } from '../hooks/index.js'
import { Spinner, ConfirmDialog, RoleBadge } from '../components/ui.jsx'
import { ROLE_CONFIG, formatDate } from '../utils/index.js'

const ALL_ROLES = ['Admin', 'Organizer', 'Venue Manager', 'Attendee', 'Sponsor', 'Press']

export default function AdminPage() {
  const { user: currentUser, updateUser } = useAuth()
  const toast    = useToast()
  const { confirmState, confirm, closeConfirm, handleConfirm } = useConfirm()
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // userId being edited

  function load() {
    setLoading(true)
    setUsers(authService.getAll())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleRoleChange(userId, newRole) {
    try {
      await authService.updateRole(userId, newRole)
      toast.success('Role updated', `User role changed to ${newRole}`)
      // If admin changed their own role, update context too
      if (userId === currentUser.id) updateUser({ role: newRole })
      setEditing(null)
      load()
    } catch (e) {
      toast.error('Failed', e.message)
    }
  }

  function handleDeleteUser(userId, userName) {
    if (userId === currentUser.id) {
      toast.warning('Cannot delete', 'You cannot delete your own account.')
      return
    }
    confirm({
      title: 'Delete User',
      message: `Delete "${userName}"? This cannot be undone.`,
      onConfirm: async () => {
        try {
          await authService.deleteUser(userId)
          toast.success('User deleted')
          load()
        } catch (e) { toast.error('Failed', e.message) }
      },
    })
  }

  if (loading) return <Spinner />

  const roleStats = ALL_ROLES.map(r => ({
    role: r,
    count: users.filter(u => u.role === r).length,
    ...ROLE_CONFIG[r],
  }))

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">👑 Admin Panel</h1>
          <p className="page-header-subtitle">Manage users and roles — {users.length} total users</p>
        </div>
      </div>

      {/* Role stats */}
      <div className="stats-grid mb-6">
        {roleStats.map(r => (
          <div key={r.role} className="stat-card" style={{ borderLeft: `3px solid ${r.color}` }}>
            <div className="stat-label">{r.icon} {r.label}</div>
            <div className="stat-value" style={{ color: r.color }}>{r.count}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>users</div>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="card">
        <div className="card-header" style={{ paddingBottom: 0 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>All Users</h3>
        </div>
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, marginTop: 12 }}>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: ROLE_CONFIG[u.role]?.bg || 'var(--accent-light)',
                        color: ROLE_CONFIG[u.role]?.color || 'var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                      }}>
                        {u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</div>
                        {u.id === currentUser.id && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>← You</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td>
                    {editing === u.id ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <select
                          className="form-control"
                          style={{ width: 'auto', fontSize: '0.82rem', padding: '5px 28px 5px 10px' }}
                          defaultValue={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                        >
                          {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>✕</button>
                      </div>
                    ) : (
                      <RoleBadge role={u.role} />
                    )}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {formatDate(u.createdAt)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm"
                        onClick={() => setEditing(editing === u.id ? null : u.id)}
                        title="Change role">
                        ✏
                      </button>
                      <button className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        disabled={u.id === currentUser.id}
                        title={u.id === currentUser.id ? "Can't delete yourself" : 'Delete user'}>
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog open={confirmState.open} onClose={closeConfirm} onConfirm={handleConfirm}
        title={confirmState.title} message={confirmState.message} />
    </div>
  )
}
