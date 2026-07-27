import { useState } from 'react'
import type { Product } from '../../data/mockData'
import { Icon } from './Icon'

type ProductModalProps = {
  product: Product
  onClose: () => void
  onConfirm: (quantity: number) => void
}

export function ProductModal({ product, onClose, onConfirm }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1)

  return (
    <div
      aria-label={`Detalle de ${product.name}`}
      aria-modal="true"
      className="fixed inset-0 z-[70] flex items-end justify-center bg-primary/45 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      role="dialog"
    >
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]">
        <div className="relative aspect-[16/8] overflow-hidden bg-panel">
          <img alt={product.name} className="h-full w-full object-cover" src={product.image} />
          <button
            aria-label="Cerrar"
            className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/90 text-primary shadow-md"
            onClick={onClose}
            type="button"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold text-primary">{product.name}</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{product.description}</p>
            </div>
            <strong className="shrink-0 text-lg text-primary">${product.price} MXN</strong>
          </div>
          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-bold text-primary">Instrucciones opcionales</span>
            <textarea
              className="field min-h-24 resize-none"
              placeholder="Ej. Sin cebolla, salsa aparte…"
            />
          </label>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-fit items-center gap-4 rounded-full border border-line p-1">
              <button
                aria-label="Disminuir cantidad"
                className="icon-button !size-10"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                type="button"
              >
                <Icon name="remove" />
              </button>
              <strong className="min-w-5 text-center">{quantity}</strong>
              <button
                aria-label="Aumentar cantidad"
                className="icon-button !size-10"
                onClick={() => setQuantity((value) => value + 1)}
                type="button"
              >
                <Icon name="add" />
              </button>
            </div>
            <button className="primary-button min-w-60" onClick={() => onConfirm(quantity)} type="button">
              Agregar · ${product.price * quantity} MXN
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
