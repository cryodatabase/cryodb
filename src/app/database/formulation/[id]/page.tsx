import { Badge } from "@/components/ui/badge";
import { ExternalLink, TestTubeDiagonal } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ResearchTable } from "./researchTable";
import { SourcePapersTable } from "./sourcePapersTable";
import { DatabaseBreadcrumb } from "@/components/databaseBreadcrumbs";

export const revalidate = 86400; // cache aggressively: refresh daily

const BiologicalContextSchema = z.object({
  species: z.string().nullable().optional(),
  organ: z.string().nullable().optional(),
  tissue: z.string().nullable().optional(),
  dimensions: z.string().nullable().optional(),
  cell_line: z.string().nullable().optional(),
  health_status: z.string().nullable().optional(),
  developmental_stage: z.string().nullable().optional()
});

// FormulationComponent
const FormulationComponentSchema = z.object({
  component_id: z.string(),
  display_label: z.string(),
  chemical_id: z.string().nullable().optional(),
  chemical_name: z.string().nullable().optional(),
  concentration: z.string().nullable().optional(),
  unit: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
});

// FormulationExperiment
const FormulationExperimentSchema = z.object({
  experiment_id: z.string(),
  experiment_label: z.string(),
  experiment_quote: z.string().nullable().optional(),
  experiment_method: z.string().nullable().optional(),
  biological_context: BiologicalContextSchema.nullable().optional(),
  formulation_id: z.string(),
  formulation_label: z.string(),
});

// FormulationPaper
const FormulationPaperSchema = z.object({
  paper_id: z.string(),
  paper_title: z.string(),
  paper_doi: z.string().nullable().optional(),
  paper_authors: z.string().nullable().optional(),
  paper_published_year: z.number().int().nullable().optional(),
  paper_url: z.string().nullable().optional(),
});

// FormulationDetail
const FormulationDetailSchema = z.object({
  formulation_id: z.string(),
  formulation_label: z.string(),
  formulation_quote: z.string().nullable().optional(),
  component_signature: z.string(),
  components: z.array(FormulationComponentSchema),
  experiments: z.array(FormulationExperimentSchema),
  papers: z.array(FormulationPaperSchema),
});

export type FormulationExperiment = z.infer<typeof FormulationExperimentSchema>;
export type FormulationPaper = z.infer<typeof FormulationPaperSchema>;


export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const url = `${protocol}://${host}/api/formulation/${id}`;
  const response = await fetch(url);

  const extractedData = await response.json();
  const parsed = FormulationDetailSchema.safeParse(extractedData);
  
  //const parsed = FormulationDetailSchema.safeParse(dummyResponse);

  if (!parsed.success) return notFound();
  const data = parsed.data;

  return (
    <>
      <div className="mx-auto px-4 py-8 max-w-6xl">
        <DatabaseBreadcrumb directoryName="Chemicals" pageName={data.formulation_label} />
        <div className="flex items-center justify-between mt-1.5">
          <h1 className="text-3xl font-semibold capitalize">{data.formulation_label}</h1>
          <Badge className="text-md uppercase">Formulation</Badge>
        </div>
        
        <p className="text-muted-foreground italic mt-4 mb-6">"{data.formulation_quote}"</p>


        <section className="flex flex-col gap-4">
          {data.components.length > 0 && (
            <div className="border border-color rounded-2xl p-4">
              <h3 className="flex items-center gap-2 text-xl font-semibold border-b pb-2 mb-3">
                <TestTubeDiagonal />
                Components ({data.components.length})
              </h3>
              <div className="flex flex-col gap-2">
                {data.components.map(comp => (
                  <div className="flex items-center justify-between" key={comp.chemical_id}>
                    <div className="flex items-center gap-2">
                      <Link href={`/database/chemicals/${comp.chemical_id}`} className="text-md font-semibold hover:underline">
                        {comp.chemical_name}
                      </Link>
                      <Badge className="text-sm uppercase" variant="secondary">
                        {comp.role}
                      </Badge>
                      <a
                        className="ml-2 flex items-center justify-center h-[24px] w-[24px] rounded" 
                        href={`/database/chemicals/${comp.chemical_id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink height={18} width={18} />
                      </a>
                    </div>
                    <Badge className="text-md">
                      {comp.concentration} {comp.unit}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ResearchTable experiments={data.experiments} />

          <SourcePapersTable papers={data.papers} />
        </section>
      </div>
    </>
  )
}