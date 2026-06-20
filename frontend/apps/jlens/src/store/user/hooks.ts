import { useQuery } from '@tanstack/react-query'
import { getUserAccess } from './action'

export const useUserAccess = () =>
  useQuery({
    queryKey: ['user-access'],
    queryFn: getUserAccess,
    staleTime: 120000, // 2 minutes
  })
