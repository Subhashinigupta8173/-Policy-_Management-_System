import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Shield, Clock, Calendar, Download, Plus } from 'lucide-react'
import api from '../../api/axiosInstance'
import StatusBadge from '../../components/ui/StatusBadge'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import { usePagination } from '../../hooks/usePagination'
import { formatCurrency, formatDate } from '../../utils/formatters'

export default function Dashboard() {
  const navigate = useNavigate()
  const [downloadingIds, setDownloadingIds] = useState(new Set())

  const { data: dash, isLoading } = useQuery({
    queryKey: ['customerDashboard'],
    queryFn: () => api.get('/dashboard/customer').then((r) => r.data),
  })
  const { data: policies = [], isLoading: policiesLoading } = useQuery({
    queryKey: ['myPolicies'],
    queryFn: () => api.get('/policies/my').then((r) => r.data),
  })

  const { paginatedData, currentPage, totalPages, goTo } = usePagination(policies)

  const downloadCert = async (policyId, policyNumber) => {
    setDownloadingIds((prev) => new Set(prev).add(policyId))
    try {
      const res = await api.get(`/policies/${policyId}/certificate`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url; a.download = `Certificate-${policyNumber}.pdf`
      document.body.appendChild(a); a.click(); a.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Certificate downloaded!')
    } catch {
      toast.error('Failed to download certificate')
    } finally {
      setDownloadingIds((prev) => { const n = new Set(prev); n.delete(policyId); return n })
    }
  }

  const stats = [
    { icon: Shield,   label: 'Active Policies',    value: dash?.activePolicies  ?? '—', color: 'border-green-500' },
    { icon: Clock,    label: 'Pending Claims',      value: dash?.pendingClaims   ?? '—', color: 'border-amber-500' },
    { icon: Calendar, label: 'Renewals in 30 Days', value: dash?.upcomingRenewals ?? '—', color: 'border-blue-500' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <button onClick={() => navigate('/products')} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Policy
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className={`card p-5 flex items-center gap-4 border-l-4 ${color}`}>
            <Icon className="h-8 w-8 text-gray-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{isLoading ? '…' : value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Policies table */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">My Policies</h2>
        </div>
        <div className="overflow-x-auto">
          {policiesLoading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : policies.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No policies yet. <a href="/products" className="text-brand-600 hover:underline">Browse products</a></p>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Policy #', 'Product', 'Coverage', 'Premium/yr', 'Start', 'End', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedData.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{p.policyNumber ?? '—'}</td>
                      <td className="px-4 py-3 font-medium">{p.productName}</td>
                      <td className="px-4 py-3">{formatCurrency(p.coverageAmount)}</td>
                      <td className="px-4 py-3">{formatCurrency(p.premiumAmount)}</td>
                      <td className="px-4 py-3">{formatDate(p.startDate)}</td>
                      <td className="px-4 py-3">{formatDate(p.endDate)}</td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {p.status === 'ACTIVE' && (
                            <>
                              <button
                                onClick={() => downloadCert(p.id, p.policyNumber)}
                                disabled={downloadingIds.has(p.id)}
                                className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 disabled:opacity-50"
                              >
                                {downloadingIds.has(p.id) ? <Spinner size="sm" /> : <Download className="h-3.5 w-3.5" />}
                                Cert
                              </button>
                              <button
                                onClick={() => navigate(`/claims/new/${p.id}`)}
                                className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800"
                              >
                                <Plus className="h-3.5 w-3.5" /> Claim
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pb-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goTo} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
