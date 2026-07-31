import { type FormEvent, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Brand } from '../../components/common/Brand'
import { Icon } from '../../components/common/Icon'
import { authApi } from '../../services/authApi'

type Stage = 'request' | 'reset' | 'done'

export function PasswordRecoveryPage() {
  const [params] = useSearchParams()
  const [stage, setStage] = useState<Stage>('request')
  const [token, setToken] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setLoading(true)
    setError('')

    try {
      const response = await authApi.forgotPassword(
        String(data.get('email') ?? '').trim(),
      )
      setMessage(response.message)
      setToken(response.resetToken ?? '')
      setStage('reset')
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible solicitar la recuperación.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const newPassword = String(data.get('newPassword') ?? '')
    const confirmation = String(data.get('confirmation') ?? '')

    if (newPassword !== confirmation) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await authApi.resetPassword(
        String(data.get('token') ?? '').trim(),
        newPassword,
      )
      setStage('done')
      setMessage('Tu contraseña se actualizó correctamente.')
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible restablecer la contraseña.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background p-5">
      <section className="card w-full max-w-lg p-6 md:p-9">
        <Brand />

        <p className="eyebrow mt-10">Seguridad de la cuenta</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-primary">
          {stage === 'request'
            ? 'Recupera tu acceso'
            : stage === 'reset'
              ? 'Crea una contraseña nueva'
              : 'Contraseña actualizada'}
        </h1>

        {stage === 'request' ? (
          <>
            <p className="mt-3 text-sm leading-6 text-muted">
              Escribe el correo de tu cuenta. Por seguridad, la respuesta
              será la misma aunque el correo no exista.
            </p>
            <form className="mt-7 space-y-5" onSubmit={requestReset}>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-primary">
                  Correo electrónico
                </span>
                <input
                  autoComplete="email"
                  className="field"
                  defaultValue={params.get('email') ?? ''}
                  name="email"
                  required
                  type="email"
                />
              </label>
              <button
                className="primary-button w-full"
                disabled={loading}
                type="submit"
              >
                {loading ? 'Solicitando…' : 'Continuar'}
              </button>
            </form>
          </>
        ) : null}

        {stage === 'reset' ? (
          <>
            <p className="mt-3 text-sm leading-6 text-muted">{message}</p>
            {token ? (
              <div className="mt-5 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-xs leading-5 text-primary">
                El token aparece automáticamente porque estás ejecutando la
                API en desarrollo. En producción llegará mediante el
                proveedor de correo.
              </div>
            ) : null}
            <form className="mt-7 space-y-5" onSubmit={resetPassword}>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-primary">
                  Token de recuperación
                </span>
                <textarea
                  className="field min-h-24 resize-none"
                  defaultValue={token}
                  name="token"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-primary">
                  Nueva contraseña
                </span>
                <input
                  autoComplete="new-password"
                  className="field"
                  minLength={8}
                  name="newPassword"
                  required
                  type="password"
                />
                <span className="mt-2 block text-xs leading-5 text-muted">
                  Incluye mayúscula, minúscula, número y carácter especial.
                </span>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-primary">
                  Confirmar contraseña
                </span>
                <input
                  autoComplete="new-password"
                  className="field"
                  minLength={8}
                  name="confirmation"
                  required
                  type="password"
                />
              </label>
              <button
                className="primary-button w-full"
                disabled={loading}
                type="submit"
              >
                {loading ? 'Actualizando…' : 'Cambiar contraseña'}
              </button>
            </form>
          </>
        ) : null}

        {stage === 'done' ? (
          <div className="mt-7">
            <div className="flex items-start gap-3 rounded-2xl bg-success/10 p-4 text-sm text-success">
              <Icon name="check_circle" />
              <p>{message}</p>
            </div>
            <Link className="primary-button mt-6 w-full" to="/login">
              Iniciar sesión
            </Link>
          </div>
        ) : null}

        {error ? (
          <div
            className="mt-5 rounded-2xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {stage !== 'done' ? (
          <Link
            className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-primary"
            to="/login"
          >
            <Icon className="text-[18px]" name="arrow_back" />
            Volver al inicio de sesión
          </Link>
        ) : null}
      </section>
    </main>
  )
}
