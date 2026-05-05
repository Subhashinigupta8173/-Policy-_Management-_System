export const formatCurrency = (n) =>
  n != null
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
    : '—'

export const formatDate = (iso) =>
  iso
    ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(iso))
    : '—'

export const formatDateTime = (iso) =>
  iso
    ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
    : '—'
