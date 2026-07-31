import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../../components/common/Icon'
import { Modal } from '../../components/common/Modal'
import { AccountAddressForm } from '../../components/forms/AccountAddressForm'
import { PaymentMethodForm } from '../../components/forms/PaymentMethodForm'
import { ClientHeader } from '../../components/layout/ClientHeader'
import { SiteFooter } from '../../components/layout/SiteFooter'
import { useAuth } from '../../context/AuthContext'
import {
  type PaymentMethod as LocalPaymentMethod,
  useAppState,
} from '../../context/AppStateContext'
import { accountApi } from '../../services/accountApi'
import { catalogApi } from '../../services/catalogApi'
import { orderApi } from '../../services/orderApi'
import { paymentApi } from '../../services/paymentApi'
import type { Address, SaveAddressInput } from '../../types/account'
import type { StoreDetail } from '../../types/catalog'
import type { PaymentMethod } from '../../types/payment'

const steps = [
  ['location_on', 'Dirección'],
  ['credit_card', 'Pago'],
  ['task_alt', 'Confirmación'],
] as const

export function CheckoutPage() {
  const { accessToken, user } = useAuth()
  const { cart, clearCart } = useAppState()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [processing, setProcessing] = useState(false)
  const [addressModal, setAddressModal] = useState(false)
  const [paymentModal, setPaymentModal] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [store, setStore] = useState<StoreDetail | null>(null)
  const [selectedAddress, setSelectedAddress] = useState('')
  const [selectedPayment, setSelectedPayment] = useState('cash')
  const [notes, setNotes] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const itemCount = cart.reduce(
    (total, item) => total + item.quantity,
    0,
  )
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  )
  const serviceFee = Math.round(subtotal * 0.05 * 100) / 100
  const deliveryFee = store?.deliveryFee ?? 0
  const estimatedTotal = subtotal + deliveryFee + serviceFee
  const deliveryAddress = addresses.find(
    (address) => address.id === selectedAddress,
  )
  const paymentMethod = paymentMethods.find(
    (method) => method.id === selectedPayment,
  )
  const storeId = cart[0]?.storeId ?? ''

  useEffect(() => {
    if (!accessToken || !storeId) {
      setLoading(false)
      return
    }
    let active = true
    Promise.all([
      accountApi.getAddresses(accessToken),
      paymentApi.getAll(accessToken),
      catalogApi.getStore(storeId),
    ])
      .then(([nextAddresses, nextPayments, nextStore]) => {
        if (!active) return
        setAddresses(nextAddresses)
        setPaymentMethods(nextPayments)
        setStore(nextStore)
        setSelectedAddress(
          nextAddresses.find((address) => address.isDefault)?.id ??
            nextAddresses[0]?.id ??
            '',
        )
        setSelectedPayment(
          nextPayments.find((method) => method.isDefault)?.id ?? 'cash',
        )
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(
          reason instanceof Error
            ? reason.message
            : 'No fue posible preparar el checkout.',
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [accessToken, storeId])

  const addressReady =
    deliveryAddress?.latitude != null &&
    deliveryAddress.longitude != null
  const canContinue = useMemo(() => {
    if (step === 1) return Boolean(addressReady)
    if (step === 2) return Boolean(selectedPayment)
    return accepted
  }, [accepted, addressReady, selectedPayment, step])

  async function saveAddress(input: SaveAddressInput) {
    if (!accessToken) return
    const created = await accountApi.createAddress(input, accessToken)
    const response = await accountApi.getAddresses(accessToken)
    setAddresses(response)
    setSelectedAddress(created.id)
    setAddressModal(false)
  }

  async function savePayment(method: LocalPaymentMethod) {
    if (!accessToken) return
    const [month, shortYear] = method.expiry
      .split('/')
      .map((value) => Number(value))
    const created = await paymentApi.create(
      {
        type: 'Card',
        displayName: `${method.brand} •••• ${method.last4}`,
        provider: null,
        cardBrand: method.brand,
        lastFourDigits: method.last4,
        expirationMonth: month,
        expirationYear: 2000 + shortYear,
        isDefault: method.isPrimary,
      },
      accessToken,
    )
    setPaymentMethods(await paymentApi.getAll(accessToken))
    setSelectedPayment(created.id)
    setPaymentModal(false)
  }

  async function nextStep() {
    if (!canContinue) return
    if (step < 3) {
      setStep((current) => current + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (!accessToken || !deliveryAddress || !cart.length) return

    setProcessing(true)
    setError('')
    try {
      const order = await orderApi.create(
        {
          storeId,
          deliveryAddressId: deliveryAddress.id,
          paymentMethodId:
            selectedPayment === 'cash' ? null : selectedPayment,
          customerNotes: notes.trim() || null,
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            notes: null,
          })),
        },
        accessToken,
      )
      clearCart()
      navigate(`/pedidos?created=${order.id}`, { replace: true })
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible crear el pedido.',
      )
    } finally {
      setProcessing(false)
    }
  }

  if (!cart.length) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <ClientHeader cartCount={0} />
        <main className="page-shell grid min-h-[65vh] place-items-center py-12">
          <div className="card max-w-lg p-8 text-center">
            <Icon className="text-5xl text-primary" name="shopping_cart" />
            <h1 className="mt-4 font-display text-4xl text-primary">
              Tu carrito está vacío
            </h1>
            <p className="mt-3 text-sm text-muted">
              Agrega productos de un comercio antes de crear un pedido.
            </p>
            <Link className="primary-button mt-6" to="/buscar">
              Explorar comercios
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <ClientHeader cartCount={itemCount} />
      <main className="page-shell py-10 md:py-14">
        <p className="eyebrow">Pedido conectado a MariaDB</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-primary md:text-5xl">
          Checkout
        </h1>
        <p className="mt-2 text-sm text-muted">
          El servidor volverá a validar productos, precios, existencias y total.
        </p>

        <ol className="mt-8 grid max-w-3xl grid-cols-3 gap-2">
          {steps.map(([icon, label], index) => {
            const number = index + 1
            const active = number <= step
            return (
              <li key={label}>
                <button
                  className={`flex w-full flex-col items-center gap-2 rounded-2xl p-3 text-center text-xs font-bold sm:flex-row ${
                    active ? 'bg-primary text-white' : 'bg-panel text-muted'
                  }`}
                  onClick={() => setStep(number)}
                  type="button"
                >
                  <span className="grid size-9 place-items-center rounded-full bg-white/12">
                    <Icon className="text-[19px]" name={icon} />
                  </span>
                  <span>
                    <small className="block text-[10px] opacity-60">
                      Paso {number}
                    </small>
                    {label}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>

        {error ? (
          <p className="mt-6 rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
          <section className="card p-5 md:p-7">
            {loading ? (
              <p className="py-16 text-center text-muted">
                Preparando el checkout…
              </p>
            ) : null}

            {!loading && step === 1 ? (
              <>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-primary">
                      Dirección de entrega
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      Debe tener un punto exacto seleccionado en OSM.
                    </p>
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
                    const hasPoint =
                      address.latitude != null &&
                      address.longitude != null
                    return (
                      <label
                        className={`flex gap-4 rounded-2xl border p-4 ${
                          selected
                            ? 'border-2 border-accent bg-accent/5'
                            : 'border-line'
                        } ${hasPoint ? 'cursor-pointer' : 'opacity-60'}`}
                        key={address.id}
                      >
                        <input
                          checked={selected}
                          disabled={!hasPoint}
                          name="address"
                          onChange={() => setSelectedAddress(address.id)}
                          type="radio"
                        />
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-panel text-primary">
                          <Icon name="location_on" />
                        </span>
                        <span>
                          <strong className="block text-primary">
                            {address.label}
                          </strong>
                          <span className="mt-1 block text-sm text-muted">
                            {address.street} #{address.exteriorNumber},{' '}
                            {address.neighborhood}, {address.city}
                          </span>
                          <span className="mt-1 block text-xs text-muted">
                            {hasPoint
                              ? `${address.latitude?.toFixed(5)}, ${address.longitude?.toFixed(5)}`
                              : 'Edita esta dirección y marca su ubicación.'}
                          </span>
                        </span>
                      </label>
                    )
                  })}
                  {!addresses.length ? (
                    <p className="rounded-xl bg-panel p-5 text-sm text-muted">
                      Agrega una dirección para continuar.
                    </p>
                  ) : null}
                </div>
                <label className="mt-6 block">
                  <span className="mb-2 block text-sm font-bold text-primary">
                    Indicaciones para el comercio o repartidor
                  </span>
                  <textarea
                    className="field min-h-24 resize-none"
                    maxLength={500}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Ej. Sin cebolla; tocar el timbre azul…"
                    value={notes}
                  />
                </label>
              </>
            ) : null}

            {!loading && step === 2 ? (
              <>
                <h2 className="font-display text-2xl font-semibold text-primary">
                  Método de pago
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Solo se guardan datos enmascarados; nunca el número completo ni CVV.
                </p>
                <div className="mt-6 space-y-3">
                  <label className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 ${
                    selectedPayment === 'cash'
                      ? 'border-2 border-accent bg-accent/5'
                      : 'border-line'
                  }`}>
                    <input
                      checked={selectedPayment === 'cash'}
                      name="payment"
                      onChange={() => setSelectedPayment('cash')}
                      type="radio"
                    />
                    <span className="grid size-11 place-items-center rounded-xl bg-panel text-primary">
                      <Icon name="payments" />
                    </span>
                    <span className="flex-1">
                      <strong className="block text-primary">
                        Pago contra entrega
                      </strong>
                      <span className="text-xs text-muted">
                        El pedido se crea con pago pendiente.
                      </span>
                    </span>
                  </label>
                  {paymentMethods.map((method) => (
                    <label
                      className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 ${
                        selectedPayment === method.id
                          ? 'border-2 border-accent bg-accent/5'
                          : 'border-line'
                      }`}
                      key={method.id}
                    >
                      <input
                        checked={selectedPayment === method.id}
                        name="payment"
                        onChange={() => setSelectedPayment(method.id)}
                        type="radio"
                      />
                      <span className="grid size-11 place-items-center rounded-xl bg-primary text-white">
                        <Icon name="credit_card" />
                      </span>
                      <span className="flex-1">
                        <strong className="block text-primary">
                          {method.displayName}
                        </strong>
                        <span className="text-xs text-muted">
                          Expira {String(method.expirationMonth).padStart(2, '0')}/
                          {String(method.expirationYear).slice(-2)}
                        </span>
                      </span>
                    </label>
                  ))}
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
              </>
            ) : null}

            {!loading && step === 3 ? (
              <>
                <h2 className="font-display text-2xl font-semibold text-primary">
                  Revisa tu pedido
                </h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-panel p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">
                      Entrega
                    </p>
                    <p className="mt-2 text-sm font-bold text-primary">
                      {deliveryAddress?.label} · {user?.firstName}{' '}
                      {user?.lastName}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {deliveryAddress?.street} #
                      {deliveryAddress?.exteriorNumber},{' '}
                      {deliveryAddress?.neighborhood}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-panel p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">
                      Pago
                    </p>
                    <p className="mt-2 text-sm font-bold text-primary">
                      {selectedPayment === 'cash'
                        ? 'Contra entrega'
                        : paymentMethod?.displayName}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Total estimado: ${estimatedTotal.toFixed(2)} MXN
                    </p>
                  </div>
                </div>
                <label className="mt-6 flex items-start gap-3 rounded-2xl border border-line p-4 text-sm text-muted">
                  <input
                    checked={accepted}
                    className="mt-1 size-4"
                    onChange={(event) => setAccepted(event.target.checked)}
                    type="checkbox"
                  />
                  Confirmo la dirección, los productos y las cantidades del pedido.
                </label>
              </>
            ) : null}

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
              <button
                className="ghost-button"
                disabled={step === 1 || processing}
                onClick={() => setStep((current) => Math.max(1, current - 1))}
                type="button"
              >
                <Icon className="text-[18px]" name="arrow_back" />
                Atrás
              </button>
              <button
                className="primary-button"
                disabled={processing || !canContinue || loading}
                onClick={() => void nextStep()}
                type="button"
              >
                {processing ? 'Creando pedido…' : step === 3 ? 'Crear pedido' : 'Continuar'}
              </button>
            </div>
          </section>

          <aside className="card sticky top-28 p-5">
            <h2 className="font-display text-2xl font-semibold text-primary">
              {store?.name ?? 'Resumen del pedido'}
            </h2>
            <div className="mt-5 space-y-4">
              {cart.map((item) => (
                <div className="flex items-center gap-3" key={item.productId}>
                  {item.imageUrl ? (
                    <img
                      alt=""
                      className="size-14 rounded-xl object-cover"
                      src={item.imageUrl}
                    />
                  ) : (
                    <span className="grid size-14 place-items-center rounded-xl bg-panel text-primary">
                      <Icon name="restaurant" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-primary">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted">
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                  <strong className="text-sm">
                    ${(item.price * item.quantity).toFixed(2)}
                  </strong>
                </div>
              ))}
            </div>
            <div className="my-5 border-t border-line" />
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd>${subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Envío</dt>
                <dd>${deliveryFee.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Tarifa de servicio</dt>
                <dd>${serviceFee.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-4 text-lg font-bold text-primary">
                <dt>Total estimado</dt>
                <dd>${estimatedTotal.toFixed(2)}</dd>
              </div>
            </dl>
            <p className="mt-5 rounded-xl bg-panel p-3 text-xs text-muted">
              El total definitivo se calcula en el backend con los precios vigentes.
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
          <AccountAddressForm
            onCancel={() => setAddressModal(false)}
            onSave={saveAddress}
          />
        </Modal>
      ) : null}

      {paymentModal ? (
        <Modal
          description="Solo se guardarán la marca, vencimiento y últimos cuatro dígitos."
          onClose={() => setPaymentModal(false)}
          title="Agregar otra tarjeta"
        >
          <PaymentMethodForm
            onCancel={() => setPaymentModal(false)}
            onSave={(method) => void savePayment(method)}
          />
        </Modal>
      ) : null}
    </div>
  )
}
