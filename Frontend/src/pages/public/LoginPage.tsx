import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brand } from '../../components/common/Brand'
import { Icon } from '../../components/common/Icon'
import { images } from '../../data/mockData'

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    window.setTimeout(() => navigate('/inicio'), 500)
  }

  return (
    <main className="grid min-h-screen bg-background md:grid-cols-2">
      <section className="relative hidden min-h-screen overflow-hidden md:block">
        <img
          alt="Productos frescos de comercios locales"
          className="absolute inset-0 h-full w-full object-cover"
          src={images.login}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/20 to-transparent" />
        <div className="absolute left-12 top-10">
          <Brand inverse />
        </div>
        <div className="absolute inset-x-12 bottom-14">
          <p className="max-w-lg font-display text-5xl font-semibold leading-tight text-white lg:text-7xl">
            Tus favoritos, más cerca de ti
          </p>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/70">
            Descubre comercios locales, pide en minutos y sigue tu entrega.
          </p>
        </div>
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-10 md:px-10">
        <div className="w-full max-w-md">
          <div className="mb-10 md:hidden">
            <Brand />
          </div>
          <p className="eyebrow">Bienvenido de nuevo</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-primary">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-muted">Entra para continuar a AppDelivery.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-primary">Correo electrónico</span>
              <div className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-muted" name="mail" />
                <input
                  autoComplete="email"
                  className="field pl-12"
                  defaultValue="carlos@example.com"
                  required
                  type="email"
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-primary">Contraseña</span>
              <div className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-muted" name="lock" />
                <input
                  autoComplete="current-password"
                  className="field px-12"
                  defaultValue="appdelivery"
                  minLength={6}
                  required
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-panel"
                  onClick={() => setShowPassword((value) => !value)}
                  type="button"
                >
                  <Icon className="text-[20px]" name={showPassword ? 'visibility_off' : 'visibility'} />
                </button>
              </div>
            </label>
            <div className="flex items-center justify-between gap-4 text-sm">
              <label className="inline-flex items-center gap-2 text-muted">
                <input className="size-4 rounded border-line text-accent focus:ring-accent" type="checkbox" />
                Recordarme
              </label>
              <Link className="font-semibold text-accent hover:underline" to="/login">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <button className="primary-button w-full" disabled={loading} type="submit">
              {loading ? (
                <>
                  <Icon className="animate-spin text-[20px]" name="progress_activity" />
                  Iniciando…
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>
          <p className="mt-7 text-center text-sm text-muted">
            ¿No tienes una cuenta?{' '}
            <Link className="font-bold text-accent hover:underline" to="/login?registro=true">
              Crear cuenta
            </Link>
          </p>
          <Link className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-primary" to="/">
            <Icon className="text-[18px]" name="arrow_back" />
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  )
}
