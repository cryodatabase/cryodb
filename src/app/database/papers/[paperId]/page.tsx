import { headers } from "next/headers";
import { PaperExperimentsAndFormulations, Paper } from "@/lib/database/schema";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";
import ExperimentTable from "./experimentTable";
import { ExperimentBreadcrumb } from "./experimentBreadcrumb";
import z from "zod";
import { DatabaseBreadcrumb } from "@/components/databaseBreadcrumbs";

export const revalidate = 1800;

async function fetchPaper(paperId: string, url: string): Promise<PaperWithExperiments | null>  {
  try{
    const response = await fetch(`${url}/api/papers/${paperId}`);
    if (!response.ok) throw new Error("API Handler Error");

    const data = await response.json();
    return PaperWithExperimentsSchema.parse(data);
  } catch (err) {
    console.log(err);
    return null;
  }
}


/* ---------------------------------------------
 * Shared primitives
 * --------------------------------------------- */

const UUID = z.string().uuid();
const NullableString = z.string().nullable();
const NullableNumber = z.number().nullable();

/* ---------------------------------------------
 * Authors
 * --------------------------------------------- */

const AuthorSchema = z.object({
  name: z.string()
});

const AuthorsJsonSchema = z.record(z.string(), AuthorSchema);

const AuthorsArraySchema = z.object({
  authors: 
    z.array(
      z.object({
        name: z.string()
      })
    )
});

/* ---------------------------------------------
 * Paper
 * --------------------------------------------- */

export const PaperSchema = z.object({
  id: UUID,
  paper_id: UUID.nullable(),

  doi: NullableString,
  source: z.string(),
  title: z.string(),
  journal: NullableString,

  published_year: NullableNumber,
  published_month: NullableNumber,
  published_day: NullableNumber,

  abstract: NullableString,

  authors_json: z.union([AuthorsJsonSchema, AuthorsArraySchema]),
  authors_flat: z.string(),

  paper_url: NullableString,
  download_url: z.string().url().nullable(),

  is_free_fulltext: z.boolean().nullable(),
  license: NullableString,

  md5_hash: z.string(),
  file_size_bytes: z.number(),

  file_s3_uri: z.string(),
  fulltext_s3_uri: z.string(),

  cpa_facts_json: z.unknown().nullable(),

  status: z.enum([
    "COMPLETED",
    "PENDING",
    "FAILED"
  ]),

  created_at: z.string().datetime(),
  data: z.unknown().nullable()
});

/* ---------------------------------------------
 * Biological context
 * --------------------------------------------- */

export const BiologicalContextSchema = z.object({
  organ: NullableString,
  tissue: NullableString,
  species: z.string(),
  cell_line: NullableString,
  dimensions: NullableString,
  health_status: NullableString,
  developmental_stage: NullableString
});

/* ---------------------------------------------
 * Experiment + formulation
 * --------------------------------------------- */

export const ExperimentFormulationSchema = z.object({
  paper_id: UUID,
  experiment_id: UUID,

  experiment_label: z.string(),

  cooling_method: NullableString,
  rewarming_method: NullableString,

  biological_context: BiologicalContextSchema,

  experiment_quote: z.string(),

  formulation_id: UUID.nullable(),
  formulation_label: NullableString,
  formulation_quote: NullableString,

  component_id: UUID.nullable(),
  component_role: NullableString,

  amount: NullableString,
  unit: NullableString,
  component_quote: NullableString,

  note: NullableString,

  chemical_id: UUID.nullable(),
  chemical_preferred_name: NullableString,
  chemical_role: NullableString,

  alias_id: UUID.nullable(),
  alias_label: NullableString,
  display_label: NullableString
});

/* ---------------------------------------------
 * Root API response
 * --------------------------------------------- */

export const PaperWithExperimentsSchema = z.object({
  paper: PaperSchema,
  experiments_formulations_data: z.array(
    ExperimentFormulationSchema
  )
});

/* ---------------------------------------------
 * Inferred TypeScript types
 * --------------------------------------------- */

export type PaperWithExperiments =
  z.infer<typeof PaperWithExperimentsSchema>;

export type PaperType =
  z.infer<typeof PaperSchema>;

export type ExperimentFormulation =
  z.infer<typeof ExperimentFormulationSchema>;

export type BiologicalContext =
  z.infer<typeof BiologicalContextSchema>;


export default async function PaperPage({ params }: { params: Promise<{paperId: string}> }) {
  const { paperId } = await params;
  console.log(paperId);

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const url = `${protocol}://${host}`;

  const responseData = await fetchPaper(paperId, url);
  if (!responseData) return notFound();

  const data = responseData.paper;

  return(
    <div className="min-h-[calc(100vh-428px)] pt-4">
      <div className="mb-2">
        <DatabaseBreadcrumb directoryName="Papers" pageName={data.title} />
      </div>
      <h1 className="text-2xl font-semibold">{data.title}</h1>
      <div className="flex justify-between align-center my-2">
        <div className="text-muted-foreground">
          <p>
            {data?.published_year && (
              <span className="font-semibold">
                {data?.published_year}{", "}
              </span>
            )}
            {data?.journal && (
              <>
                <span className="font-semibold">
                  {data?.journal}
                </span>
                {" - "}
              </>
            )}

            {data?.doi ? (
              <a
                href={`https://doi.org/${data?.doi}`}
                target="_blank" rel="noopener noreferrer"
                className="hover:underline"
              >
                {data?.doi}
              </a>
            ) : data?.id}
          </p>
          <p className="font-semibold">{data?.authors_flat}</p>
        </div>

        {data?.paper_url && (
          <Button variant={"outline"} size={"icon"} asChild>
            <a
              href={/^https?:\/\//i.test(data?.paper_url) ? data.paper_url : `https://${data?.paper_url}`}
              target="_blank" rel="noopener noreferrer"
            >
              <Link />
            </a>
          </Button>
        )}
      </div>

      <div className="text-sm">
        {data?.abstract}
      </div>

      <div className="w-full overflow-x-scroll">
        <ExperimentTable experiments={responseData.experiments_formulations_data} />
      </div>

      {/*<pre>
        {JSON.stringify(responseData, null, 2)}
      </pre>*/}
    </div>
  )
}