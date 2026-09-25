export function paginate<T>(items: T[], currentPage: number, pageSize: number) {
  return items.slice((currentPage - 1) * pageSize, currentPage * pageSize)
}

export function getPaginationView(requestedPage: number, pageSize: number, totalItems: number) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages)
  return { currentPage, totalPages, rowNumberOffset: (currentPage - 1) * pageSize }
}
