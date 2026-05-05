import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Inbox, FileText } from 'lucide-react'
import api from '../../api/axiosInstance'
import StatusBadge from '../../components/ui/StatusBadge'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import { usePagination } from '../../hooks/usePagination'
import { formatDate } from '../../utils/formatters'

export default function Claims() {
  const navigate = useNavigate()
  const { data: claims = [], isLoading, error } = useQuery({
    queryKey: ['myClaims'],
    queryFn: () => api.get('/claims/my').then((r) => r.data),
  })
  const { paginatedData, currentPage, totalPages, goTo } = usePagination(claims)

  if (isLoading) return <div className="flex justify-center pt-20"><Spinner /></div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="h-8 w-8 text-brand-600" /> My Claims
        </h1>
      </div>

      {claims.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Inbox className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">No claims filed yet</p>
          <a href="/dashboard" className="text-brand-600 hover:underline text-sm">Back to Dashboard</a>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Claim #', 'Policy #', 'Incident Date', 'Filed On', 'Status', 'Settlement'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedData.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{c.claimNumber}</td>
                    <td className="px-4 py-3 font-mono text-xs">{c.policyNumber ?? '—'}</td>
                    <td className="px-4 py-3">{formatDate(c.incidentDate)}</td>
                    <td className="px-4 py-3">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3">
                      {c.settlementAmount ? (
                        <span className="text-green-700 font-medium">₹{Number(c.settlementAmount).toLocaleString('en-IN')}</span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pb-4">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goTo} />
          </div>
        </div>
      )}
    </div>
  )
}
