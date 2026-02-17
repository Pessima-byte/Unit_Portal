export const ITEMS_PER_PAGE = 10

export function getPaginationParams(searchParams: { page?: string }) {
  const page = parseInt(searchParams.page || "1", 10)
  const skip = (page - 1) * ITEMS_PER_PAGE
  const take = ITEMS_PER_PAGE

  return { page, skip, take }
}

export function calculateTotalPages(totalItems: number, itemsPerPage: number = ITEMS_PER_PAGE) {
  return Math.ceil(totalItems / itemsPerPage)
}



