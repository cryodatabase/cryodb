import { z } from "zod";

export const FormulationSearchResultSchema = z.object({
  formulation_id: z.string(),
  formulation_label: z.string(),
  paper_id: z.string(),
  paper_title: z.string(),
  paper_doi: z.string().nullable(),
  experiment_label: z.string().nullable(),
  component_count: z.string(),
  component_signature: z.string().nullable().optional(),
  paper_count: z.string().nullable().optional(),
});

export type FormulationSearchResult = z.infer<
  typeof FormulationSearchResultSchema
>;

export const FormulationPaginatedResultSchema = z.object({
  formulations: z.array(FormulationSearchResultSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export type FormulationPaginatedResult = z.infer<typeof FormulationPaginatedResultSchema>;