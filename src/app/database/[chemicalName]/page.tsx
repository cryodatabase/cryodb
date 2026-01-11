import { SearchBreadcrumb } from "@/components/entryComponents/article-breadcrumb";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ReferencePopup from "./refPopup";
import ReportError from "@/components/entryComponents/report-button";
import CopyButton from "@/components/entryComponents/copy-button";
import CitePopup from "@/components/entryComponents/cite-button";
import { ChemicalPapersAndExperiments, NamesSynonymsView } from "@/lib/database/schema";
import { FormulationPaginatedResult } from "@/lib/database/storage";
import { PropertyTable, transformData } from "./propertyTable";
import { dummyRes } from "./dummyRes";
import { FlaskConical } from "lucide-react";
import { CopyURLButton } from "@/components/copyButton";



type ChemicalRoleType = "CPA" | "ADJUVANT" | "CARRIER";

export type Property =
  | "MOLECULAR_MASS"
  | "SOLUBILITY"
  | "VISCOSITY"
  | "TG_PRIME"
  | "PARTITION_COEFFICIENT"
  | "DIELECTRIC_CONSTANT"
  | "THERMAL_CONDUCTIVITY"
  | "HEAT_CAPACITY"
  | "THERMAL_EXPANSION_COEFFICIENT"
  | "CRYSTALLIZATION_TEMPERATURE"
  | "DIFFUSION_COEFFICIENT"
  | "HYDROGEN_BOND_DONORS_ACCEPTORS"
  | "SOURCE_OF_COMPOUND"
  | "GRAS_CERTIFICATION"
  | "MELTING_POINT"
  | "HYDROPHOBICITY"
  | "DENSITY"
  | "REFRACTIVE_INDEX"
  | "SURFACE_TENSION"
  | "PH"
  | "OSMOLALITY_OSMOLARITY"
  | "POLAR_SURFACE_AREA";


enum PropertyUnit {
  G_PER_MOL = "g/mol",
  DA = "Da",
  KDA = "kDa",
  MG_PER_ML = "mg/mL",
  G_PER_100ML = "g/100 mL",
  PERCENT_W_V = "% w/v",
  MPAS = "mPa.s",
  CP = "cP",
  DEGC = "degC",
  DEGK = "degK",
  LOGP = "logP",
  W_PER_MK = "W/(m.K)",
  J_PER_GK = "J/(g.K)",
  J_PER_MOLK = "J/(mol.K)",
  PER_K = "1/K",
  M2_PER_S = "m2/s",
  CM2_PER_S = "cm2/s",
  COUNT = "count",
  TEXT = "text",
  BOOLEAN = "boolean",
  QUALITATIVE = "qualitative",
  G_PER_CM3 = "g/cm3",
  KG_PER_M3 = "kg/m3",
  MN_PER_M = "mN/m",
  DYN_PER_CM = "dyn/cm",
  OSMOL_PER_KG = "Osmol/kg",
  OSMOL_PER_L = "Osmol/L",
  A2 = "A2",
}

export interface Source {
  doi: string | null;
  quote: string | null;
  paper_id: string | null;
  experiment_quote: string | null;
  link: string | null;
}

interface PropertyValue {
  value_id: string;
  unit: PropertyUnit | string | null;
  value: string;
  sources: Source[];
  hidden: boolean;
}

export interface AgentPropertyGeneric {
  //synonyms: string[];
  //inchikey: string;
  chemical_id: string;
  preferred_name: string;
  role: ChemicalRoleType;
  prop_type: Property;
  property_values: PropertyValue[];
}

export interface PropertiesResponse {
  properties: AgentPropertyGeneric[];
  synonyms: NamesSynonymsView[];
  papersAndExperiments: ChemicalPapersAndExperiments[];
  formulations: FormulationPaginatedResult;
}




// Fetch function (unchanged)
async function fetchChemical(chemicalName: string, url: string): Promise<PropertiesResponse | null> {
  try {
    const response = await fetch(`${url}/api/chemicals/${chemicalName}`);
    if (!response.ok) return null;

    const data = await response.json(); // Await the JSON parsing
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Main Page Component
export default async function ChemicalPage({ params }: { params: Promise<{ chemicalName: string }> }) {
  const { chemicalName } = await params;
  
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const url = `${protocol}://${host}`;

  //const data = await fetchChemical(chemicalName, url);
  const data = dummyRes;
  if (!data || !data.properties || data.properties.length === 0) return notFound();

  const transformedData = transformData(data);

  const citationData = {
    name: data.properties[0].preferred_name,
    written_by: ["CryoDB Foundation"],
    uri: encodeURIComponent(data.properties[0].preferred_name.toLowerCase())
  };

  return (
    <div className="pt-4 px-4 min-h-[calc(100vh-428px)] max-w-[1800px] mx-auto">
      {/* Breadcrumb */}
      <SearchBreadcrumb agentName={data.properties[0].preferred_name} />

      {/* Content Box */}
      {/*<div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] pt-2">*/}
        {/* Main Content */}
        <div className="flex flex-col mb-8 mt-2">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-3xl font-semibold">
              {data.properties[0].preferred_name}
            </h1>
            <p className="text-lg font-semibold bg-foreground text-background px-2 py-0.3 rounded-full">
              {data.properties[0].role}
            </p>
          </div>

          <div className="flex mt-3 gap-4 justify-between items-center">
            {data?.synonyms?.length !== 0 &&
              <div className="font-semibold capitalize">
                <h3 className="text-muted-foreground">
                  Also Known As:
                  <br/>
                  {data?.synonyms?.map((obj, index) => {
                    if (obj.hidden) return null;

                    return (
                      <span key={index}>
                        {obj.synonym}{index + 1 !== data.synonyms.length && ", "}
                      </span>
                    )
                  })}
                </h3>
              </div>
            }

            <div className="flex items-center gap-2.5">
              <CitePopup citationsData={citationData} />
              <ReportError hash={data.properties[0].preferred_name} name={data.properties[0].preferred_name} />
              {/*<CopyButton token={data.properties[0].preferred_name} />*/}
              <CopyURLButton />
            </div>
          </div>

          <div className="mt-6">
            <PropertyTable transformedData={transformedData} />
          </div>
        </div>
      {/*</div>*/}

      <div className="border rounded-lg p-4">
        <h3 className="font-semibold text-2xl flex items-center gap-1 border-b pb-1">
          <FlaskConical />
          Formulations
        </h3>

        {data.formulations.total >= 1 ? (
          <div>need to map data</div>
        ) : (
          <p className="text-muted-foreground">
            No well-researched formulations found (showing only formulations with 2+ papers)
          </p>
        )}
      </div>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}