import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart2, TrendingUp, Shield, FileText } from 'lucide-react'
import api from '../../api/axiosInstance'
import Spinner from '../../components/ui/Spinner'
import { formatCurrency } from '../../utils/formatters'

function BarChart({ data, title, colorClass }) {
  const [ready, setReady] = useState(false)
  const maxVal = Math.max(...data.map((d) => d.value), 1)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="card p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">{title}</h3>
      <div className="flex items-end gap-3 h-36">
        {data.map(({ label, value }) => {
          const pct = (value / maxVal) * 100
          return (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-semibold text-gray-700">{value}</span>
              <div
                className={`w-full rounded-t-md ${colorClass} transition-all duration-700`}
                style={{ height: ready ? `${pct}%` : '0%' }}
              />
              <span className="text-xs text-gray-500 text-center leading-tight">
                {label.replace('_', ' ')}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { data: dash, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => api.get('/dashboard/admin').then((r) => r.data),
  })

  if (isLoading) return <div className="flex justify-center pt-20"><Spinner /></div>

  const stats = [
    { icon: Shield,     label: 'Total Policies',    value: dash?.totalPolicies  ?? 0, sub: `${dash?.pendingPolicies ?? 0} pending`, color: 'bg-brand-100 text-brand-700' },
    { icon: TrendingUp, label: 'Total Revenue',      value: formatCurrency(dash?.totalRevenue ?? 0), color: 'bg-green-100 text-green-700' },
    { icon: FileText,   label: 'Total Claims',       value: dash?.totalClaims   ?? 0, sub: `${dash?.submittedClaims ?? 0} submitted`, color: 'bg-amber-100 text-amber-700' },
    { icon: BarChart2,  label: 'Under Review',       value: (dash?.underReviewClaims ?? 0), color: 'bg-orange-100 text-orange-700' },
  ]

  const policyData = Object.entries(dash?.policyStatusBreakdown ?? {}).map(([label, value]) => ({ label, value }))
  const claimData  = Object.entries(dash?.claimStatusBreakdown  ?? {}).map(([label, value]) => ({ label, value }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Overview</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="card p-5">
            <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BarChart data={policyData} title="Policies by Status" colorClass="bg-brand-500" />
        <BarChart data={claimData}  title="Claims by Status"   colorClass="bg-teal-500" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a href="/admin/policies" className="card p-5 hover:shadow-md transition-shadow group">
          <h3 className="font-semibold text-gray-900 group-hover:text-brand-600">Review Policies →</h3>
          <p className="text-sm text-gray-500 mt-1">{dash?.pendingPolicies ?? 0} applications awaiting approval</p>
        </a>
        <a href="/admin/claims" className="card p-5 hover:shadow-md transition-shadow group">
          <h3 className="font-semibold text-gray-900 group-hover:text-brand-600">Process Claims →</h3>
          <p className="text-sm text-gray-500 mt-1">{(dash?.submittedClaims ?? 0) + (dash?.underReviewClaims ?? 0)} claims need attention</p>
        </a>
      </div>
    </div>
  )
}
