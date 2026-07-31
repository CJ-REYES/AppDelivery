import { type FormEvent, useState } from 'react'
import type {
  Address,
  SaveAddressInput,
} from '../../types/account'

type AccountAddressFormProps = {
  initial?: Address
  onCancel: () => void
  onSave: (address: SaveAddressInput) => Promise<void>
}

function optionalText(value: FormDataEntryValue | null) {
  const normalized = String(value ?? '').trim()
  return normalized || null
}

function optionalNumber(value: FormDataEntryValue | null) {
  const normalized = String(value ?? '').trim()
  return normalized ? Number(normalized) : null
}

export function AccountAddressForm({
  initial,
  onCancel,
  onSave,
}: AccountAddressFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setSubmitting(true)
    setError('')

    try {
      await onSave({
        label: String(data.get('label') ?? '').trim(),
        street: String(data.get('street') ?? '').trim(),
        exteriorNumber: String(
          data.get('exteriorNumber') ?? '',
        ).trim(),
        interiorNumber: optionalText(data.get('interiorNumber')),
        neighborhood: String(data.get('neighborhood') ?? '').trim(),
        city: String(data.get('city') ?? '').trim(),
        state: String(data.get('state') ?? '').trim(),
        postalCode: String(data.get('postalCode') ?? '').trim(),
        country: String(data.get('country') ?? '').trim(),
        references: optionalText(data.get('references')),
        latitude: optionalNumber(data.get('latitude')),
        longitude: optionalNumber(data.get('longitude')),
        isDefault: data.get('isDefault') === 'on',
      })
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible guardar la dirección.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-bold text-primary">
            Etiqueta
          </span>
          <select
            className="field"
            defaultValue={initial?.label ?? 'Casa'}
            name="label"
          >
            <option>Casa</option>
            <option>Trabajo</option>
            <option>Otro</option>
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-primary">
            Código postal
          </span>
          <input
            className="field"
            defaultValue={initial?.postalCode}
            inputMode="numeric"
            maxLength={5}
            name="postalCode"
            pattern="\d{5}"
            required
          />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-bold text-primary">
            Calle
          </span>
          <input
            className="field"
            defaultValue={initial?.street}
            minLength={2}
            name="street"
            required
          />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-primary">
            Número exterior
          </span>
          <input
            className="field"
            defaultValue={initial?.exteriorNumber}
            name="exteriorNumber"
            required
          />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-primary">
            Número interior
          </span>
          <input
            className="field"
            defaultValue={initial?.interiorNumber ?? ''}
            name="interiorNumber"
          />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-primary">
            Colonia
          </span>
          <input
            className="field"
            defaultValue={initial?.neighborhood}
            minLength={2}
            name="neighborhood"
            required
          />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-primary">
            Ciudad
          </span>
          <input
            className="field"
            defaultValue={initial?.city ?? 'Mérida'}
            minLength={2}
            name="city"
            required
          />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-primary">
            Estado
          </span>
          <input
            className="field"
            defaultValue={initial?.state ?? 'Yucatán'}
            minLength={2}
            name="state"
            required
          />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-primary">
            País
          </span>
          <input
            className="field"
            defaultValue={initial?.country ?? 'México'}
            minLength={2}
            name="country"
            required
          />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-primary">
            Latitud (opcional)
          </span>
          <input
            className="field"
            defaultValue={initial?.latitude ?? ''}
            max="90"
            min="-90"
            name="latitude"
            step="any"
            type="number"
          />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-primary">
            Longitud (opcional)
          </span>
          <input
            className="field"
            defaultValue={initial?.longitude ?? ''}
            max="180"
            min="-180"
            name="longitude"
            step="any"
            type="number"
          />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-bold text-primary">
            Referencias
          </span>
          <textarea
            className="field min-h-24 resize-none"
            defaultValue={initial?.references ?? ''}
            maxLength={500}
            name="references"
            placeholder="Color de la fachada, entre calles o indicaciones."
          />
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold text-primary sm:col-span-2">
          <input
            className="size-4 rounded text-accent focus:ring-accent"
            defaultChecked={initial?.isDefault}
            name="isDefault"
            type="checkbox"
          />
          Usar como dirección principal
        </label>
      </div>
      {error ? (
        <div
          className="mt-5 rounded-xl border border-danger/20 bg-danger/5 p-3 text-sm text-danger"
          role="alert"
        >
          {error}
        </div>
      ) : null}
      <div className="mt-7 flex justify-end gap-3">
        <button
          className="ghost-button"
          disabled={submitting}
          onClick={onCancel}
          type="button"
        >
          Cancelar
        </button>
        <button
          className="primary-button"
          disabled={submitting}
          type="submit"
        >
          {submitting ? 'Guardando…' : 'Guardar dirección'}
        </button>
      </div>
    </form>
  )
}
