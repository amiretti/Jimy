import { lazy, Suspense } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { useAuth } from './hooks/use-auth'
import { LoginPage } from './pages/LoginPage'
import { TodayPage } from './pages/TodayPage'

// Los gráficos (Recharts) se cargan solo en las pantallas que los usan.
const ExercisePage = lazy(() => import('./pages/ExercisePage').then((m) => ({ default: m.ExercisePage })))
const BodyWeightPage = lazy(() => import('./pages/BodyWeightPage').then((m) => ({ default: m.BodyWeightPage })))

export function App() {
  const { user, loading, signIn, signOut } = useAuth()

  if (loading) return <p className="status">Cargando…</p>
  if (!user) return <LoginPage onSignIn={signIn} />

  return (
    <>
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <div id="contenido">
        <Suspense fallback={<p className="status">Cargando…</p>}>
          <Routes>
            <Route path="/" element={<TodayPage />} />
            <Route path="/ejercicio/:exerciseId" element={<ExercisePage />} />
            <Route path="/peso" element={<BodyWeightPage />} />
          </Routes>
        </Suspense>
      </div>
      <nav className="bottom-nav" aria-label="Principal">
        <NavLink to="/" end>
          Hoy
        </NavLink>
        <NavLink to="/peso">Peso</NavLink>
        <button type="button" className="btn btn--ghost" onClick={() => void signOut()}>
          Salir
        </button>
      </nav>
    </>
  )
}
