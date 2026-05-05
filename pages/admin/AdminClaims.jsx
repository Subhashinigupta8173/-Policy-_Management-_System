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
import { formatDate } from '../../utils/formatters'

const VALID_TRANSITIONS = {
  SUBMITTED:    ['UNDER_REVIEW'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED'],
  APPROVED:     ['DISBURSED'],
  REJECTED:     [],
  DISBURSED:    [],
}

export default function AdminClaims() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState(null)
  const [targetStatus, setTargetStatus] = useState('')
  const [settlement, setSettlement] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const { data: claims = [], isLoading } = useQuery({
    queryKey: ['allClaims'],
    queryFn: () => api.get('/claims').then((r) => r.data),
  })

  const filtered = useMemo(() => {
    let list = claims
    if (filter !== 'ALL') list = list.filter((c) => c.status === filter)
    if (search) list = list.filter((c) =>
      (c.claimNumber ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (c.customerName ?? '').toLowerCase().includes(search.toLowerCase())
    )
    return list
  }, [claims, filter, search])

  const { paginatedData, currentPage, totalPages, goTo } = usePagination(filtered)

  const statusMutation = useMutation({
    mutationFn: ({ id, status, amount }) =>
      api.put(`/claims/${id}/status`, { targetStatus: status, settlementAmount: amount || undefined }),
    onSuccess: () => {
      toast.success('Status updated!')
      qc.invalidateQueries({ queryKey: ['allClaims'] })
      qc.invalidateQueries({ queryKey: ['adminDashboard'] })
      setSelected(null)
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Update failed'),
  })

  const openModal = (claim) => {
    setSelected(claim)
    setTargetStatus('')
    setSettlement('')
  }

  const validTargets = selected ? VALID_TRANSITIONS[selected.status] ?? [] : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">All Claims</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input className="input-field pl-9" placeholder="Search claim # or customer…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-44" value={filter} onChange={(e) => setFilter(e.target.value)}>
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DISBURSED'].map((s) => (
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
                  {['Claim #', 'Policy #', 'Customer', 'Incident Date', 'Filed On', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedData.map((c) => (
                  <tr key={c.id} className={`hover:bg-gray-50 ${
                    c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW' ? 'bg-amber-50/30' : ''
                  }`}>
                    <td className="px-4 py-3 font-mono text-xs">{c.claimNumber}</td>
                    <td className="px-4 py-3 font-mono text-xs">{c.policyNumber ?? '—'}</td>
                    <td className="px-4 py-3 font-medium">{c.customerName}</td>
                    <td className="px-4 py-3">{formatDate(c.incidentDate)}</td>
                    <td className="px-4 py-3">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3">
                      <button onClick={() => openModal(c)} className="text-brand-600 hover:text-brand-800">
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

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Claim Details" size="xl">
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Claim #', selected.claimNumber],
                ['Status', <StatusBadge status={selected.status} />],
                ['Policy #', selected.policyNumber ?? '—'],
                ['Customer', selected.customerName],
                ['Incident Date', formatDate(selected.incidentDate)],
                ['Filed On', formatDate(selected.createdAt)],
                ['Adjuster', selected.adjusterName ?? 'Unassigned'],
                ['Settlement', selected.settlementAmount ? `₹${Number(selected.settlementAmount).toLocaleString('en-IN')}` : '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-gray-500 text-xs">{label}</p>
                  <p className="font-medium mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Description</p>
              <p className="text-sm bg-gray-50 p-3 rounded-lg">{selected.description}</p>
            </div>

            {validTargets.length > 0 && (
              <div className="border-t pt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                  <select className="input-field" value={targetStatus} onChange={(e) => setTargetStatus(e.target.value)}>
                    <option value="">Select new status</option>
                    {validTargets.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {(targetStatus === 'APPROVED' || targetStatus === 'DISBURSED') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Settlement Amount (₹)</label>
                    <input type="number" className="input-field" value={settlement}
                      onChange={(e) => setSettlement(e.target.value)} min="0" />
                  </div>
                )}
                <button
                  disabled={!targetStatus || statusMutation.isPending}
                  onClick={() => statusMutation.mutate({ id: selected.id, status: targetStatus, amount: settlement ? Number(settlement) : null })}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {statusMutation.isPending ? <Spinner size="sm" /> : null} Update Status
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
