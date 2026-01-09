import { SearchBreadcrumb } from "@/components/entryComponents/article-breadcrumb";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ReferencePopup from "./refPopup";
import ReportError from "@/components/entryComponents/report-button";
import CopyButton from "@/components/entryComponents/copy-button";
import CitePopup from "@/components/entryComponents/cite-button";
import { ChemicalPapersAndExperiments, NamesSynonymsView } from "@/lib/database/schema";
import { FormulationPaginatedResult } from "@/lib/database/storage";

// Enums and Interfaces (unchanged from your code)
enum ChemicalRole {
  CPA = "CPA",
  ADJUVANT = "ADJUVANT",
  CARRIER = "CARRIER",
}

enum PropertyType {
  MOLECULAR_MASS = "MOLECULAR_MASS",
  SOLUBILITY = "SOLUBILITY",
  VISCOSITY = "VISCOSITY",
  TG_PRIME = "TG_PRIME",
  PARTITION_COEFFICIENT = "PARTITION_COEFFICIENT",
  DIELECTRIC_CONSTANT = "DIELECTRIC_CONSTANT",
  THERMAL_CONDUCTIVITY = "THERMAL_CONDUCTIVITY",
  HEAT_CAPACITY = "HEAT_CAPACITY",
  THERMAL_EXPANSION_COEFFICIENT = "THERMAL_EXPANSION_COEFFICIENT",
  CRYSTALLIZATION_TEMPERATURE = "CRYSTALLIZATION_TEMPERATURE",
  DIFFUSION_COEFFICIENT = "DIFFUSION_COEFFICIENT",
  HYDROGEN_BOND_DONORS_ACCEPTORS = "HYDROGEN_BOND_DONORS_ACCEPTORS",
  SOURCE_OF_COMPOUND = "SOURCE_OF_COMPOUND",
  GRAS_CERTIFICATION = "GRAS_CERTIFICATION",
  MELTING_POINT = "MELTING_POINT",
  HYDROPHOBICITY = "HYDROPHOBICITY",
  DENSITY = "DENSITY",
  REFRACTIVE_INDEX = "REFRACTIVE_INDEX",
  SURFACE_TENSION = "SURFACE_TENSION",
  PH = "PH",
  OSMOLALITY_OSMOLARITY = "OSMOLALITY_OSMOLARITY",
  POLAR_SURFACE_AREA = "POLAR_SURFACE_AREA",
}

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

interface Source {
  doi: string | null;
  quote: string | null;
  paper_id: string | null;
  experiment_quote: string | null;
}

interface PropertyValue {
  unit: PropertyUnit | string;
  value: string;
  sources: Source[];
}

interface AgentProperty {
  synonyms: string[];
  inchikey: string;
  chemical_id: string;
  preferred_name: string;
  role: ChemicalRole;
  prop_type: PropertyType;
  property_values: PropertyValue[];
}

export interface PropertiesResponse {
  properties: AgentProperty[];
  synonyms: NamesSynonymsView[];
  papersAndExperiments: ChemicalPapersAndExperiments[];
  formulations: FormulationPaginatedResult;
}

// Mapping for display-friendly property names
const propertyDisplayNames: { [key in PropertyType]: string } = {
  [PropertyType.MOLECULAR_MASS]: "Molecular Mass",
  [PropertyType.SOLUBILITY]: "Solubility",
  [PropertyType.VISCOSITY]: "Viscosity",
  [PropertyType.TG_PRIME]: "Glass Transition Temperature",
  [PropertyType.PARTITION_COEFFICIENT]: "Partition Coefficient",
  [PropertyType.DIELECTRIC_CONSTANT]: "Dielectric Constant",
  [PropertyType.THERMAL_CONDUCTIVITY]: "Thermal Conductivity",
  [PropertyType.HEAT_CAPACITY]: "Heat Capacity",
  [PropertyType.THERMAL_EXPANSION_COEFFICIENT]: "Thermal Expansion Coefficient",
  [PropertyType.CRYSTALLIZATION_TEMPERATURE]: "Crystallization Temperature",
  [PropertyType.DIFFUSION_COEFFICIENT]: "Diffusion Coefficient",
  [PropertyType.HYDROGEN_BOND_DONORS_ACCEPTORS]: "Hydrogen Bond Donors/Acceptors",
  [PropertyType.SOURCE_OF_COMPOUND]: "Source of Compound",
  [PropertyType.GRAS_CERTIFICATION]: "GRAS Certification",
  [PropertyType.MELTING_POINT]: "Melting Point",
  [PropertyType.HYDROPHOBICITY]: "Hydrophobicity",
  [PropertyType.DENSITY]: "Density",
  [PropertyType.REFRACTIVE_INDEX]: "Refractive Index",
  [PropertyType.SURFACE_TENSION]: "Surface Tension",
  [PropertyType.PH]: "pH",
  [PropertyType.OSMOLALITY_OSMOLARITY]: "Osmolality/Osmolarity",
  [PropertyType.POLAR_SURFACE_AREA]: "Polar Surface Area",
};

const propertyUnitNames: { [key in PropertyUnit]: string } = {
  [PropertyUnit.G_PER_MOL]: "g mol<sup>-1</sup>",
  [PropertyUnit.DA]: "Da",
  [PropertyUnit.KDA]: "kDa",
  [PropertyUnit.MG_PER_ML]: "mg mL<sup>-1</sup>",
  [PropertyUnit.G_PER_100ML]: "g 100 mL<sup>-1</sup>",
  [PropertyUnit.PERCENT_W_V]: "% w/v",
  [PropertyUnit.MPAS]: "mPa·s",
  [PropertyUnit.CP]: "cP",
  [PropertyUnit.DEGC]: "°C",
  [PropertyUnit.DEGK]: "K",
  [PropertyUnit.LOGP]: "logP",
  [PropertyUnit.W_PER_MK]: "W m<sup>-1</sup> K<sup>-1</sup>",
  [PropertyUnit.J_PER_GK]: "J g<sup>-1</sup> K<sup>-1</sup>",
  [PropertyUnit.J_PER_MOLK]: "J mol<sup>-1</sup> K<sup>-1</sup>",
  [PropertyUnit.PER_K]: "K<sup>-1</sup>",
  [PropertyUnit.M2_PER_S]: "m<sup>2</sup> s<sup>-1</sup>",
  [PropertyUnit.CM2_PER_S]: "cm<sup>2</sup> s<sup>-1</sup>",
  [PropertyUnit.COUNT]: "count",
  [PropertyUnit.TEXT]: "text",
  [PropertyUnit.BOOLEAN]: "boolean",
  [PropertyUnit.QUALITATIVE]: "qualitative",
  [PropertyUnit.G_PER_CM3]: "g cm<sup>-3</sup>",
  [PropertyUnit.KG_PER_M3]: "kg m<sup>-3</sup>",
  [PropertyUnit.MN_PER_M]: "mN m<sup>-1</sup>",
  [PropertyUnit.DYN_PER_CM]: "dyn cm<sup>-1</sup>",
  [PropertyUnit.OSMOL_PER_KG]: "Osmol kg<sup>-1</sup>",
  [PropertyUnit.OSMOL_PER_L]: "Osmol L<sup>-1</sup>",
  [PropertyUnit.A2]: "Å<sup>2</sup>",
};


// Data Transformer Functions
const detectOutliers = (values: number[]): { nonOutliers: number[]; outliers: number[] } => {
  const sortedValues = values.sort((a, b) => a - b);
  const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)];
  const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return {
    nonOutliers: sortedValues.filter((val) => val >= lowerBound && val <= upperBound),
    outliers: sortedValues.filter((val) => val < lowerBound || val > upperBound),
  };
};

const calculateAverage = (values: number[]): string | null => {
  if (values.length === 0) return null;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return (sum / values.length).toFixed(2);
};

const parseValue = (value: string): number => {
  if (value.includes('–')) {
    const [min, max] = value.split('–').map((v) => Number(v.trim()));
    return (min + max) / 2;
  }
  return Number(value);
};

interface TransformedProperty {
  property: string;
  display_name: string;
  primary_unit: string | null;
  primary_display_unit: TrustedHTML | null;
  primary_average: string | null;
  primary_range: string | null;
  outliers: number[];
  secondary_unit: string | null;
  secondary_display_unit: TrustedHTML | null;
  secondary_average: string | null;
  reference_paper_map: { [paper_id: string]: Source };
}

const transformData = (data: PropertiesResponse): TransformedProperty[] => {
  const transformed: TransformedProperty[] = [];

  const groupedByPropType = data.properties.reduce((acc, prop) => {
    if (!acc[prop.prop_type]) {
      acc[prop.prop_type] = [];
    }
    acc[prop.prop_type].push(prop);
    return acc;
  }, {} as { [key in PropertyType]: AgentProperty[] });

  for (const propType in groupedByPropType) {
    const properties = groupedByPropType[propType as PropertyType];
    const unitCounts: { [unit: string]: number } = {};
    const unitValues: { [unit: string]: number[] } = {};
    const unitSources: { [unit: string]: Source[] } = {};

    properties.forEach((prop) => {
      prop.property_values.forEach((pv) => {
        const unit = pv.unit;
        const value = parseValue(pv.value);
        if (!unitCounts[unit]) {
          unitCounts[unit] = 0;
          unitValues[unit] = [];
          unitSources[unit] = [];
        }
        unitCounts[unit]++;
        unitValues[unit].push(value);
        unitSources[unit].push(...pv.sources);
      });
    });

    const sortedUnits = Object.keys(unitCounts).sort((a, b) => unitCounts[b] - unitCounts[a]);
    const primaryUnit = sortedUnits[0] || null;
    const secondaryUnit = sortedUnits[1] || null;

    /*let primaryAverage: string | null = null;
    let primaryOutliers: number[] = [];
    if (primaryUnit) {
      const { nonOutliers, outliers } = detectOutliers(unitValues[primaryUnit]);
      primaryAverage = calculateAverage(nonOutliers);
      primaryOutliers = outliers;
    }*/
    let primaryAverage: string | null = null;
    let primaryRange: string | null = null; // Initialize range
    let primaryOutliers: number[] = [];
    if (primaryUnit) {
      const { nonOutliers, outliers } = detectOutliers(unitValues[primaryUnit]);
      primaryAverage = calculateAverage(nonOutliers);
      primaryOutliers = outliers;
      // Calculate range from nonOutliers
      if (nonOutliers.length > 0) {
        const min = Math.min(...nonOutliers).toFixed(2);
        const max = Math.max(...nonOutliers).toFixed(2);
        if (min !== max) primaryRange = `${min}, ${max}`;
        primaryRange = min;
      }
    }

    let secondaryAverage: string | null = null;
    if (secondaryUnit) {
      const { nonOutliers } = detectOutliers(unitValues[secondaryUnit]);
      secondaryAverage = calculateAverage(nonOutliers);
    }

    const referencePaperMap: { [paper_id: string]: Source } = {};
    Object.keys(unitSources).forEach((unit) => {
      unitSources[unit].forEach((source) => {
        if (source.paper_id) {
          referencePaperMap[source.paper_id] = source;
        }
      });
    });

    transformed.push({
      property: propType,
      display_name: propertyDisplayNames[propType as PropertyType] || propType,
      primary_unit: primaryUnit,
      primary_display_unit: primaryUnit ? propertyUnitNames[primaryUnit as PropertyUnit] || primaryUnit : null,
      primary_average: primaryAverage,
      primary_range: primaryRange,
      outliers: primaryOutliers,
      secondary_unit: secondaryUnit,
      secondary_display_unit: secondaryUnit ? propertyUnitNames[secondaryUnit as PropertyUnit] || secondaryUnit : null,
      secondary_average: secondaryAverage,
      reference_paper_map: referencePaperMap,
    });
  }

  return transformed;
};

// Component to Render Transformed Data
const PropertyTable: React.FC<{ transformedData: TransformedProperty[] }> = ({ transformedData }) => {
  return (
    <div className="w-full overflow-x-scroll">
    <div className="overflow-x-auto min-w-[1050px] border border-color rounded-2xl">
      <table className="min-w-full">
        <thead>
          <tr className="bg-input">
            <th className="border border-color px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Property</th>
            <th className="border border-color px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Primary Average</th>
            <th className="border border-color px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Primary Range</th>
            <th className="border border-color px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Outliers</th>
            <th className="border border-color px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Secondary Average</th>
            <th className="border border-color px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">References</th>
          </tr>
        </thead>
        <tbody>
          {transformedData.map((item, index) => (
            <tr key={index} className={`${index % 2 === 0 ? '' : 'bg-input/30'} divide-x divide-border-color hover:bg-input/45`}>
              <td className="border border-color px-4 py-2 font-semibold">{item.display_name}</td>
              <td className="border border-color px-4 py-2">
                {item.primary_average || '-'}
                {/*{item.primary_display_unit || '-'}*/}
                {item.primary_display_unit && item.primary_display_unit != null && item.primary_display_unit != 'null' && (
                  <span dangerouslySetInnerHTML={{ __html: item.primary_display_unit }} />
                )}
              </td>
              <td className="border border-color px-4 py-2">
                {item.primary_range || '—'}
                {/*{item.primary_display_unit || '-'}*/}
                {item.primary_display_unit && item.primary_display_unit != null && item.primary_display_unit != 'null' && (
                  <span dangerouslySetInnerHTML={{ __html: item.primary_display_unit }} />
                )}
              </td>
              <td className="border border-color px-4 py-2">
                {item.outliers.length > 0 ? item.outliers.join(', ') : '-'}
              </td>
              <td className="border border-color px-4 py-2">
                {item.secondary_average || '-'}
                {item.secondary_display_unit ? (
                  <span dangerouslySetInnerHTML={{ __html: item.secondary_display_unit }} />
                ) : ("-")}
              </td>
              <td className="border border-color px-4 py-2 max-h-[200px] overflow-y-scroll">
                <ReferencePopup references={item.reference_paper_map} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
};

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

  const data = await fetchChemical(chemicalName, url);
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
              <CopyButton token={data.properties[0].preferred_name} />
            </div>
          </div>

          <div className="mt-6">
            <PropertyTable transformedData={transformedData} />
          </div>
        </div>
      {/*</div>

      <pre>{JSON.stringify(data.synonyms, null, 2)}</pre>*/}
    </div>
  );
}