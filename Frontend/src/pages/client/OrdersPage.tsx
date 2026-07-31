import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '../../components/common/Icon'
import { ClientHeader } from '../../components/layout/ClientHeader'
import { MobileNav } from '../../components/layout/MobileNav'
import { SiteFooter } from '../../components/layout/SiteFooter'
import { useAuth } from '../../context/AuthContext'
import { useAppState } from '../../context/AppStateContext'
import { orderApi } from '../../services/orderApi'
import type { Order, OrderStatus } from '../../types/order'

type Tab = 'En curso' | 'Historial' | 'Cancelados'

const activeStatuses: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Preparing',
  'ReadyForPickup',
  'OutForDelivery',
]

const statusLabels: Record<OrderStatus, string> = {
  Pending: 'Pendiente de confirmación',
  Confirmed: 'Confirmado',
  Preparing: 'En preparación',
  ReadyForPickup: 'Listo para recoger',
  OutForDelivery: 'En camino',
  Delivered: 'Entregado',
  Cancelled: 'Cancelado',
}

function orderDate(value: string) {
  return new Date(value).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function OrdersPage() {
  const { accessToken } = useAuth()
  const { cart } = useAppState()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>('En curso')
  const [orders, setOrders] = useState<Order[]>([])
  const [expanded, setExpanded] = useState<string | null>(
    searchParams.get('created'),
  )
  const [loading, setLoading] = useState(true)
  const [workingId, setWorkingId] = useState('')
  const [error, setError] = useState('')
  const createdId = searchParams.get('created')

  useEffect(() => {
    if (!accessToken) return
    orderApi
      .getMine(accessToken)
      .then(setOrders)
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : 'No fue posible cargar tus pedidos.',
        ),
      )
      .finally(() => setLoading(false))
  }, [accessToken])

  const filtered = useMemo(
    () =>
      orders.filter((order) => {
        if (tab === 'En curso') return activeStatuses.includes(order.status)
        if (tab === 'Historial') return order.status === 'Delivered'
        return order.status === 'Cancelled'
      }),
    [orders, tab],
  )

  async function cancelOrder(order: Order) {
    if (!accessToken) return
    const reason = window.prompt(
      `¿Por qué deseas cancelar ${order.orderNumber}?`,
    )?.trim()
    if (!reason) return

    setWorkingId(order.id)
    setError('')
    try {
      const updated = await orderApi.cancel(order.id, reason, accessToken)
      setOrders((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      setTab('Cancelados')
    } catch (reasonValue) {
      setError(
        reasonValue instanceof Error
          ? reasonValue.message
          : 'No fue posible cancelar el pedido.',
      )
    } finally {
      setWorkingId('')
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-20 md:pb-0">
      <ClientHeader
        cartCount={cart.reduce((total, item) => total + item.quantity, 0)}
      />
      <main className="page-shell py-10 md:py-14">
        <p className="eyebrow">Historial y seguimiento</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-primary md:text-5xl">
          Mis pedidos
        </h1>
        <p className="mt-2 text-sm text-muted">
          Todos los pedidos mostrados aquí provienen de MariaDB.
        </p>

        {createdId ? (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-success/20 bg-success/5 p-4 text-sm text-success">
            <Icon name="check_circle" />
            <span>
              <strong className="block">Pedido creado correctamente</strong>
              El comercio ya puede verlo en “Pedidos vendidos”.
            </span>
          </div>
        ) : null}
        {error ? (
          <p className="mt-6 rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto border-b border-line">
          {(['En curso', 'Historial', 'Cancelados'] as Tab[]).map(
            (item) => (
              <button
                className={`shrink-0 border-b-2 px-5 py-3 text-sm font-bold transition ${
                  tab === item
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted'
                }`}
                key={item}
                onClick={() => setTab(item)}
                type="button"
              >
                {item}
                <span className="ml-2 rounded-full bg-panel px-2 py-0.5 text-[10px] text-muted">
                  {orders.filter((order) =>
                    item === 'En curso'
                      ? activeStatuses.includes(order.status)
                      : item === 'Historial'
                        ? order.status === 'Delivered'
                        : order.status === 'Cancelled',
                  ).length}
                </span>
              </button>
            ),
          )}
        </div>

        {loading ? (
          <p className="py-16 text-center text-muted">Cargando pedidos…</p>
        ) : filtered.length === 0 ? (
          <div className="card mt-7 flex min-h-72 flex-col items-center justify-center p-8 text-center">
            <Icon className="text-5xl text-primary" name="receipt_long" />
            <h2 className="mt-5 font-display text-2xl font-semibold text-primary">
              No hay pedidos en esta sección
            </h2>
            <p className="mt-2 text-sm text-muted">
              Cuando realices una compra aparecerá automáticamente aquí.
            </p>
            <Link className="primary-button mt-6" to="/buscar">
              Explorar comercios
            </Link>
          </div>
        ) : (
          <section className="mt-7 space-y-4">
            {filtered.map((order) => {
              const isActive = activeStatuses.includes(order.status)
              const isOpen = expanded === order.id
              return (
                <article
                  className={`card overflow-hidden ${
                    order.id === createdId ? 'ring-2 ring-success/30' : ''
                  }`}
                  key={order.id}
                >
                  <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
                    {order.storeLogoUrl ? (
                      <img
                        alt=""
                        className="size-20 rounded-2xl bg-panel object-cover"
                        src={order.storeLogoUrl}
                      />
                    ) : (
                      <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-panel text-primary">
                        <Icon className="text-3xl" name="storefront" />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="eyebrow">{order.orderNumber}</p>
                          <h2 className="mt-1 font-display text-2xl font-semibold text-primary">
                            {order.storeName}
                          </h2>
                          <p className="mt-1 text-xs text-muted">
                            {orderDate(order.createdAt)} ·{' '}
                            {order.items.reduce(
                              (total, item) => total + item.quantity,
                              0,
                            )}{' '}
                            productos
                          </p>
                        </div>
                        <span
                          className={`status-pill ${
                            order.status === 'Cancelled'
                              ? 'bg-danger/10 text-danger'
                              : order.status === 'Delivered'
                                ? 'bg-success/10 text-success'
                                : 'bg-warning/15 text-[#8a5c00]'
                          }`}
                        >
                          {statusLabels[order.status]}
                        </span>
                      </div>
                      <p className="mt-3 truncate text-sm text-muted">
                        {order.items
                          .map(
                            (item) =>
                              `${item.quantity}× ${item.productName}`,
                          )
                          .join(' · ')}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:max-w-52 sm:justify-end">
                      <strong className="w-full text-lg text-primary sm:text-right">
                        ${order.total.toFixed(2)} MXN
                      </strong>
                      {isActive ? (
                        <button
                          className="secondary-button !min-h-10 !px-4"
                          onClick={() => setExpanded(isOpen ? null : order.id)}
                          type="button"
                        >
                          <Icon name="receipt_long" />
                          Ver estado
                        </button>
                      ) : (
                        <Link
                          className="ghost-button !min-h-10 !px-4"
                          to={`/comercio/${order.storeId}`}
                        >
                          Volver a pedir
                        </Link>
                      )}
                      <button
                        className="icon-button border border-line"
                        onClick={() =>
                          setExpanded(isOpen ? null : order.id)
                        }
                        type="button"
                      >
                        <Icon name={isOpen ? 'expand_less' : 'expand_more'} />
                      </button>
                    </div>
                  </div>

                  {isOpen ? (
                    <div className="border-t border-line bg-panel/35 p-5">
                      <div className="grid gap-6 lg:grid-cols-2">
                        <div>
                          <h3 className="font-bold text-primary">
                            Detalle del pedido
                          </h3>
                          <div className="mt-3 space-y-2">
                            {order.items.map((item) => (
                              <div
                                className="flex justify-between gap-4 text-sm"
                                key={item.id}
                              >
                                <span className="text-muted">
                                  {item.quantity}× {item.productName}
                                </span>
                                <strong>
                                  ${item.totalPrice.toFixed(2)}
                                </strong>
                              </div>
                            ))}
                            <div className="flex justify-between border-t border-line pt-2 text-sm">
                              <span className="text-muted">
                                Envío + servicio
                              </span>
                              <strong>
                                $
                                {(
                                  order.deliveryFee + order.serviceFee
                                ).toFixed(2)}
                              </strong>
                            </div>
                          </div>
                          <p className="mt-4 text-xs leading-5 text-muted">
                            Entrega: {order.deliveryAddress}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-bold text-primary">
                            Historial de estados
                          </h3>
                          <ol className="mt-3 space-y-3">
                            {order.statusHistory.map((history, index) => (
                              <li
                                className="flex gap-3 text-sm"
                                key={`${history.status}-${history.createdAt}-${index}`}
                              >
                                <Icon
                                  className="text-success"
                                  name="check_circle"
                                />
                                <span>
                                  <strong className="block text-primary">
                                    {statusLabels[history.status]}
                                  </strong>
                                  <span className="text-xs text-muted">
                                    {orderDate(history.createdAt)}
                                    {history.note
                                      ? ` · ${history.note}`
                                      : ''}
                                  </span>
                                </span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                      {order.status === 'Pending' ||
                      order.status === 'Confirmed' ? (
                        <button
                          className="mt-5 text-sm font-bold text-danger"
                          disabled={workingId === order.id}
                          onClick={() => void cancelOrder(order)}
                          type="button"
                        >
                          {workingId === order.id
                            ? 'Cancelando…'
                            : 'Cancelar pedido'}
                        </button>
                      ) : null}
                      {order.cancellationReason ? (
                        <p className="mt-4 rounded-xl bg-danger/5 p-3 text-sm text-danger">
                          Motivo: {order.cancellationReason}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              )
            })}
          </section>
        )}
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  )
}
