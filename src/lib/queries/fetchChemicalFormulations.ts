import { FormulationPaginatedResultSchema } from "@/app/database/[chemId]/type";

export const fetchChemicalFormulations = async (chemicalId: string, page: number, limit: number) => {
  const apiUrl = `/api/chemicals/formulations/${chemicalId}?page=${page}&limit=${limit}`;

  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error("Failed to fetch chemical formulations");

  const data = await response.json();
  return FormulationPaginatedResultSchema.parse(data);
};