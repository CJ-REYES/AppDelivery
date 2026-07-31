import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../../components/common/Icon'
import { Modal } from '../../components/common/Modal'
import { AccountAddressForm } from '../../components/forms/AccountAddressForm'
import { ClientHeader } from '../../components/layout/ClientHeader'
import { MobileNav } from '../../components/layout/MobileNav'
import { SiteFooter } from '../../components/layout/SiteFooter'
import { useAuth } from '../../context/AuthContext'
import { accountApi } from '../../services/accountApi'
import type {
  Address,
  SaveAddressInput,
  UserProfile,
} from '../../types/account'

type Section = 'profile' | 'addresses' | 'security'

const sections = [
  ['person', 'Datos personales', 'profile'],
  ['location_on', 'Direcciones', 'addresses'],
  ['security', 'Seguridad', 'security'],
] as const

export function ProfilePage() {
  const [section, setSection] = useState<Section>('profile')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [editingAddress, setEditingAddress] = useState<Address>()
  const [addressModal, setAddressModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [busyAddressId, setBusyAddressId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { accessToken, logout, syncUser, user } = useAuth()
  const navigate = useNavigate()

  function notify(nextMessage: string) {
    setMessage(nextMessage)
    window.setTimeout(() => setMessage(''), 2500)
  }

  async function loadAddresses(token: string) {
    const response = await accountApi.getAddresses(token)
    setAddresses(response)
  }

  useEffect(() => {
    if (!accessToken) return
    let active = true

    Promise.all([
      accountApi.getProfile(accessToken),
      accountApi.getAddresses(accessToken),
    ])
      .then(([nextProfile, nextAddresses]) => {
        if (!active) return
        setProfile(nextProfile)
        setAddresses(nextAddresses)
        syncUser(nextProfile)
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(
          reason instanceof Error
            ? reason.message
            : 'No fue posible cargar tu perfil.',
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [accessToken, syncUser])

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!accessToken) return
    const data = new FormData(event.currentTarget)
    setSubmitting(true)
    setError('')

    try {
      const response = await accountApi.updateProfile(
        {
          firstName: String(data.get('firstName') ?? '').trim(),
          lastName: String(data.get('lastName') ?? '').trim(),
          phoneNumber:
            String(data.get('phoneNumber') ?? '').trim() || null,
        },
        accessToken,
      )
      setProfile(response)
      syncUser(response)
      notify('Datos personales actualizados.')
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible actualizar tu perfil.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function openAddress(addressId?: string) {
    if (!accessToken) return
    setError('')

    if (!addressId) {
      setEditingAddress(undefined)
      setAddressModal(true)
      return
    }

    setBusyAddressId(addressId)
    try {
      const response = await accountApi.getAddress(
        addressId,
        accessToken,
      )
      setEditingAddress(response)
      setAddressModal(true)
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible consultar la dirección.',
      )
    } finally {
      setBusyAddressId('')
    }
  }

  async function saveAddress(input: SaveAddressInput) {
    if (!accessToken) return
    setError('')

    try {
      if (editingAddress) {
        await accountApi.updateAddress(
          editingAddress.id,
          input,
          accessToken,
        )
      } else {
        await accountApi.createAddress(input, accessToken)
      }

      await loadAddresses(accessToken)
      setAddressModal(false)
      setEditingAddress(undefined)
      notify(
        editingAddress
          ? 'Dirección actualizada.'
          : 'Dirección agregada.',
      )
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible guardar la dirección.',
      )
      throw reason
    }
  }

  async function setDefaultAddress(addressId: string) {
    if (!accessToken) return
    setBusyAddressId(addressId)
    setError('')

    try {
      await accountApi.setDefaultAddress(addressId, accessToken)
      await loadAddresses(accessToken)
      notify('Dirección principal actualizada.')
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible cambiar la dirección principal.',
      )
    } finally {
      setBusyAddressId('')
    }
  }

  async function deleteAddress(address: Address) {
    if (
      !accessToken ||
      !window.confirm(`¿Eliminar la dirección "${address.label}"?`)
    ) {
      return
    }

    setBusyAddressId(address.id)
    setError('')
    try {
      await accountApi.deleteAddress(address.id, accessToken)
      await loadAddresses(accessToken)
      notify('Dirección eliminada.')
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible eliminar la dirección.',
      )
    } finally {
      setBusyAddressId('')
    }
  }

  async function endSession() {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-20 md:pb-0">
      <ClientHeader cartCount={0} />
      <main className="page-shell grid gap-8 py-10 md:grid-cols-[250px_1fr] md:py-14">
        <aside className="card h-fit p-4 md:sticky md:top-28">
          <div className="flex items-center gap-3 border-b border-line pb-4">
            <span className="grid size-12 place-items-center rounded-full bg-primary font-bold text-white">
              {user?.firstName.charAt(0)}
              {user?.lastName.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-semibold text-primary">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted">
                {user?.roles.join(' · ')}
              </p>
            </div>
          </div>
          <nav className="mt-4 space-y-1">
            {sections.map(([icon, label, id]) => (
              <button
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold ${
                  section === id
                    ? 'bg-primary text-white'
                    : 'text-muted hover:bg-panel hover:text-primary'
                }`}
                key={id}
                onClick={() => setSection(id)}
                type="button"
              >
                <Icon className="text-[20px]" name={icon} />
                {label}
              </button>
            ))}
          </nav>
          <Link
            className="mt-4 flex w-full items-center gap-3 rounded-xl bg-accent/10 px-3 py-3 text-sm font-bold text-accent"
            to={
              user?.roles.includes('Merchant')
                ? '/mi-comercio'
                : '/registro-comercio'
            }
          >
            <Icon className="text-[20px]" name="storefront" />
            {user?.roles.includes('Merchant')
              ? 'Administrar comercio'
              : 'Registrar comercio'}
          </Link>
          <button
            className="mt-4 flex w-full items-center gap-3 border-t border-line px-3 pt-5 text-sm font-bold text-danger"
            onClick={endSession}
            type="button"
          >
            <Icon className="text-[20px]" name="logout" />
            Cerrar sesión
          </button>
        </aside>

        <div className="min-w-0">
          {error ? (
            <div
              className="mb-6 rounded-2xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="card grid min-h-80 place-items-center text-muted">
              <span className="inline-flex items-center gap-2">
                <Icon
                  className="animate-spin"
                  name="progress_activity"
                />
                Cargando perfil…
              </span>
            </div>
          ) : null}

          {!loading && section === 'profile' && profile ? (
            <section className="card p-5 md:p-7">
              <p className="eyebrow">Mi cuenta</p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-primary md:text-4xl">
                Datos personales
              </h1>
              <p className="mt-2 text-sm text-muted">
                Esta información se consulta y actualiza directamente en la
                API.
              </p>
              <form
                className="mt-7 grid gap-5 sm:grid-cols-2"
                key={profile.updatedAt}
                onSubmit={updateProfile}
              >
                <label>
                  <span className="mb-2 block text-sm font-bold text-primary">
                    Nombre
                  </span>
                  <input
                    className="field"
                    defaultValue={profile.firstName}
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
                    className="field"
                    defaultValue={profile.lastName}
                    minLength={2}
                    name="lastName"
                    required
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-primary">
                    Correo electrónico
                  </span>
                  <input
                    className="field bg-panel"
                    disabled
                    value={profile.email}
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-primary">
                    Teléfono
                  </span>
                  <input
                    className="field"
                    defaultValue={profile.phoneNumber ?? ''}
                    maxLength={20}
                    name="phoneNumber"
                    type="tel"
                  />
                </label>
                <div className="flex justify-end sm:col-span-2">
                  <button
                    className="primary-button"
                    disabled={submitting}
                    type="submit"
                  >
                    {submitting
                      ? 'Guardando…'
                      : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </section>
          ) : null}

          {!loading && section === 'addresses' ? (
            <section className="card p-5 md:p-7">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="eyebrow">Entregas</p>
                  <h1 className="mt-2 font-display text-3xl font-semibold text-primary md:text-4xl">
                    Mis direcciones
                  </h1>
                  <p className="mt-1 text-sm text-muted">
                    Agrega, edita o elige tu dirección principal.
                  </p>
                </div>
                <button
                  className="primary-button w-fit"
                  onClick={() => void openAddress()}
                  type="button"
                >
                  <Icon className="text-[18px]" name="add" />
                  Agregar dirección
                </button>
              </div>

              {addresses.length ? (
                <div className="mt-7 grid gap-4 lg:grid-cols-2">
                  {addresses.map((address) => (
                    <article
                      className={`rounded-2xl border p-5 ${
                        address.isDefault
                          ? 'border-accent bg-accent/5'
                          : 'border-line'
                      }`}
                      key={address.id}
                    >
                      <div className="flex items-start gap-3">
                        <span className="grid size-11 place-items-center rounded-xl bg-panel text-primary">
                          <Icon
                            name={
                              address.label === 'Trabajo'
                                ? 'work'
                                : 'home'
                            }
                          />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-bold text-primary">
                              {address.label}
                            </h2>
                            {address.isDefault ? (
                              <span className="status-pill bg-success/10 text-success">
                                Principal
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-sm leading-6 text-muted">
                            {address.street} {address.exteriorNumber}
                            {address.interiorNumber
                              ? ` Int. ${address.interiorNumber}`
                              : ''}
                            , {address.neighborhood}, {address.city},{' '}
                            {address.state}, C.P. {address.postalCode}
                          </p>
                          {address.references ? (
                            <p className="mt-1 text-xs text-muted">
                              {address.references}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-3 border-t border-line pt-4">
                        {!address.isDefault ? (
                          <button
                            className="text-xs font-bold text-success"
                            disabled={busyAddressId === address.id}
                            onClick={() =>
                              void setDefaultAddress(address.id)
                            }
                            type="button"
                          >
                            Hacer principal
                          </button>
                        ) : null}
                        <button
                          className="ml-auto text-xs font-bold text-primary"
                          disabled={busyAddressId === address.id}
                          onClick={() =>
                            void openAddress(address.id)
                          }
                          type="button"
                        >
                          Editar
                        </button>
                        <button
                          className="text-xs font-bold text-danger"
                          disabled={busyAddressId === address.id}
                          onClick={() => void deleteAddress(address)}
                          type="button"
                        >
                          Eliminar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-7 rounded-2xl border border-dashed border-line p-10 text-center">
                  <Icon
                    className="text-4xl text-muted"
                    name="location_off"
                  />
                  <h2 className="mt-3 font-display text-2xl font-semibold text-primary">
                    Aún no tienes direcciones
                  </h2>
                  <p className="mt-2 text-sm text-muted">
                    Agrega la primera para usarla en próximas entregas.
                  </p>
                </div>
              )}
            </section>
          ) : null}

          {!loading && section === 'security' ? (
            <section className="card p-5 md:p-7">
              <p className="eyebrow">Acceso</p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-primary md:text-4xl">
                Seguridad
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
                El cambio de contraseña utiliza el flujo seguro de
                recuperación y revoca las sesiones anteriores.
              </p>
              <Link
                className="primary-button mt-6"
                to={`/recuperar-contrasena?email=${encodeURIComponent(
                  profile?.email ?? '',
                )}`}
              >
                <Icon name="password" />
                Cambiar contraseña
              </Link>
            </section>
          ) : null}
        </div>
      </main>

      {addressModal ? (
        <Modal
          description="Los datos se guardarán en tu cuenta de AppDelivery."
          onClose={() => setAddressModal(false)}
          title={editingAddress ? 'Editar dirección' : 'Nueva dirección'}
        >
          <AccountAddressForm
            initial={editingAddress}
            onCancel={() => setAddressModal(false)}
            onSave={saveAddress}
          />
        </Modal>
      ) : null}

      {message ? (
        <div
          className="fixed bottom-24 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-xl md:bottom-6"
          role="status"
        >
          <Icon className="text-success" name="check_circle" />
          {message}
        </div>
      ) : null}

      <SiteFooter />
      <MobileNav />
    </div>
  )
}
