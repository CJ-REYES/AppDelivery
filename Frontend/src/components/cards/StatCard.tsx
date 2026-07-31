import { Icon } from '../common/Icon'

type StatCardProps = {
  icon: string
  label: string
  value: string
  detail: string
  tone?: 'orange' | 'green' | 'yellow'
}

const tones = {
  orange: 'bg-accent/10 text-accent',
  green: 'bg-success/10 text-success',
  yellow: 'bg-warning/15 text-[#8a5c00]',
}

export function StatCard({ icon, label, value, detail, tone = 'green' }: StatCardProps) {
  return (
    <article className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-muted">{label}</p>
          <p className="mt-3 font-display text-3xl font-semibold text-primary">{value}</p>
          <p className="mt-2 text-xs text-muted">{detail}</p>
        </div>
        <span className={`grid size-11 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon name={icon} />
        </span>
      </div>
    </article>
  )
}
