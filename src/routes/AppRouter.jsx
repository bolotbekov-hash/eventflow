import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/index.jsx'
import AppLayout       from '../layouts/AppLayout.jsx'
import ProtectedRoute  from './ProtectedRoute.jsx'
import RoleRoute       from './RoleRoute.jsx'
import HomePage        from '../pages/HomePage.jsx'
import LoginPage       from '../pages/LoginPage.jsx'
import RegisterPage    from '../pages/RegisterPage.jsx'
import DashboardPage   from '../pages/DashboardPage.jsx'
import EventsPage      from '../pages/EventsPage.jsx'
import EventDetailPage from '../pages/EventDetailPage.jsx'
import CreateEventPage from '../pages/CreateEventPage.jsx'
import EditEventPage   from '../pages/EditEventPage.jsx'
import MyEventsPage    from '../pages/MyEventsPage.jsx'
import ProfilePage     from '../pages/ProfilePage.jsx'
import AdminPage       from '../pages/AdminPage.jsx'
import NotFoundPage    from '../pages/NotFoundPage.jsx'

export default function AppRouter() {
  const { isAuthenticated } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

        {/* App shell */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />

          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          }/>

          <Route path="/events" element={
            <ProtectedRoute><EventsPage /></ProtectedRoute>
          }/>

          {/* Only Organizer / Admin can create */}
          <Route path="/events/create" element={
            <ProtectedRoute>
              <RoleRoute action="create">
                <CreateEventPage />
              </RoleRoute>
            </ProtectedRoute>
          }/>

          <Route path="/events/:id" element={
            <ProtectedRoute><EventDetailPage /></ProtectedRoute>
          }/>

          {/* Only Organizer / Admin / Venue Manager can edit */}
          <Route path="/events/:id/edit" element={
            <ProtectedRoute>
              <RoleRoute action="edit">
                <EditEventPage />
              </RoleRoute>
            </ProtectedRoute>
          }/>

          <Route path="/my-events" element={
            <ProtectedRoute><MyEventsPage /></ProtectedRoute>
          }/>

          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          }/>

          {/* Admin only */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <RoleRoute action="manage_users">
                <AdminPage />
              </RoleRoute>
            </ProtectedRoute>
          }/>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
