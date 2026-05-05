import { useForm } from 'react-hook-form'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { FileText, Upload } from 'lucide-react'
import api from '../../api/axiosInstance'
import Spinner from '../../components/ui/Spinner'
import { formatCurrency, formatDate } from '../../utils/formatters'

export default function ClaimNew() {
  const { policyId } = useParams()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { incidentDate: new Date().toISOString().split('T')[0] }
  })

  const { data: policies } = useQuery({
    queryKey: ['myPolicies'],
    queryFn: () => api.get('/policies/my').then((r) => r.data),
  })
  const policy = policies?.find((p) => String(p.id) === policyId)

  const onSubmit = async (data) => {
    const formData = new FormData()
    const payload = {
      policyId: Number(policyId),
      incidentDate: data.incidentDate,
      description: data.description,
    }
    formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
    if (data.proofDocument?.[0]) formData.append('proofDoc', data.proofDocument[0])
    try {
      await api.post('/claims', formData)
      toast.success('Claim submitted successfully!')
      navigate('/claims')
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Failed to submit claim')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <FileText className="h-8 w-8 text-brand-600" /> File a Claim
      </h1>

      {policy && (
        <div className="card p-4 mb-6 bg-blue-50 border border-blue-100">
          <p className="text-sm text-blue-800 font-medium">{policy.productName}</p>
          <p className="text-xs text-blue-600">Policy: {policy.policyNumber} · Coverage: {formatCurrency(policy.coverageAmount)}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Incident Date</label>
            <input type="date" className="input-field"
              max={new Date().toISOString().split('T')[0]}
              {...register('incidentDate', { required: 'Required' })} />
            {errors.incidentDate && <p className="text-red-500 text-xs mt-1">{errors.incidentDate.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea rows="5" className="input-field resize-none"
            placeholder="Describe what happened in detail (minimum 20 characters)..."
            {...register('description', { required: 'Required', minLength: { value: 20, message: 'Min 20 characters' } })} />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Proof Document</label>
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
            <Upload className="h-7 w-7 text-gray-400 mb-1" />
            <span className="text-sm text-gray-500">Upload proof (photo, report, invoice)</span>
            <span className="text-xs text-gray-400">PDF, JPG, PNG up to 10MB</span>
            <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" {...register('proofDocument')} />
          </label>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {isSubmitting ? <Spinner size="sm" /> : null}
            Submit Claim
          </button>
        </div>
      </form>
    </div>
  )
}
