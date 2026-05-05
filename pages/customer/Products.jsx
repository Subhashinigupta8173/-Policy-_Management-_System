import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Shield, Heart, Car, CheckCircle, ArrowRight } from 'lucide-react'
import api from '../../api/axiosInstance'
import Spinner from '../../components/ui/Spinner'
import { formatCurrency } from '../../utils/formatters'

const ICONS = { LIFE: Shield, HEALTH: Heart, VEHICLE: Car }
const COLORS = {
  LIFE:    'from-blue-500 to-blue-700',
  HEALTH:  'from-green-500 to-green-700',
  VEHICLE: 'from-indigo-500 to-indigo-700',
}

export default function Products() {
  const navigate = useNavigate()
  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/products').then((r) => r.data),
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm h-80 animate-pulse">
              <div className="h-24 bg-gray-200 rounded-t-xl" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded" />
                <div className="h-4 bg-gray-100 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-red-500 mb-4">Failed to load products</p>
        <button className="btn-primary" onClick={() => refetch()}>Retry</button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Insurance Products</h1>
        <p className="text-gray-500 mt-1">Choose the right coverage for your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products?.map((product) => {
          const Icon = ICONS[product.type] ?? Shield
          const gradient = COLORS[product.type] ?? 'from-gray-500 to-gray-700'
          return (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
              <div className={`bg-gradient-to-br ${gradient} p-6 text-white`}>
                <Icon className="h-10 w-10 mb-3 opacity-90" />
                <h2 className="text-xl font-bold">{product.name}</h2>
                <p className="text-sm opacity-80 mt-1">{product.type} Insurance</p>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-gray-600 text-sm mb-4 flex-1">{product.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    Coverage: {formatCurrency(product.coverageAmount)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    Age: {product.minAge}–{product.maxAge} years
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    Base premium from {formatCurrency(product.basePremium)}/yr
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/calculator?product=${product.id}`)}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  Get Quote <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
