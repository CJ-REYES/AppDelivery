import { type FormEvent, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Brand } from '../../components/common/Brand'
import { Icon } from '../../components/common/Icon'
import { useAuth } from '../../context/AuthContext'
import { images } from '../../data/mockData'

export function LoginPage() {
  const [params] = useSearchParams()
  const registration = params.get('registro') === 'true'
  const requestedReturnTo = params.get('returnTo')
  const returnTo = requestedReturnTo?.startsWith('/')
    ? requestedReturnTo
    : null
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login, register } = useAuth()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(event.currentTarget)

    try {
      const user = registration
        ? await register({
            firstName: String(form.get('firstName') ?? ''),
            lastName: String(form.get('lastName') ?? ''),
            email: String(form.get('email') ?? ''),
            password: String(form.get('password') ?? ''),
            phoneNumber: String(form.get('phoneNumber') ?? '') || null,
          })
        : await login({
            email: String(form.get('email') ?? ''),
            password: String(form.get('password') ?? ''),
          })

      navigate(
        returnTo ??
          (user.roles.includes('Merchant') ? '/mi-comercio' : '/inicio'),
        { replace: true },
      )
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible iniciar la sesión.',
      )
    } finally {
      setLoading(false)
    }
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
            {registration
              ? 'Una cuenta para pedir y vender'
              : 'Tus favoritos, más cerca de ti'}
          </p>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/70">
            Descubre comercios locales, publica productos y administra tu
            actividad desde AppDelivery.
          </p>
        </div>
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-10 md:px-10">
        <div className="w-full max-w-md">
          <div className="mb-10 md:hidden">
            <Brand />
          </div>
          <p className="eyebrow">
            {registration ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-primary">
            {registration ? 'Comienza en AppDelivery' : 'Iniciar sesión'}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {registration
              ? 'Después podrás registrar tu comercio con la misma cuenta.'
              : 'Entra para continuar a AppDelivery.'}
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {registration ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-primary">
                    Nombre
                  </span>
                  <input
                    autoComplete="given-name"
                    className="field"
                    minLength={2}
                    name="firstName"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-primary">
                    Apellido
                  </span>
                  <input
                    autoComplete="family-name"
                    className="field"
                    minLength={2}
                    name="lastName"
                    required
                  />
                </label>
              </div>
            ) : null}
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-primary">
                Correo electrónico
              </span>
              <div className="relative">
                <Icon
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-muted"
                  name="mail"
                />
                <input
                  autoComplete="email"
                  className="field pl-12"
                  name="email"
                  required
                  type="email"
                />
              </div>
            </label>
            {registration ? (
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-primary">
                  Teléfono
                </span>
                <input
                  autoComplete="tel"
                  className="field"
                  maxLength={20}
                  name="phoneNumber"
                  type="tel"
                />
              </label>
            ) : null}
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-primary">
                Contraseña
              </span>
              <div className="relative">
                <Icon
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-muted"
                  name="lock"
                />
                <input
                  autoComplete={
                    registration ? 'new-password' : 'current-password'
                  }
                  className="field px-12"
                  minLength={registration ? 8 : 1}
                  name="password"
                  required
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  aria-label={
                    showPassword
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                  className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-panel"
                  onClick={() => setShowPassword((value) => !value)}
                  type="button"
                >
                  <Icon
                    className="text-[20px]"
                    name={showPassword ? 'visibility_off' : 'visibility'}
                  />
                </button>
              </div>
              {registration ? (
                <span className="mt-2 block text-xs leading-5 text-muted">
                  Usa mayúscula, minúscula, número y un carácter especial.
                </span>
              ) : null}
            </label>
            {!registration ? (
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted">
                  La sesión se conserva en esta pestaña.
                </span>
                <Link
                  className="font-semibold text-accent hover:underline"
                  to="/recuperar-contrasena"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            ) : null}
            {error ? (
              <div
                className="rounded-xl border border-danger/20 bg-danger/5 p-3 text-sm text-danger"
                role="alert"
              >
                {error}
              </div>
            ) : null}
            <button
              className="primary-button w-full"
              disabled={loading}
              type="submit"
            >
              {loading ? (
                <>
                  <Icon
                    className="animate-spin text-[20px]"
                    name="progress_activity"
                  />
                  Procesando…
                </>
              ) : registration ? (
                'Crear cuenta'
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>
          <p className="mt-7 text-center text-sm text-muted">
            {registration ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}{' '}
            <Link
              className="font-bold text-accent hover:underline"
              to={
                registration
                  ? `/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`
                  : `/login?registro=true${
                      returnTo
                        ? `&returnTo=${encodeURIComponent(returnTo)}`
                        : ''
                    }`
              }
            >
              {registration ? 'Iniciar sesión' : 'Crear cuenta'}
            </Link>
          </p>
          <Link
            className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-primary"
            to="/"
          >
            <Icon className="text-[18px]" name="arrow_back" />
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  )
}
