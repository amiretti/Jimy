import { useState } from 'react'

export function LoginPage({ onSignIn }: { onSignIn: () => Promise<void> }) {
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setError(null)
    try {
      await onSignIn()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión.')
    }
  }

  return (
    <main className="login">
      <h1 className="login__title">Jimy</h1>
      <p className="login__tagline">Tu compañero de gym. Se acuerda de lo que levantaste.</p>
      <button type="button" className="btn btn--primary btn--block" onClick={handleClick}>
        Entrar con Google
      </button>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </main>
  )
}
