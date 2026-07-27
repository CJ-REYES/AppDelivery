import { useEffect, type ReactNode } from 'react'
import { Icon } from './Icon'

type ModalProps = {
  children: ReactNode
  title: string
  description?: string
  onClose: () => void
  size?: 'md' | 'lg' | 'xl'
}

export function Modal({ children, title, description, onClose, size = 'lg' }: ModalProps) {
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const maxWidth = size === 'md' ? 'max-w-lg' : size === 'xl' ? 'max-w-4xl' : 'max-w-2xl'

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-primary/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose()
      }}
      role="dialog"
    >
      <div className={`my-6 w-full ${maxWidth} rounded-[28px] bg-white p-5 shadow-2xl md:p-7`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-primary md:text-3xl">{title}</h2>
            {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>
          <button aria-label="Cerrar" className="icon-button -mr-2 -mt-2" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}
