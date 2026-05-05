import { useState, useEffect } from 'react'
import { PAGE_SIZE } from '../utils/constants'

export function usePagination(data = [], pageSize = PAGE_SIZE) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize))

  useEffect(() => {
    setCurrentPage(1)
  }, [data.length])

  const paginatedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const goTo = (page) => setCurrentPage(Math.min(Math.max(1, page), totalPages))

  return { paginatedData, currentPage, totalPages, goTo }
}
