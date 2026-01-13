import { fetchChemicalFormulations } from "@/lib/queries/fetchChemicalFormulations"
import { useQuery } from "@tanstack/react-query"

export const useChemicalFormulations = (chemicalId: string, page: number, limit: number) => {
  return useQuery({
    queryKey: ["chemical_formulations", chemicalId, page, limit],
    queryFn: () => fetchChemicalFormulations(chemicalId, page, limit),
    enabled: !!chemicalId && !!page && !!limit,
    staleTime: 3600000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })
}