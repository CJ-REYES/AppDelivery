import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../../components/common/Icon'
import { ClientHeader } from '../../components/layout/ClientHeader'
import { SiteFooter } from '../../components/layout/SiteFooter'
import { useAuth } from '../../context/AuthContext'
import { registerDriver } from '../../services/driverApi'
import type {
  SaveDriverProfileInput,
  VehicleType,
} from '../../types/driver'

function optionalText(value: FormDataEntryValue | null) {
  const normalized = String(value ?? '').trim()
  return normalized || null
}

export function DriverRegistrationPage() {
  const {
    accessToken,
    isAuthenticated,
    register,
    refreshSession,
    user,
  } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [accepted, setAccepted] = useState(false)
  const navigate = useNavigate()

  async function createAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setLoading(true)
    setError('')

    try {
      await register({
        firstName: String(form.get('firstName') ?? '').trim(),
        lastName: String(form.get('lastName') ?? '').trim(),
        email: String(form.get('email') ?? '').trim(),
        phoneNumber: optionalText(form.get('phoneNumber')),
        password: String(form.get('password') ?? ''),
      })
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible crear la cuenta.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function createDriverProfile(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    if (!accessToken || !accepted) return
    const form = new FormData(event.currentTarget)
    const input: SaveDriverProfileInput = {
      vehicleType: String(form.get('vehicleType')) as VehicleType,
      vehicleBrand: optionalText(form.get('vehicleBrand')),
      vehicleModel: optionalText(form.get('vehicleModel')),
      vehicleColor: optionalText(form.get('vehicleColor')),
      vehiclePlate: optionalText(form.get('vehiclePlate')),
      driverLicenseNumber: optionalText(
        form.get('driverLicenseNumber'),
      ),
      profilePhotoUrl: optionalText(form.get('profilePhotoUrl')),
      identificationDocumentUrl: optionalText(
        form.get('identificationDocumentUrl'),
      ),
      driverLicenseDocumentUrl: optionalText(
        form.get('driverLicenseDocumentUrl'),
      ),
    }

    setLoading(true)
    setError('')

    try {
      await registerDriver(input, accessToken)
      await refreshSession()
      navigate('/repartidor', { replace: true })
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible activar el perfil de repartidor.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <ClientHeader cartCount={0} />
      <main className="page-shell py-10 md:py-14">
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow">Cuenta de repartidor</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-primary md:text-5xl">
            Empieza a repartir con AppDelivery
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Primero crea tu cuenta y después registra el vehículo. Si ya
            tienes cuenta de cliente, usarás el mismo acceso.
          </p>

          {!isAuthenticated ? (
            <form
              className="card mt-8 p-5 md:p-8"
              onSubmit={createAccount}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-panel text-primary">
                  <Icon name="person_add" />
                </span>
                <div>
                  <p className="eyebrow">Paso 1 de 2</p>
                  <h2 className="font-display text-2xl font-semibold text-primary">
                    Crear cuenta
                  </h2>
                </div>
              </div>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm font-bold text-primary">
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
                <label>
                  <span className="mb-2 block text-sm font-bold text-primary">
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
                <label>
                  <span className="mb-2 block text-sm font-bold text-primary">
                    Correo electrónico
                  </span>
                  <input
                    autoComplete="email"
                    className="field"
                    name="email"
                    required
                    type="email"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-bold text-primary">
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
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-primary">
                    Contraseña
                  </span>
                  <input
                    autoComplete="new-password"
                    className="field"
                    minLength={8}
                    name="password"
                    required
                    type="password"
                  />
                  <span className="mt-2 block text-xs text-muted">
                    Incluye mayúscula, minúscula, número y carácter
                    especial.
                  </span>
                </label>
              </div>
              {error ? (
                <p className="mt-5 rounded-xl border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
                  {error}
                </p>
              ) : null}
              <div className="mt-7 flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
                <Link
                  className="text-sm font-semibold text-primary hover:underline"
                  to="/login?returnTo=%2Fregistro-repartidor"
                >
                  Ya tengo una cuenta
                </Link>
                <button
                  className="primary-button"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? 'Creando…' : 'Crear y continuar'}
                  <Icon name="arrow_forward" />
                </button>
              </div>
            </form>
          ) : (
            <form
              className="card mt-8 p-5 md:p-8"
              onSubmit={createDriverProfile}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-accent/10 text-accent">
                  <Icon name="two_wheeler" />
                </span>
                <div>
                  <p className="eyebrow">Paso 2 de 2</p>
                  <h2 className="font-display text-2xl font-semibold text-primary">
                    Vehículo y documentación
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    Cuenta: {user?.firstName} {user?.lastName} ·{' '}
                    {user?.email}
                  </p>
                </div>
              </div>
              <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <label>
                  <span className="mb-2 block text-sm font-bold text-primary">
                    Tipo de vehículo
                  </span>
                  <select
                    className="field"
                    defaultValue="Motorcycle"
                    name="vehicleType"
                  >
                    <option value="Motorcycle">Motocicleta</option>
                    <option value="Bicycle">Bicicleta</option>
                    <option value="Car">Automóvil</option>
                  </select>
                </label>
                <label>
                  <span className="mb-2 block text-sm font-bold text-primary">
                    Marca
                  </span>
                  <input className="field" name="vehicleBrand" />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-bold text-primary">
                    Modelo
                  </span>
                  <input className="field" name="vehicleModel" />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-bold text-primary">
                    Color
                  </span>
                  <input className="field" name="vehicleColor" />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-bold text-primary">
                    Placa
                  </span>
                  <input
                    className="field uppercase"
                    name="vehiclePlate"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-bold text-primary">
                    Número de licencia
                  </span>
                  <input className="field" name="driverLicenseNumber" />
                </label>
                <label className="sm:col-span-2 lg:col-span-3">
                  <span className="mb-2 block text-sm font-bold text-primary">
                    URL de foto de perfil
                  </span>
                  <input
                    className="field"
                    name="profilePhotoUrl"
                    placeholder="https://..."
                    type="url"
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-primary">
                    URL de identificación oficial
                  </span>
                  <input
                    className="field"
                    name="identificationDocumentUrl"
                    placeholder="https://..."
                    type="url"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-bold text-primary">
                    URL de licencia
                  </span>
                  <input
                    className="field"
                    name="driverLicenseDocumentUrl"
                    placeholder="https://..."
                    type="url"
                  />
                </label>
              </div>
              <label className="mt-7 flex items-start gap-3 rounded-2xl bg-panel p-4 text-sm leading-6 text-muted">
                <input
                  checked={accepted}
                  className="mt-1 size-4 rounded text-accent"
                  onChange={(event) =>
                    setAccepted(event.target.checked)}
                  type="checkbox"
                />
                Confirmo que los datos son correctos y autorizo el uso de
                mi ubicación durante las entregas.
              </label>
              {error ? (
                <p className="mt-5 rounded-xl border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
                  {error}
                </p>
              ) : null}
              <div className="mt-7 flex justify-end">
                <button
                  className="primary-button"
                  disabled={loading || !accepted}
                  type="submit"
                >
                  <Icon name="verified" />
                  {loading ? 'Activando…' : 'Activar perfil'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
