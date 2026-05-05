import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { CheckCircle, Upload, CreditCard, FileText, X } from 'lucide-react'
import api from '../../api/axiosInstance'
import Spinner from '../../components/ui/Spinner'
import { formatCurrency } from '../../utils/formatters'

export default function Apply() {
  const { productId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [paymentDone, setPaymentDone] = useState(false)
  const [kycPreview, setKycPreview] = useState(null)
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { startDate: new Date().toISOString().split('T')[0] }
  })

  const premium  = searchParams.get('premium')
  const coverage = searchParams.get('coverage')
  const duration = searchParams.get('duration')

  const { data: product } = useQuery({
    queryKey: ['product', productId],
    queryFn:  () => api.get(`/products/${productId}`).then((r) => r.data),
    enabled:  !!productId,
  })

  const onSubmit = async (data) => {
    if (!paymentDone) { toast.error('Please complete the mock payment first'); return }
    const formData = new FormData()
    const payload = {
      productId: Number(productId),
      age: Number(data.age),
      coverageAmount: Number(coverage || data.coverageAmount),
      durationYears: Number(duration || data.durationYears),
      startDate: data.startDate,
      nomineeName: data.nomineeName,
      nomineeRelationship: data.nomineeRelationship,
    }
    formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
    if (data.kycDocument?.[0]) formData.append('kycDoc', data.kycDocument[0])
    try {
      await api.post('/policies/apply', formData)
      toast.success('Application submitted! Awaiting review.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Application failed')
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Apply for Policy</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quote summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="font-semibold text-gray-900 mb-4">Quote Summary</h2>
            {product && (
              <div className="space-y-3 text-sm">
                <div><span className="text-gray-500">Product</span><p className="font-medium">{product.name}</p></div>
                <div><span className="text-gray-500">Type</span><p className="font-medium">{product.type}</p></div>
                {coverage && <div><span className="text-gray-500">Coverage</span><p className="font-medium">{formatCurrency(coverage)}</p></div>}
                {duration && <div><span className="text-gray-500">Duration</span><p className="font-medium">{duration} year{duration > 1 ? 's' : ''}</p></div>}
                {premium && (
                  <div className="pt-3 border-t">
                    <span className="text-gray-500">Annual Premium</span>
                    <p className="text-2xl font-bold text-brand-700 mt-1">{formatCurrency(premium)}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Info */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Age</label>
                  <input type="number" className="input-field" {...register('age', { required: true, min: 1, max: 120 })} />
                  {errors.age && <p className="text-red-500 text-xs mt-1">Required</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" className="input-field" {...register('startDate', { required: true })} />
                </div>
                {!coverage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Amount (₹)</label>
                    <input type="number" className="input-field" {...register('coverageAmount', { required: !coverage })} />
                  </div>
                )}
                {!duration && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (years)</label>
                    <input type="number" className="input-field" min="1" {...register('durationYears', { required: !duration })} />
                  </div>
                )}
              </div>
            </div>

            {/* Nominee */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Nominee Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nominee Name</label>
                  <input className="input-field" {...register('nomineeName')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <select className="input-field" {...register('nomineeRelationship')}>
                    <option value="">Select</option>
                    {['Spouse', 'Parent', 'Child', 'Sibling', 'Other'].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* KYC Upload */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">KYC Document</h2>
              {kycPreview ? (
                <div className="relative border-2 border-brand-400 rounded-xl overflow-hidden bg-gray-50">
                  {kycPreview.type === 'image' ? (
                    <img src={kycPreview.url} alt="KYC preview" className="w-full max-h-48 object-contain p-2" />
                  ) : (
                    <div className="flex items-center gap-3 p-4">
                      <FileText className="h-10 w-10 text-brand-500 shrink-0" />
                      <span className="text-sm font-medium text-gray-700 truncate">{kycPreview.name}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => { setKycPreview(null); setValue('kycDocument', null) }}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                  <p className="text-xs text-brand-600 font-medium text-center pb-2">✓ Document ready</p>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Upload Aadhaar / PAN / License</span>
                  <span className="text-xs text-gray-400">PDF, JPG, PNG up to 10MB</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    {...register('kycDocument')}
                    onChange={(e) => {
                      register('kycDocument').onChange(e)
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (file.type.startsWith('image/')) {
                        setKycPreview({ type: 'image', url: URL.createObjectURL(file), name: file.name })
                      } else {
                        setKycPreview({ type: 'pdf', name: file.name })
                      }
                    }}
                  />
                </label>
              )}
            </div>

            {/* Mock Payment */}
            <div className={`card p-6 border-2 ${paymentDone ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Payment
              </h2>
              {paymentDone ? (
                <div className="flex items-center gap-3 text-green-700">
                  <CheckCircle className="h-6 w-6" />
                  <span className="font-medium">Payment of {formatCurrency(premium ?? 0)} confirmed!</span>
                </div>
              ) : (
                <button type="button" onClick={() => setPaymentDone(true)}
                  className="btn-primary bg-green-600 hover:bg-green-700 w-full">
                  Simulate Payment of {formatCurrency(premium ?? 0)}
                </button>
              )}
            </div>

            <button type="submit" disabled={isSubmitting || !paymentDone}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base">
              {isSubmitting ? <Spinner size="sm" /> : null}
              Submit Application
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
