import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Calculator as CalcIcon, ArrowRight, RefreshCw } from 'lucide-react'
import api from '../../api/axiosInstance'
import Spinner from '../../components/ui/Spinner'
import { formatCurrency } from '../../utils/formatters'

function CountUp({ target }) {
  const [displayed, setDisplayed] = useState(0)
  useEffect(() => {
    if (!target) return
    const duration = 1000
    const start = performance.now()
    const step = (ts) => {
      const p = Math.min((ts - start) / duration, 1)
      setDisplayed(Math.floor(target * Math.sqrt(p)))
      if (p < 1) requestAnimationFrame(step)
      else setDisplayed(target)
    }
    requestAnimationFrame(step)
  }, [target])
  return <>{formatCurrency(displayed)}</>
}

export default function Calculator() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm()
  const [result, setResult] = useState(null)
  const [showResult, setShowResult] = useState(false)

  const productId = watch('productId')
  const age = watch('age')
  const coverageAmount = watch('coverageAmount')
  const durationYears = watch('durationYears')

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/products').then((r) => r.data),
  })

  useEffect(() => {
    const pid = searchParams.get('product')
    if (pid) setValue('productId', pid)
  }, [searchParams, setValue])

  const selectedProduct = products?.find((p) => String(p.id) === String(productId))

  const onSubmit = async (data) => {
    setShowResult(false)
    setResult(null)
    try {
      const res = await api.post('/calculator/estimate', {
        productId: Number(data.productId),
        age: Number(data.age),
        coverageAmount: Number(data.coverageAmount),
        durationYears: Number(data.durationYears),
        vehicleAge: data.vehicleAge ? Number(data.vehicleAge) : undefined,
      })
      setResult(res.data)
      setTimeout(() => setShowResult(true), 80)
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Estimation failed')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <CalcIcon className="h-8 w-8 text-brand-600" /> Premium Calculator
        </h1>
        <p className="text-gray-500 mt-1">Get an instant premium estimate</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Product</label>
              <select className="input-field" {...register('productId', { required: 'Select a product' })}>
                <option value="">Select product</option>
                {products?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {errors.productId && <p className="text-red-500 text-xs mt-1">{errors.productId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Age</label>
                <input type="number" className="input-field" min="1" max="120"
                  {...register('age', { required: 'Required', min: 1, max: 120 })} />
                {errors.age && <p className="text-red-500 text-xs mt-1">Enter valid age</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (years)</label>
                <input type="number" className="input-field" min="1" max="30"
                  {...register('durationYears', { required: 'Required', min: 1 })} />
                {errors.durationYears && <p className="text-red-500 text-xs mt-1">Enter duration</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Amount (₹)</label>
              <input type="number" className="input-field" min="10000"
                {...register('coverageAmount', { required: 'Required', min: 10000 })} />
              {errors.coverageAmount && <p className="text-red-500 text-xs mt-1">Enter coverage amount</p>}
            </div>

            {selectedProduct?.type === 'VEHICLE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Age (years)</label>
                <input type="number" className="input-field" min="0"
                  {...register('vehicleAge', { min: 0 })} />
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2">
              {isSubmitting ? <Spinner size="sm" /> : <CalcIcon className="h-4 w-4" />}
              Calculate Premium
            </button>
          </form>
        </div>

        {/* Result */}
        <div>
          {result ? (
            <div className={`transition-all duration-700 ease-out transform ${
              showResult ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
            }`}>
              <div className="card p-6 bg-gradient-to-br from-brand-700 to-brand-900 text-white">
                <p className="text-brand-200 text-sm font-medium uppercase tracking-wide mb-1">Estimated Annual Premium</p>
                <p className="text-5xl font-bold mb-4">
                  <CountUp target={result.estimatedPremium} />
                </p>
                <div className="space-y-2 mb-6 text-sm text-brand-200">
                  <div className="flex justify-between">
                    <span>Monthly equivalent</span>
                    <span className="text-white font-medium">{formatCurrency(result.estimatedPremium / 12)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total ({durationYears} year{durationYears > 1 ? 's' : ''})</span>
                    <span className="text-white font-medium">{formatCurrency(result.totalPremium)}</span>
                  </div>
                </div>
                {result.breakdown && (
                  <p className="text-xs text-brand-300 mb-6 font-mono bg-brand-900/50 p-2 rounded">{result.breakdown}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/apply/${productId}?premium=${result.estimatedPremium}&coverage=${coverageAmount}&duration=${durationYears}`)}
                    className="flex-1 bg-white text-brand-700 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-brand-50 transition-colors"
                  >
                    Proceed to Apply <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => { setResult(null); setShowResult(false) }}
                    className="p-2 bg-brand-800 rounded-lg hover:bg-brand-700 transition-colors"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-6 flex flex-col items-center justify-center h-64 text-center text-gray-400">
              <CalcIcon className="h-12 w-12 mb-3 opacity-30" />
              <p>Fill in the form to get your premium estimate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
