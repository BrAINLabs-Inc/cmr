import { useEffect } from 'react'

// Keeps `page` in range when the result set shrinks out from under it (an
// admin action changes/removes the last row on the current page, or a
// filter narrows the results) — without this, the page number stays past
// the new last page and the table renders an empty "no results" list even
// though earlier pages still have matches.
export function usePageClamp(page: number, setPage: (page: number) => void, total: number | undefined, pageSize: number) {
  useEffect(() => {
    if (total === undefined) return
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    if (page > totalPages) setPage(totalPages)
  }, [page, setPage, total, pageSize])
}
