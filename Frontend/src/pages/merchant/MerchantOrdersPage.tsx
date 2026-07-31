import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../../components/common/Icon'
import { MerchantHeader } from '../../components/layout/MerchantHeader'
import { useAuth } from '../../context/AuthContext'
import { merchantOrderApi } from '../../services/orderApi'
import type {
  MerchantSalesSummary,
  Order,
  OrderStatus,
} from '../../types/order'

type Filter = 'Activos' | 'Vendidos' | 'Cancelados'

const statusLabels: Record<OrderStatus, string> = {
  Pending: 'Nuevo',
  Confirmed: 'Confirmado',
  Preparing: 'Preparando',
  ReadyForPickup: 'Listo para recoger',
  OutForDelivery: 'En reparto',
  Delivered: 'Vendido y entregado',
  Cancelled: 'Cancelado',
}

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  Pending: 'Confirmed',
  Confirmed: 'Preparing',
  Preparing: 'ReadyForPickup',
}

const nextLabels: Partial<Record<OrderStatus, string>> = {
  Pending: 'Confirmar pedido',
  Confirmed: 'Empezar preparación',
  Preparing: 'Marcar listo para recoger',
}

export function MerchantOrdersPage() {
  const { accessToken } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [summary, setSummary] = useState<MerchantSalesSummary | null>(null)
  const [filter, setFilter] = useState<Filter>('Activos')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [workingId, setWorkingId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function reload(token: string) {
    const [nextOrders, nextSummary] = await Promise.all([
      merchantOrderApi.getAll(token),
      merchantOrderApi.getSummary(token),
    ])
    setOrders(nextOrders)
    setSummary(nextSummary)
  }

  useEffect(() => {
    if (!accessToken) return
    reload(accessToken)
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : 'No fue posible cargar los pedidos vendidos.',
        ),
      )
      .finally(() => setLoading(false))
  }, [accessToken])

  const filtered = useMemo(
    () =>
      orders.filter((order) => {
        if (filter === 'Vendidos') return order.status === 'Delivered'
        if (filter === 'Cancelados') return order.status === 'Cancelled'
        return !['Delivered', 'Cancelled'].includes(order.status)
      }),
    [filter, orders],
  )

  async function advance(order: Order) {
    if (!accessToken) return
    const status = nextStatus[order.status]
    if (!status) return
    setWorkingId(order.id)
    setError('')
    setMessage('')
    try {
      const updated = await merchantOrderApi.updateStatus(
        order.id,
        status,
        null,
        accessToken,
      )
      setOrders((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      setSummary(await merchantOrderApi.getSummary(accessToken))
      setMessage(
        status === 'ReadyForPickup'
          ? 'El pedido quedó listo para continuar con la entrega.'
          : 'Estado actualizado correctamente.',
      )
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible actualizar el pedido.',
      )
    } finally {
      setWorkingId('')
    }
  }

  async function cancel(order: Order) {
    if (!accessToken) return
    const note = window.prompt(
      `Motivo para cancelar ${order.orderNumber}:`,
    )?.trim()
    if (!note) return
    setWorkingId(order.id)
    setError('')
    try {
      const updated = await merchantOrderApi.updateStatus(
        order.id,
        'Cancelled',
        note,
        accessToken,
      )
      setOrders((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      setSummary(await merchantOrderApi.getSummary(accessToken))
      setFilter('Cancelados')
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible cancelar el pedido.',
      )
    } finally {
      setWorkingId('')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MerchantHeader />
      <main className="page-shell py-10 md:py-14">
        <p className="eyebrow">Ventas registradas</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-primary md:text-6xl">
          Pedidos vendidos
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Confirma, prepara y deja listos los pedidos recibidos por el
          comercio.
        </p>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['receipt_long', 'Pedidos totales', summary?.totalOrders ?? 0],
            ['pending_actions', 'Por atender', summary?.pendingOrders ?? 0],
            ['local_shipping', 'Activos', summary?.activeOrders ?? 0],
            [
              'payments',
              'Ventas entregadas',
              `$${(summary?.grossSales ?? 0).toFixed(2)}`,
            ],
          ].map(([icon, label, value]) => (
            <article className="card p-5" key={label}>
              <Icon className="text-primary" name={String(icon)} />
              <p className="mt-4 text-sm font-semibold text-muted">{label}</p>
              <strong className="mt-1 block font-display text-3xl text-primary">
                {value}
              </strong>
            </article>
          ))}
        </section>

        {error ? (
          <p className="mt-6 rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="mt-6 rounded-xl border border-success/20 bg-success/5 p-4 text-sm text-success">
            {message}
          </p>
        ) : null}

        <div className="mt-8 flex gap-2 border-b border-line">
          {(['Activos', 'Vendidos', 'Cancelados'] as Filter[]).map(
            (item) => (
              <button
                className={`border-b-2 px-5 py-3 text-sm font-bold ${
                  filter === item
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted'
                }`}
                key={item}
                onClick={() => setFilter(item)}
                type="button"
              >
                {item}
              </button>
            ),
          )}
        </div>

        {loading ? (
          <p className="py-16 text-center text-muted">Cargando pedidos…</p>
        ) : filtered.length === 0 ? (
          <div className="card mt-6 p-12 text-center">
            <Icon className="text-5xl text-primary" name="inventory_2" />
            <h2 className="mt-4 font-display text-3xl text-primary">
              Sin pedidos para mostrar
            </h2>
            <p className="mt-2 text-sm text-muted">
              Los pedidos creados por clientes aparecerán aquí.
            </p>
          </div>
        ) : (
          <section className="mt-6 space-y-4">
            {filtered.map((order) => {
              const canCancel = [
                'Pending',
                'Confirmed',
                'Preparing',
              ].includes(order.status)
              const isExpanded = expanded === order.id
              return (
                <article className="card overflow-hidden" key={order.id}>
                  <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center">
                    <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-panel text-primary">
                      <Icon name="receipt_long" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="eyebrow">{order.orderNumber}</p>
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
                      <h2 className="mt-2 font-display text-2xl text-primary">
                        {order.deliveryRecipientName}
                      </h2>
                      <p className="mt-1 text-sm text-muted">
                        {order.items
                          .map(
                            (item) =>
                              `${item.quantity}× ${item.productName}`,
                          )
                          .join(' · ')}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {new Date(order.createdAt).toLocaleString('es-MX')}
                      </p>
                    </div>
                    <strong className="text-xl text-primary">
                      ${order.total.toFixed(2)}
                    </strong>
                    <div className="flex flex-wrap gap-2">
                      {nextStatus[order.status] ? (
                        <button
                          className="primary-button !min-h-10 !px-4"
                          disabled={workingId === order.id}
                          onClick={() => void advance(order)}
                          type="button"
                        >
                          {nextLabels[order.status]}
                        </button>
                      ) : null}
                      {canCancel ? (
                        <button
                          className="ghost-button !min-h-10 !px-4 text-danger"
                          disabled={workingId === order.id}
                          onClick={() => void cancel(order)}
                          type="button"
                        >
                          Cancelar
                        </button>
                      ) : null}
                      <button
                        className="icon-button border border-line"
                        onClick={() =>
                          setExpanded(isExpanded ? null : order.id)
                        }
                        type="button"
                      >
                        <Icon
                          name={isExpanded ? 'expand_less' : 'expand_more'}
                        />
                      </button>
                    </div>
                  </div>
                  {isExpanded ? (
                    <div className="grid gap-6 border-t border-line bg-panel/35 p-5 lg:grid-cols-2">
                      <div>
                        <h3 className="font-bold text-primary">
                          Entrega y productos
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-muted">
                          {order.deliveryAddress}
                        </p>
                        <div className="mt-4 space-y-2">
                          {order.items.map((item) => (
                            <div
                              className="flex justify-between text-sm"
                              key={item.id}
                            >
                              <span>
                                {item.quantity}× {item.productName}
                              </span>
                              <strong>
                                ${item.totalPrice.toFixed(2)}
                              </strong>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-primary">
                          Historial del pedido
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
                                  {new Date(
                                    history.createdAt,
                                  ).toLocaleString('es-MX')}
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
                  ) : null}
                </article>
              )
            })}
          </section>
        )}
      </main>
    </div>
  )
}
