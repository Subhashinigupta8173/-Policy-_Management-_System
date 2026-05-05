import { STATUS_BADGE } from '../../utils/constants'

export default function StatusBadge({ status }) {
  const cls = STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status?.replace('_', ' ')}
    </span>
  )
}
