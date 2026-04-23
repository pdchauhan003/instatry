import { useQuery } from '@tanstack/react-query'
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('https://dummyjson.com/products')
      const data = await res.json()
      return data.products
    }
  })
}
