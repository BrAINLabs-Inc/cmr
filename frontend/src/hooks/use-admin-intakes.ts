import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Intake } from '@/lib/types'

export const ADMIN_INTAKES_QUERY_KEY = ['intakes']

// Shared across every admin page that needs the intake list (Intakes,
// Applications, Course Settings, Dashboard) so they hit one cached query
// instead of each re-fetching the same small table.
export function useAdminIntakes() {
  return useQuery({
    queryKey: ADMIN_INTAKES_QUERY_KEY,
    queryFn: () => api.get<{ intakes: Intake[] }>('/admin/intakes'),
  })
}
