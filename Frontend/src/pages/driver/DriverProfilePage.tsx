import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/common/Icon'
import { RoleHeader } from '../../components/layout/RoleHeader'
import { SiteFooter } from '../../components/layout/SiteFooter'
import { useAuth } from '../../context/AuthContext'
import {
  getDriverProfile,
  updateDriver,
} from '../../services/driverApi'
import type {
  DriverProfile,
  SaveDriverProfileInput,
  VehicleType,
} from '../../types/driver'

function optionalText(value: FormDataEntryValue | null) {
  const normalized = String(value ?? '').trim()
  return normalized || null
}

export function DriverProfilePage() {
  const { accessToken } = useAuth()
  const [profile, setProfile] = useState<DriverProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!accessToken) return
    getDriverProfile(accessToken)
      .then(setProfile)
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : 'No fue posible cargar el perfil.',
        ),
      )
      .finally(() => setLoading(false))
  }, [accessToken])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!accessToken) return
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

    setSaving(true)
    setError('')
    try {
      setProfile(await updateDriver(input, accessToken))
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2200)
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible guardar los cambios.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-background text-muted">
        Cargando perfil de repartidor…
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-6 text-center">
        <div>
          <h1 className="font-display text-4xl text-primary">
            Perfil no disponible
          </h1>
          <p className="mt-3 text-sm text-muted">{error}</p>
          <Link
            className="primary-button mt-6"
            to="/registro-repartidor"
          >
            Completar registro
          </Link>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <RoleHeader
        driverStatus={profile.availabilityStatus}
        role="Repartidor"
      />
      <main className="page-shell py-10 md:py-14">
        <form className="mx-auto max-w-6xl" onSubmit={submit}>
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Perfil de repartidor</p>
              <h1 className="mt-2 font-display text-4xl font-semibold text-primary md:text-5xl">
                Mi perfil
              </h1>
              <p className="mt-2 text-sm text-muted">
                Gestiona tu vehículo y documentación.
              </p>
            </div>
            <button
              className="primary-button w-fit"
              disabled={saving}
              type="submit"
            >
              <Icon name="save" />
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>

          <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_330px]">
            <div className="space-y-7">
              <section className="card border-l-8 border-l-primary p-5 md:p-7">
                <h2 className="font-display text-2xl font-semibold text-primary">
                  Información personal
                </h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-sm font-bold text-primary">
                      Nombre
                    </span>
                    <input
                      className="field"
                      disabled
                      value={`${profile.firstName} ${profile.lastName}`}
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-bold text-primary">
                      Teléfono
                    </span>
                    <input
                      className="field"
                      disabled
                      value={profile.phoneNumber ?? 'Sin teléfono'}
                    />
                  </label>
                  <label className="sm:col-span-2">
                    <span className="mb-2 block text-sm font-bold text-primary">
                      Correo
                    </span>
                    <input
                      className="field"
                      disabled
                      value={profile.email}
                    />
                  </label>
                </div>
                <Link
                  className="mt-4 inline-flex text-sm font-bold text-accent hover:underline"
                  to="/perfil"
                >
                  Editar datos de la cuenta
                </Link>
              </section>

              <section className="card border-l-8 border-l-primary p-5 md:p-7">
                <h2 className="flex items-center gap-3 font-display text-2xl font-semibold text-primary">
                  <Icon name="two_wheeler" />
                  Vehículo
                </h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-sm font-bold text-primary">
                      Tipo
                    </span>
                    <select
                      className="field"
                      defaultValue={profile.vehicleType}
                      name="vehicleType"
                    >
                      <option value="Motorcycle">Motocicleta</option>
                      <option value="Bicycle">Bicicleta</option>
                      <option value="Car">Automóvil</option>
                    </select>
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-bold text-primary">
                      Placa
                    </span>
                    <input
                      className="field uppercase"
                      defaultValue={profile.vehiclePlate ?? ''}
                      name="vehiclePlate"
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-bold text-primary">
                      Marca
                    </span>
                    <input
                      className="field"
                      defaultValue={profile.vehicleBrand ?? ''}
                      name="vehicleBrand"
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-bold text-primary">
                      Modelo
                    </span>
                    <input
                      className="field"
                      defaultValue={profile.vehicleModel ?? ''}
                      name="vehicleModel"
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-bold text-primary">
                      Color
                    </span>
                    <input
                      className="field"
                      defaultValue={profile.vehicleColor ?? ''}
                      name="vehicleColor"
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-bold text-primary">
                      Número de licencia
                    </span>
                    <input
                      className="field"
                      defaultValue={profile.driverLicenseNumber ?? ''}
                      name="driverLicenseNumber"
                    />
                  </label>
                </div>
              </section>

              <section className="card p-5 md:p-7">
                <h2 className="font-display text-2xl font-semibold text-primary">
                  Archivos y fotografía
                </h2>
                <div className="mt-5 grid gap-5">
                  {[
                    [
                      'profilePhotoUrl',
                      'Fotografía del repartidor',
                      profile.profilePhotoUrl,
                    ],
                    [
                      'identificationDocumentUrl',
                      'Identificación oficial',
                      profile.identificationDocumentUrl,
                    ],
                    [
                      'driverLicenseDocumentUrl',
                      'Licencia de conducir',
                      profile.driverLicenseDocumentUrl,
                    ],
                  ].map(([name, label, value]) => (
                    <label key={name}>
                      <span className="mb-2 block text-sm font-bold text-primary">
                        {label}
                      </span>
                      <input
                        className="field"
                        defaultValue={value ?? ''}
                        name={String(name)}
                        placeholder="https://..."
                        type="url"
                      />
                    </label>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-7">
              <section className="rounded-2xl bg-primary-soft p-6 text-white shadow-lg">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">
                  Estado
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold">
                  {profile.approvalStatus === 'Approved'
                    ? 'Perfil aprobado'
                    : profile.approvalStatus}
                </h2>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/8 p-4 text-center">
                    <Icon className="text-warning" name="star" filled />
                    <strong className="mt-2 block font-display text-3xl">
                      {profile.ratingAverage.toFixed(1)}
                    </strong>
                    <span className="text-xs text-white/65">
                      Calificación
                    </span>
                  </div>
                  <div className="rounded-2xl bg-white/8 p-4 text-center">
                    <Icon className="text-[#a2dfc7]" name="reviews" />
                    <strong className="mt-2 block font-display text-3xl">
                      {profile.ratingCount}
                    </strong>
                    <span className="text-xs text-white/65">
                      Evaluaciones
                    </span>
                  </div>
                </div>
              </section>
              <section className="card p-6">
                <h2 className="font-display text-2xl font-semibold text-primary">
                  Ubicación
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {profile.locationUpdatedAt
                    ? `Última actualización: ${new Date(
                        profile.locationUpdatedAt,
                      ).toLocaleString('es-MX')}`
                    : 'Todavía no has compartido tu ubicación.'}
                </p>
                <Link
                  className="ghost-button mt-5 w-full"
                  to="/repartidor"
                >
                  <Icon name="my_location" />
                  Actualizar en el panel
                </Link>
              </section>
            </aside>
          </div>
          {error ? (
            <p className="mt-5 rounded-xl border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
              {error}
            </p>
          ) : null}
        </form>
      </main>
      <SiteFooter />
      {saved ? (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-xl">
          <Icon className="text-success" name="check_circle" />
          Perfil actualizado
        </div>
      ) : null}
    </div>
  )
}
