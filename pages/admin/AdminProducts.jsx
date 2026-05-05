import { useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { Plus, Edit2, X } from 'lucide-react'
import api from '../../api/axiosInstance'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import StatusBadge from '../../components/ui/StatusBadge'
import { usePagination } from '../../hooks/usePagination'
import { formatCurrency } from '../../utils/formatters'

export default function AdminProducts() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/products').then((r) => r.data),
  })
  const { paginatedData, currentPage, totalPages, goTo } = usePagination(products)

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm()

  const saveMutation = useMutation({
    mutationFn: (data) =>
      editing
        ? api.put(`/products/${editing.id}`, data)
        : api.post('/products', data),
    onSuccess: () => {
      toast.success(editing ? 'Product updated!' : 'Product created!')
      qc.invalidateQueries({ queryKey: ['products'] })
      reset(); setEditing(null); setShowForm(false)
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Save failed'),
  })

  const startEdit = (product) => {
    setEditing(product)
    setShowForm(true)
    Object.entries(product).forEach(([k, v]) => setValue(k, v))
  }

  const onSubmit = (data) => saveMutation.mutate({ ...data, basePremium: Number(data.basePremium), coverageAmount: Number(data.coverageAmount), minAge: Number(data.minAge), maxAge: Number(data.maxAge), active: data.active === 'true' || data.active === true })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); reset() }} className="btn-primary flex items-center gap-2">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      <div className={`grid grid-cols-1 ${showForm ? 'lg:grid-cols-3' : ''} gap-8`}>
        {/* Table */}
        <div className={showForm ? 'lg:col-span-2' : ''}>
          <div className="card">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex justify-center py-12"><Spinner /></div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Name', 'Type', 'Base Premium', 'Coverage', 'Age Range', 'Status', ''].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginatedData.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{p.name}</td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">{p.type}</span></td>
                        <td className="px-4 py-3">{formatCurrency(p.basePremium)}</td>
                        <td className="px-4 py-3">{formatCurrency(p.coverageAmount)}</td>
                        <td className="px-4 py-3">{p.minAge}–{p.maxAge}</td>
                        <td className="px-4 py-3">{p.active ? <span className="text-green-600 text-xs font-medium">Active</span> : <span className="text-gray-400 text-xs">Inactive</span>}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => startEdit(p)} className="text-brand-600 hover:text-brand-800">
                            <Edit2 className="h-4 w-4" />
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
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="card p-6 h-fit">
            <h2 className="font-semibold text-gray-900 mb-4">{editing ? 'Edit Product' : 'New Product'}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                <input className="input-field" {...register('name', { required: true })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                <select className="input-field" {...register('type', { required: true })}>
                  <option value="">Select</option>
                  <option value="LIFE">LIFE</option>
                  <option value="HEALTH">HEALTH</option>
                  <option value="VEHICLE">VEHICLE</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Base Premium (₹)</label>
                  <input type="number" className="input-field" {...register('basePremium', { required: true })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Coverage (₹)</label>
                  <input type="number" className="input-field" {...register('coverageAmount', { required: true })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Min Age</label>
                  <input type="number" className="input-field" {...register('minAge', { required: true })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Max Age</label>
                  <input type="number" className="input-field" {...register('maxAge', { required: true })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea rows="3" className="input-field resize-none" {...register('description')} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Active</label>
                <select className="input-field" {...register('active')}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <button type="submit" disabled={isSubmitting || saveMutation.isPending} className="btn-primary w-full flex items-center justify-center gap-2">
                {saveMutation.isPending ? <Spinner size="sm" /> : null}
                {editing ? 'Update' : 'Create'} Product
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
