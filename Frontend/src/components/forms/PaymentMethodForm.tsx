import { type FormEvent, useState } from 'react'
import type { PaymentMethod } from '../../context/AppStateContext'
import { Icon } from '../common/Icon'

type PaymentMethodFormProps = {
  onCancel: () => void
  onSave: (paymentMethod: PaymentMethod) => void
}

function normalizeCardNumber(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim()
}

function detectBrand(number: string) {
  const normalized = number.replace(/\s/g, '')
  if (normalized.startsWith('4')) return 'Visa'
  if (/^5[1-5]/.test(normalized)) return 'Mastercard'
  return 'Tarjeta'
}

export function PaymentMethodForm({ onCancel, onSave }: PaymentMethodFormProps) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const normalized = cardNumber.replace(/\s/g, '')

    if (normalized.length < 15) return

    onSave({
      id: `card-${normalized.slice(-4)}-${Date.now()}`,
      brand: detectBrand(cardNumber),
      last4: normalized.slice(-4),
      expiry,
      holder: String(data.get('holder')).trim(),
      isPrimary: data.get('isPrimary') === 'on',
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-2xl bg-primary p-5 text-white">
        <div className="flex items-center justify-between">
          <Icon className="text-[30px]" name="credit_card" />
          <Icon className="text-success" name="verified_user" />
        </div>
        <p className="mt-8 text-lg font-semibold tracking-[0.18em]">
          {cardNumber || '•••• •••• •••• ••••'}
        </p>
        <div className="mt-5 flex justify-between text-xs text-white/65">
          <span>{detectBrand(cardNumber)}</span>
          <span>{expiry || 'MM/AA'}</span>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-bold text-primary">Nombre del titular</span>
          <input autoComplete="cc-name" className="field" name="holder" required />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-bold text-primary">Número de tarjeta</span>
          <input
            autoComplete="cc-number"
            className="field"
            inputMode="numeric"
            onChange={(event) => setCardNumber(normalizeCardNumber(event.target.value))}
            pattern="[0-9 ]{18,19}"
            placeholder="4242 4242 4242 4242"
            required
            value={cardNumber}
          />
          <span className="mt-2 block text-xs text-muted">
            En esta maqueta solo se conservan la marca y los últimos 4 dígitos.
          </span>
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-primary">Vencimiento</span>
          <input
            autoComplete="cc-exp"
            className="field"
            maxLength={5}
            onChange={(event) => {
              const value = event.target.value.replace(/\D/g, '').slice(0, 4)
              setExpiry(value.length > 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value)
            }}
            pattern="(0[1-9]|1[0-2])/[0-9]{2}"
            placeholder="MM/AA"
            required
            value={expiry}
          />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-primary">CVV</span>
          <input
            autoComplete="cc-csc"
            className="field"
            inputMode="numeric"
            maxLength={4}
            name="cvv"
            pattern="[0-9]{3,4}"
            placeholder="123"
            required
            type="password"
          />
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold text-primary sm:col-span-2">
          <input
            className="size-4 rounded text-accent focus:ring-accent"
            name="isPrimary"
            type="checkbox"
          />
          Usar como método de pago principal
        </label>
      </div>
      <div className="mt-7 flex justify-end gap-3">
        <button className="ghost-button" onClick={onCancel} type="button">Cancelar</button>
        <button className="primary-button" type="submit">
          <Icon className="text-[18px]" name="lock" />
          Guardar tarjeta
        </button>
      </div>
    </form>
  )
}
