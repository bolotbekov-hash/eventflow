import { AuthProvider, ToastProvider, ThemeProvider } from './context/index.jsx'
import AppRouter from './routes/AppRouter.jsx'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
