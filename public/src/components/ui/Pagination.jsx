import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const start = Math.max(1, currentPage - 2)
  const end   = Math.min(totalPages, currentPage + 2)
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-1.5 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {start > 1 && <span className="px-2 text-gray-400">…</span>}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
            p === currentPage
              ? 'bg-brand-600 text-white border-brand-600'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          {p}
        </button>
      ))}
      {end < totalPages && <span className="px-2 text-gray-400">…</span>}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-1.5 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
