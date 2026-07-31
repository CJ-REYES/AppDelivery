import { type FormEvent, useEffect, useState } from 'react'
import type { Address } from '../../context/AppStateContext'
import type { GeoPoint } from '../../types/routing'
import { LocationPicker } from '../maps/LocationPicker'

type AddressFormProps = {
  initial?: Address
  onCancel: () => void
  onSave: (address: Address) => void
}

export function AddressForm({ initial, onCancel, onSave }: AddressFormProps) {
  const [location, setLocation] = useState<GeoPoint | null>(
    initial?.latitude != null && initial.longitude != null
      ? {
          latitude: initial.latitude,
          longitude: initial.longitude,
        }
      : null,
  )

  useEffect(() => {
    if (initial?.latitude != null && initial.longitude != null) {
      setLocation({
        latitude: initial.latitude,
        longitude: initial.longitude,
      })
    }
  }, [initial])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!location) return
    const data = new FormData(event.currentTarget)
    const label = String(data.get('label')).trim()

    onSave({
      id: initial?.id ?? `${label.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      label,
      street: String(data.get('street')).trim(),
      neighborhood: String(data.get('neighborhood')).trim(),
      city: String(data.get('city')).trim(),
      postalCode: String(data.get('postalCode')).trim(),
      receiver: String(data.get('receiver')).trim(),
      phone: String(data.get('phone')).trim(),
      references: String(data.get('references')).trim(),
      latitude: location.latitude,
      longitude: location.longitude,
      isPrimary: data.get('isPrimary') === 'on',
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-bold text-primary">Tipo de dirección</span>
          <select className="field" defaultValue={initial?.label ?? 'Casa'} name="label">
            <option>Casa</option>
            <option>Trabajo</option>
            <option>Otro</option>
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-primary">Código postal</span>
          <input
            className="field"
            defaultValue={initial?.postalCode}
            inputMode="numeric"
            maxLength={5}
            name="postalCode"
            required
          />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-bold text-primary">Calle y número</span>
          <input className="field" defaultValue={initial?.street} name="street" required />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-primary">Colonia</span>
          <input className="field" defaultValue={initial?.neighborhood} name="neighborhood" required />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-primary">Ciudad y estado</span>
          <input
            className="field"
            defaultValue={initial?.city ?? ''}
            name="city"
            placeholder="Tu ciudad y estado"
            required
          />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-primary">Persona que recibe</span>
          <input className="field" defaultValue={initial?.receiver} name="receiver" required />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-primary">Teléfono</span>
          <input className="field" defaultValue={initial?.phone} name="phone" required type="tel" />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-bold text-primary">Referencias</span>
          <textarea
            className="field min-h-24 resize-none"
            defaultValue={initial?.references}
            name="references"
            placeholder="Color de la fachada, entre calles o indicaciones."
          />
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold text-primary sm:col-span-2">
          <input
            className="size-4 rounded text-accent focus:ring-accent"
            defaultChecked={initial?.isPrimary}
            name="isPrimary"
            type="checkbox"
          />
          Usar como dirección principal
        </label>
      </div>
      <div className="mt-5">
        <LocationPicker
          description="Marca la entrada donde quieres recibir el pedido."
          onChange={setLocation}
          title="Punto exacto de entrega"
          value={location}
        />
      </div>
      <div className="mt-7 flex justify-end gap-3">
        <button className="ghost-button" onClick={onCancel} type="button">Cancelar</button>
        <button className="primary-button" disabled={!location} type="submit">Guardar dirección</button>
      </div>
    </form>
  )
}
