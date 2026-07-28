import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/common/Icon'
import { Modal } from '../../components/common/Modal'
import { AddressForm } from '../../components/forms/AddressForm'
import { PaymentMethodForm } from '../../components/forms/PaymentMethodForm'
import { ClientHeader } from '../../components/layout/ClientHeader'
import { SiteFooter } from '../../components/layout/SiteFooter'
import { useAppState } from '../../context/AppStateContext'
import { images } from '../../data/mockData'

const steps = [
  ['location_on', 'Dirección'],
  ['credit_card', 'Pago'],
  ['task_alt', 'Confirmación'],
] as const

export function CheckoutPage() {
  const [step, setStep] = useState(1)
  const [processing, setProcessing] = useState(false)
  const [addressModal, setAddressModal] = useState(false)
  const [paymentModal, setPaymentModal] = useState(false)
  const {
    addresses,
    paymentMethods,
    saveAddress,
    savePaymentMethod,
  } = useAppState()
  const [selectedAddress, setSelectedAddress] = useState(
    addresses.find((address) => address.isPrimary)?.id ?? addresses[0]?.id ?? '',
  )
  const [selectedPayment, setSelectedPayment] = useState(
    paymentMethods.find((method) => method.isPrimary)?.id ?? paymentMethods[0]?.id ?? '',
  )
  const navigate = useNavigate()
  const deliveryAddress =
    addresses.find((address) => address.id === selectedAddress) ?? addresses[0]
  const paymentMethod =
    paymentMethods.find((method) => method.id === selectedPayment) ?? paymentMethods[0]

  function nextStep() {
    if (step < 3) {
      setStep((current) => current + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setProcessing(true)
    window.setTimeout(() => navigate('/seguimiento'), 900)
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <ClientHeader cartCount={2} />
      <main className="page-shell py-10 md:py-14">
        <p className="eyebrow">Compra segura</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-primary md:text-5xl">Checkout</h1>
        <p className="mt-2 text-sm text-muted">Completa los datos para confirmar tu pedido.</p>

        <ol className="mt-8 grid max-w-3xl grid-cols-3 gap-2">
          {steps.map(([icon, label], index) => {
            const number = index + 1
            const active = number <= step
            return (
              <li className="relative" key={label}>
                <button
                  className={`flex w-full flex-col items-center gap-2 rounded-2xl p-3 text-center text-xs font-bold transition sm:flex-row sm:text-left ${
                    active ? 'bg-primary text-white' : 'bg-panel text-muted'
                  }`}
                  onClick={() => setStep(number)}
                  type="button"
                >
                  <span
                    className={`grid size-9 place-items-center rounded-full ${
                      active ? 'bg-white/12' : 'bg-white'
                    }`}
                  >
                    <Icon className="text-[19px]" name={icon} />
                  </span>
                  <span>
                    <small className="block text-[10px] opacity-60">Paso {number}</small>
                    {label}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
          <section className="card p-5 md:p-7">
            {step === 1 ? (
              <>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-primary">
                      Dirección de entrega
                    </h2>
                    <p className="mt-1 text-sm text-muted">Selecciona dónde recibirás tu pedido.</p>
                  </div>
                  <button
                    className="ghost-button !min-h-10 !px-4"
                    onClick={() => setAddressModal(true)}
                    type="button"
                  >
                    <Icon className="text-[18px]" name="add" />
                    Nueva
                  </button>
                </div>
                <div className="mt-6 grid gap-3">
                  {addresses.map((address) => {
                    const selected = address.id === selectedAddress
                    return (
                      <label
                        className={`flex cursor-pointer gap-4 rounded-2xl border p-4 ${
                          selected ? 'border-2 border-accent bg-accent/5' : 'border-line hover:bg-panel/60'
                        }`}
                        key={address.id}
                      >
                        <input
                          checked={selected}
                          className="mt-1 text-accent focus:ring-accent"
                          name="address"
                          onChange={() => setSelectedAddress(address.id)}
                          type="radio"
                        />
                        <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${selected ? 'bg-white' : 'bg-panel'} text-primary`}>
                          <Icon name={address.label === 'Trabajo' ? 'work' : 'home'} />
                        </span>
                        <span>
                          <strong className="block text-primary">{address.label}</strong>
                          <span className="mt-1 block text-sm leading-6 text-muted">
                            {address.street}, {address.neighborhood}, {address.city}
                          </span>
                          <span className="mt-1 block text-xs text-muted">
                            Recibe: {address.receiver} · {address.phone}
                          </span>
                        </span>
                      </label>
                    )
                  })}
                </div>
                <label className="mt-6 block">
                  <span className="mb-2 block text-sm font-bold text-primary">Referencias</span>
                  <textarea
                    className="field min-h-24 resize-none"
                    placeholder="Color de la casa, entre calles, indicaciones…"
                  />
                </label>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <h2 className="font-display text-2xl font-semibold text-primary">Método de pago</h2>
                <p className="mt-1 text-sm text-muted">Tus datos se procesan de forma segura.</p>
                <div className="mt-6 space-y-3">
                  {paymentMethods.map((payment) => {
                    const selected = payment.id === selectedPayment
                    return (
                      <label
                        className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 ${
                          selected ? 'border-2 border-accent bg-accent/5' : 'border-line'
                        }`}
                        key={payment.id}
                      >
                        <input
                          checked={selected}
                          className="text-accent focus:ring-accent"
                          name="payment"
                          onChange={() => setSelectedPayment(payment.id)}
                          type="radio"
                        />
                        <span className={`grid size-11 place-items-center rounded-xl ${selected ? 'bg-primary text-white' : 'bg-panel text-primary'}`}>
                          <Icon name="credit_card" />
                        </span>
                        <span className="flex-1">
                          <strong className="block text-primary">{payment.brand} terminación {payment.last4}</strong>
                          <span className="text-xs text-muted">Expira {payment.expiry}</span>
                        </span>
                        <Icon className="text-success" name="verified_user" />
                      </label>
                    )
                  })}
                  <button
                    className="flex w-full items-center gap-4 rounded-2xl border border-line p-4 text-left hover:bg-panel/50"
                    onClick={() => setPaymentModal(true)}
                    type="button"
                  >
                    <span className="grid size-11 place-items-center rounded-xl bg-panel text-primary">
                      <Icon name="add_card" />
                    </span>
                    <strong className="text-primary">Agregar otra tarjeta</strong>
                  </button>
                </div>
                <div className="mt-6 rounded-2xl bg-panel p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-primary">
                    <Icon className="text-success" name="lock" />
                    Pago protegido
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted">
                    AppDelivery nunca almacena ni muestra el número completo de tu tarjeta.
                  </p>
                </div>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <h2 className="font-display text-2xl font-semibold text-primary">Revisa tu pedido</h2>
                <p className="mt-1 text-sm text-muted">Confirma que todos los datos sean correctos.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-panel p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">Entrega</p>
                    <p className="mt-2 text-sm font-bold text-primary">
                      {deliveryAddress?.label} · {deliveryAddress?.receiver}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {deliveryAddress?.street}, {deliveryAddress?.neighborhood}, {deliveryAddress?.city}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-panel p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">Pago</p>
                    <p className="mt-2 text-sm font-bold text-primary">
                      {paymentMethod?.brand} •••• {paymentMethod?.last4}
                    </p>
                    <p className="mt-1 text-xs text-muted">Pago único por $290 MXN</p>
                  </div>
                </div>
                <label className="mt-6 flex items-start gap-3 rounded-2xl border border-line p-4 text-sm text-muted">
                  <input required className="mt-1 size-4 rounded text-accent focus:ring-accent" type="checkbox" />
                  Acepto los términos y condiciones y confirmo que los datos del pedido son correctos.
                </label>
              </>
            ) : null}

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
              <button
                className="ghost-button"
                disabled={step === 1}
                onClick={() => setStep((current) => Math.max(1, current - 1))}
                type="button"
              >
                <Icon className="text-[18px]" name="arrow_back" />
                Atrás
              </button>
              <button className="primary-button" disabled={processing} onClick={nextStep} type="button">
                {processing ? (
                  <>
                    <Icon className="animate-spin text-[19px]" name="progress_activity" />
                    Procesando…
                  </>
                ) : step === 3 ? (
                  'Confirmar y pagar'
                ) : (
                  <>
                    Continuar
                    <Icon className="text-[18px]" name="arrow_forward" />
                  </>
                )}
              </button>
            </div>
          </section>

          <aside className="card sticky top-28 p-5">
            <h2 className="font-display text-2xl font-semibold text-primary">Resumen del pedido</h2>
            <div className="mt-5 space-y-4">
              {[
                [images.burger, 'Hamburguesa Maya', '1', '$149 MXN'],
                [images.fries, 'Papas fritas grandes', '1', '$65 MXN'],
              ].map(([image, name, quantity, price]) => (
                <div className="flex items-center gap-3" key={name}>
                  <img alt="" className="size-14 rounded-xl object-cover" src={image} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-primary">{name}</p>
                    <p className="text-xs text-muted">Cantidad: {quantity}</p>
                  </div>
                  <strong className="text-sm">{price}</strong>
                </div>
              ))}
            </div>
            <div className="my-5 border-t border-line" />
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd>$214 MXN</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Envío</dt>
                <dd>$25 MXN</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Impuestos</dt>
                <dd>$51 MXN</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-4 text-lg font-bold text-primary">
                <dt>Total</dt>
                <dd>$290 MXN</dd>
              </div>
            </dl>
            <p className="mt-5 flex items-center gap-2 rounded-xl bg-success/8 p-3 text-xs font-semibold text-success">
              <Icon className="text-[19px]" name="schedule" />
              Entrega estimada: 25–35 minutos
            </p>
          </aside>
        </div>
      </main>
      <SiteFooter />

      {addressModal ? (
        <Modal
          description="La dirección quedará disponible también en tu perfil."
          onClose={() => setAddressModal(false)}
          title="Nueva dirección de entrega"
        >
          <AddressForm
            onCancel={() => setAddressModal(false)}
            onSave={(address) => {
              saveAddress(address)
              setSelectedAddress(address.id)
              setAddressModal(false)
            }}
          />
        </Modal>
      ) : null}

      {paymentModal ? (
        <Modal
          description="Solo se mostrarán la marca y los últimos cuatro dígitos."
          onClose={() => setPaymentModal(false)}
          title="Agregar otra tarjeta"
        >
          <PaymentMethodForm
            onCancel={() => setPaymentModal(false)}
            onSave={(payment) => {
              savePaymentMethod(payment)
              setSelectedPayment(payment.id)
              setPaymentModal(false)
            }}
          />
        </Modal>
      ) : null}
    </div>
  )
}
