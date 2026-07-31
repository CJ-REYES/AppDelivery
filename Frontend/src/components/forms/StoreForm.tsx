import { type FormEvent } from 'react'
import type {
  SaveStoreInput,
  StoreCategory,
  StoreDetail,
} from '../../types/catalog'
import { Icon } from '../common/Icon'

type StoreFormProps = {
  categories: StoreCategory[]
  initial?: StoreDetail
  submitting: boolean
  submitLabel: string
  onSubmit: (input: SaveStoreInput) => Promise<void>
}

function optionalValue(value: FormDataEntryValue | null) {
  const normalized = String(value ?? '').trim()
  return normalized || null
}

export function StoreForm({
  categories,
  initial,
  submitting,
  submitLabel,
  onSubmit,
}: StoreFormProps) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const latitude = optionalValue(form.get('latitude'))
    const longitude = optionalValue(form.get('longitude'))

    await onSubmit({
      storeCategoryId: Number(form.get('storeCategoryId')),
      name: String(form.get('name') ?? '').trim(),
      description: String(form.get('description') ?? '').trim(),
      phoneNumber: String(form.get('phoneNumber') ?? '').trim(),
      email: optionalValue(form.get('email')),
      logoUrl: optionalValue(form.get('logoUrl')),
      coverImageUrl: optionalValue(form.get('coverImageUrl')),
      street: String(form.get('street') ?? '').trim(),
      exteriorNumber: String(form.get('exteriorNumber') ?? '').trim(),
      interiorNumber: optionalValue(form.get('interiorNumber')),
      neighborhood: String(form.get('neighborhood') ?? '').trim(),
      city: String(form.get('city') ?? '').trim(),
      state: String(form.get('state') ?? '').trim(),
      postalCode: String(form.get('postalCode') ?? '').trim(),
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      deliveryFee: Number(form.get('deliveryFee')),
      minimumOrderAmount: Number(form.get('minimumOrderAmount')),
      estimatedDeliveryMinutesMin: Number(
        form.get('estimatedDeliveryMinutesMin'),
      ),
      estimatedDeliveryMinutesMax: Number(
        form.get('estimatedDeliveryMinutesMax'),
      ),
      isOpen: form.get('isOpen') === 'on',
    })
  }

  return (
    <form className="space-y-8" onSubmit={submit}>
      <section className="card p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-panel text-primary">
            <Icon name="storefront" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-semibold text-primary">
              Datos del comercio
            </h2>
            <p className="text-sm text-muted">
              Esta información aparecerá en el catálogo público.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-primary">
              Nombre
            </span>
            <input
              className="field"
              defaultValue={initial?.name}
              maxLength={150}
              minLength={2}
              name="name"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-primary">
              Categoría
            </span>
            <select
              className="field"
              defaultValue={
                initial?.storeCategoryId ?? categories[0]?.id ?? ''
              }
              name="storeCategoryId"
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-primary">
              Teléfono
            </span>
            <input
              className="field"
              defaultValue={initial?.phoneNumber}
              maxLength={20}
              name="phoneNumber"
              required
              type="tel"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-primary">
              Descripción
            </span>
            <textarea
              className="field min-h-28 resize-y"
              defaultValue={initial?.description}
              maxLength={1000}
              minLength={10}
              name="description"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-primary">
              Correo del comercio
            </span>
            <input
              className="field"
              defaultValue={initial?.email ?? ''}
              maxLength={256}
              name="email"
              type="email"
            />
          </label>
          <label className="flex items-center gap-3 self-end rounded-xl border border-line bg-panel p-3 text-sm font-semibold text-primary">
            <input
              className="size-4"
              defaultChecked={initial?.isOpen ?? true}
              name="isOpen"
              type="checkbox"
            />
            Mostrar como abierto
          </label>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="font-display text-2xl font-semibold text-primary">
          Imágenes
        </h2>
        <p className="mt-1 text-sm text-muted">
          Usa enlaces HTTPS de imágenes públicas para el logotipo y la portada.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-primary">
              URL del logotipo
            </span>
            <input
              className="field"
              defaultValue={initial?.logoUrl ?? ''}
              name="logoUrl"
              placeholder="https://..."
              type="url"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-primary">
              URL de portada
            </span>
            <input
              className="field"
              defaultValue={initial?.coverImageUrl ?? ''}
              name="coverImageUrl"
              placeholder="https://..."
              type="url"
            />
          </label>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="font-display text-2xl font-semibold text-primary">
          Dirección
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-primary">
              Calle
            </span>
            <input
              className="field"
              defaultValue={initial?.street}
              maxLength={150}
              name="street"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-primary">
              Número exterior
            </span>
            <input
              className="field"
              defaultValue={initial?.exteriorNumber}
              maxLength={20}
              name="exteriorNumber"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-primary">
              Número interior
            </span>
            <input
              className="field"
              defaultValue={initial?.interiorNumber ?? ''}
              maxLength={20}
              name="interiorNumber"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-primary">
              Colonia
            </span>
            <input
              className="field"
              defaultValue={initial?.neighborhood}
              maxLength={100}
              name="neighborhood"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-primary">
              Ciudad
            </span>
            <input
              className="field"
              defaultValue={initial?.city ?? 'Mérida'}
              maxLength={100}
              name="city"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-primary">
              Estado
            </span>
            <input
              className="field"
              defaultValue={initial?.state ?? 'Yucatán'}
              maxLength={100}
              name="state"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-primary">
              Código postal
            </span>
            <input
              className="field"
              defaultValue={initial?.postalCode}
              maxLength={10}
              minLength={4}
              name="postalCode"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-primary">
              Latitud opcional
            </span>
            <input
              className="field"
              defaultValue={initial?.latitude ?? ''}
              max={90}
              min={-90}
              name="latitude"
              step="any"
              type="number"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-primary">
              Longitud opcional
            </span>
            <input
              className="field"
              defaultValue={initial?.longitude ?? ''}
              max={180}
              min={-180}
              name="longitude"
              step="any"
              type="number"
            />
          </label>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="font-display text-2xl font-semibold text-primary">
          Entrega
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-primary">
              Costo de envío
            </span>
            <input
              className="field"
              defaultValue={initial?.deliveryFee ?? 0}
              min={0}
              name="deliveryFee"
              required
              step="0.01"
              type="number"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-primary">
              Pedido mínimo
            </span>
            <input
              className="field"
              defaultValue={initial?.minimumOrderAmount ?? 0}
              min={0}
              name="minimumOrderAmount"
              required
              step="0.01"
              type="number"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-primary">
              Tiempo mínimo
            </span>
            <input
              className="field"
              defaultValue={initial?.estimatedDeliveryMinutesMin ?? 20}
              max={240}
              min={5}
              name="estimatedDeliveryMinutesMin"
              required
              type="number"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-primary">
              Tiempo máximo
            </span>
            <input
              className="field"
              defaultValue={initial?.estimatedDeliveryMinutesMax ?? 40}
              max={240}
              min={5}
              name="estimatedDeliveryMinutesMax"
              required
              type="number"
            />
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          className="primary-button min-w-52"
          disabled={submitting || categories.length === 0}
          type="submit"
        >
          {submitting ? (
            <>
              <Icon className="animate-spin" name="progress_activity" />
              Guardando…
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  )
}
