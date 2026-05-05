import { useState, useMemo } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Search, Eye } from 'lucide-react'
import api from '../../api/axiosInstance'
import StatusBadge from '../../components/ui/StatusBadge'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import { usePagination } from '../../hooks/usePagination'
import { formatCurrency, formatDate } from '../../utils/formatters'

export default function AdminPolicies() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const { data: policies = [], isLoading } = useQuery({
    queryKey: ['allPolicies'],
    queryFn: () => api.get('/policies').then((r) => r.data),
  })

  const filtered = useMemo(() => {
    let list = policies
    if (filter !== 'ALL') list = list.filter((p) => p.status === filter)
    if (search) list = list.filter((p) =>
      (p.policyNumber ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (p.customerName ?? '').toLowerCase().includes(search.toLowerCase())
    )
    return list
  }, [policies, filter, search])

  const { paginatedData, currentPage, totalPages, goTo } = usePagination(filtered)

  const approveMutation = useMutation({
    mutationFn: (id) => api.put(`/policies/${id}/approve`),
    onSuccess: () => {
      toast.success('Policy approved!')
      qc.invalidateQueries({ queryKey: ['allPolicies'] })
      qc.invalidateQueries({ queryKey: ['adminDashboard'] })
      setSelected(null)
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Approval failed'),
  })

  const rejectMutation = useMutation({
    mutationFn: (id) => api.put(`/policies/${id}/reject`),
    onSuccess: () => {
      toast.success('Policy rejected.')
      qc.invalidateQueries({ queryKey: ['allPolicies'] })
      qc.invalidateQueries({ queryKey: ['adminDashboard'] })
      setSelected(null)
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Reject failed'),
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">All Policies</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            className="input-field pl-9"
            placeholder="Search policy # or customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input-field w-40" value={filter} onChange={(e) => setFilter(e.target.value)}>
          {['ALL', 'PENDING', 'ACTIVE', 'REJECTED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Policy #', 'Customer', 'Product', 'Coverage', 'Premium/yr', 'Applied On', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedData.map((p) => (
                  <tr key={p.id} className={`hover:bg-gray-50 ${p.status === 'PENDING' ? 'bg-amber-50/50' : ''}`}>
                    <td className="px-4 py-3 font-mono text-xs">{p.policyNumber ?? 'Pending'}</td>
                    <td className="px-4 py-3"><div className="font-medium">{p.customerName}</div><div className="text-gray-400 text-xs">{p.customerEmail}</div></td>
                    <td className="px-4 py-3">{p.productName}</td>
                    <td className="px-4 py-3">{formatCurrency(p.coverageAmount)}</td>
                    <td className="px-4 py-3">{formatCurrency(p.premiumAmount)}</td>
                    <td className="px-4 py-3">{formatDate(p.createdAt)}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(p)} className="text-brand-600 hover:text-brand-800">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="pb-4">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goTo} />
        </div>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Policy Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Policy #', selected.policyNumber ?? 'Not assigned'],
                ['Status', <StatusBadge status={selected.status} />],
                ['Customer', selected.customerName],
                ['Email', selected.customerEmail],
                ['Product', selected.productName],
                ['Type', selected.productType],
                ['Coverage', formatCurrency(selected.coverageAmount)],
                ['Annual Premium', formatCurrency(selected.premiumAmount)],
                ['Start Date', formatDate(selected.startDate)],
                ['End Date', formatDate(selected.endDate)],
                ['Applied On', formatDate(selected.createdAt)],
                ['KYC Doc', selected.kycDocPath ? '✓ Uploaded' : '— Not uploaded'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-gray-500 text-xs">{label}</p>
                  <p className="font-medium mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {selected.status === 'PENDING' && (
              <div className="flex gap-3 pt-4 border-t">
                <button
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  onClick={() => approveMutation.mutate(selected.id)}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {approveMutation.isPending ? <Spinner size="sm" /> : null} Approve
                </button>
                <button
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  onClick={() => { if (window.confirm('Reject this policy?')) rejectMutation.mutate(selected.id) }}
                  className="btn-danger flex-1 flex items-center justify-center gap-2"
                >
                  {rejectMutation.isPending ? <Spinner size="sm" /> : null} Reject
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
