import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StoreForm } from '../../components/forms/StoreForm'
import { Icon } from '../../components/common/Icon'
import { MerchantHeader } from '../../components/layout/MerchantHeader'
import { useAuth } from '../../context/AuthContext'
import {
  catalogApi,
  merchantCatalogApi,
} from '../../services/catalogApi'
import type {
  SaveStoreInput,
  StoreCategory,
  StoreDetail,
} from '../../types/catalog'

export function MerchantProfilePage() {
  const [store, setStore] = useState<StoreDetail | null>(null)
  const [categories, setCategories] = useState<StoreCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { accessToken } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!accessToken) return
    let active = true

    Promise.all([
      merchantCatalogApi.getStore(accessToken),
      catalogApi.getStoreCategories(),
    ])
      .then(([nextStore, nextCategories]) => {
        if (!active) return
        setStore(nextStore)
        setCategories(nextCategories)
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(
          reason instanceof Error
            ? reason.message
            : 'No fue posible cargar el perfil.',
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [accessToken])

  async function updateStore(input: SaveStoreInput) {
    if (!accessToken) return
    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      const response = await merchantCatalogApi.updateStore(
        input,
        accessToken,
      )
      setStore(response)
      setMessage('La información del comercio se actualizó correctamente.')
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible actualizar el comercio.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function deactivateStore() {
    if (
      !accessToken ||
      !window.confirm(
        '¿Desactivar la publicación del comercio? Dejará de aparecer para los clientes.',
      )
    ) {
      return
    }

    setSubmitting(true)
    setError('')
    setMessage('')
    try {
      await merchantCatalogApi.deactivateStore(accessToken)
      navigate('/inicio', { replace: true })
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible desactivar el comercio.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="dashboard-grid min-h-screen bg-background">
      <MerchantHeader />
      <main className="page-shell py-10 md:py-14">
        <p className="eyebrow">Configuración</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-primary md:text-6xl">
          Perfil del comercio
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Mantén actualizados los datos que los clientes consultan antes de
          elegir tu negocio.
        </p>

        {error ? (
          <div
            className="mt-6 rounded-2xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger"
            role="alert"
          >
            {error}
          </div>
        ) : null}
        {message ? (
          <div
            className="mt-6 rounded-2xl border border-success/20 bg-success/5 p-4 text-sm text-success"
            role="status"
          >
            {message}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-8 grid min-h-80 place-items-center text-muted">
            <span className="inline-flex items-center gap-2">
              <Icon className="animate-spin" name="progress_activity" />
              Cargando perfil…
            </span>
          </div>
        ) : store ? (
          <div className="mt-8 space-y-6">
            <StoreForm
              categories={categories}
              initial={store}
              onSubmit={updateStore}
              submitLabel="Guardar cambios"
              submitting={submitting}
            />
            {store.isActive ? (
              <section className="card border-danger/20 p-6">
                <h2 className="font-display text-2xl font-semibold text-primary">
                  Desactivar publicación
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                  El comercio dejará de aparecer en el catálogo público y
                  quedará cerrado. Esta acción no elimina sus productos.
                </p>
                <button
                  className="ghost-button mt-5 !border-danger/30 !text-danger"
                  disabled={submitting}
                  onClick={() => void deactivateStore()}
                  type="button"
                >
                  <Icon name="store_off" />
                  Desactivar comercio
                </button>
              </section>
            ) : null}
          </div>
        ) : null}
      </main>
    </div>
  )
}
