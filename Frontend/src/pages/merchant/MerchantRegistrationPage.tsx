import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { StoreForm } from '../../components/forms/StoreForm'
import { Brand } from '../../components/common/Brand'
import { Icon } from '../../components/common/Icon'
import { useAuth } from '../../context/AuthContext'
import {
  catalogApi,
  merchantCatalogApi,
} from '../../services/catalogApi'
import type {
  SaveStoreInput,
  StoreCategory,
} from '../../types/catalog'

export function MerchantRegistrationPage() {
  const [categories, setCategories] = useState<StoreCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { accessToken, refreshSession, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.roles.includes('Merchant')) {
      navigate('/mi-comercio', { replace: true })
    }
  }, [navigate, user])

  useEffect(() => {
    catalogApi
      .getStoreCategories()
      .then(setCategories)
      .catch((reason: unknown) => {
        setError(
          reason instanceof Error
            ? reason.message
            : 'No fue posible cargar las categorías.',
        )
      })
      .finally(() => setLoading(false))
  }, [])

  async function createStore(input: SaveStoreInput) {
    if (!accessToken) return
    setSubmitting(true)
    setError('')

    try {
      await merchantCatalogApi.createStore(input, accessToken)
      await refreshSession()
      navigate('/mi-comercio', { replace: true })
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible registrar el comercio.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-line bg-white">
        <div className="page-shell flex h-20 items-center justify-between">
          <Brand />
          <Link className="ghost-button" to="/unete">
            <Icon className="text-[18px]" name="arrow_back" />
            Volver
          </Link>
        </div>
      </header>
      <main className="page-shell py-10 md:py-14">
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow">Perfil de comercio</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-primary md:text-6xl">
            Registra tu negocio
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Completa los datos públicos. Al guardar, tu cuenta conservará el
            perfil de cliente y también recibirá el rol de comercio.
          </p>

          {error ? (
            <div
              className="mt-6 rounded-2xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="card mt-8 grid min-h-72 place-items-center text-muted">
              <span className="inline-flex items-center gap-2">
                <Icon className="animate-spin" name="progress_activity" />
                Preparando formulario…
              </span>
            </div>
          ) : (
            <div className="mt-8">
              <StoreForm
                categories={categories}
                onSubmit={createStore}
                submitLabel="Registrar comercio"
                submitting={submitting}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
