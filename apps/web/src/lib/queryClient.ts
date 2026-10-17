import { QueryClient } from '@tanstack/react-query'

export const crearQueryClient = () => new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false } } })
