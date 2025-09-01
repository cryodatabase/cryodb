import Image from "next/image"
import { CheckCheck, Upload, MoveUpRight, ExternalLink } from 'lucide-react'

import CitePopup from "@/components/articleComponents/cite-button"
import CopyButton from "@/components/articleComponents/copy-button"
import ReportError from "@/components/articleComponents/report-button"
import { SearchBreadcrumb } from "@/components/articleComponents/article-breadcrumb"

import { ArticleEntry } from "@/types/article"

// Basic numeric value with optional units and notes
type MeasuredValue = {
  value: number;
  units?: string;
  notes?: string;
};

// For values with multiple conditions or methods (e.g., Tg' at different cooling rates)
type ConditionalValue = {
  value: number;
  units?: string;
  condition?: string; // e.g., "cooled at 10°C/min"
  notes?: string;
};

// Yes/No or enum types
type BooleanString = "Yes" | "No" | "Unknown";

// Source information for the compound
type SourceInfo = {
  vendor: string;
  catalogNumber?: string;
  notes?: string;
};

// Certification details, e.g., GRAS status
type Certification = {
  name: string;
  certified: BooleanString;
  certifyingBody?: string;
  notes?: string;
  reference_url?: string; // Added to align with gras_info structure
};

// Complex numeric with real/imaginary parts for complex permittivity
type ComplexNumber = {
  real: number;
  imaginary: number;
  units?: string;
  notes?: string;
};

// CompoundProperties interface for additional chemical properties
interface CompoundProperties {
  solubility?: MeasuredValue; // e.g., g/L or mol/L
  viscosity?: MeasuredValue; // e.g., mPa·s
  glassFormingCapacity?: ConditionalValue; // e.g., concentration for vitrification
  tgPrime?: ConditionalValue; // glass transition temp, Tg'
  partitionCoefficient?: MeasuredValue; // e.g., log P, water:octanol
  dielectricConstant?: MeasuredValue; // real part only
  complexDielectricPermittivity?: ComplexNumber;
  thermalConductivity?: MeasuredValue; // e.g., W/(m·K)
  heatCapacity?: MeasuredValue; // e.g., J/(g·K)
  thermalExpansionCoefficient?: MeasuredValue; // e.g., 1/K
  crystallizationTemperature?: MeasuredValue; // °C or K
  diffusionCoefficient?: MeasuredValue; // e.g., m²/s
  hydrogenBondDonors?: number;
  hydrogenBondAcceptors?: number;
  source?: SourceInfo[];
  grasCertification?: Certification;
  freezingPoint?: MeasuredValue; // °C or K
  meltingPoint?: MeasuredValue; // °C or K
  hydrophobicHydrophilicNature?: "Hydrophobic" | "Hydrophilic" | "Amphiphilic" | "Unknown";
  density?: MeasuredValue; // e.g., g/cm³
  refractiveIndex?: MeasuredValue; // unitless
  surfaceTension?: MeasuredValue; // e.g., mN/m
  pH?: MeasuredValue; // pH units (usually unitless)
  osmolality?: MeasuredValue; // Osm/kg
  osmolarity?: MeasuredValue; // Osm/L
  polarSurfaceArea?: MeasuredValue; // Å² or nm²
}

interface EnhancedArticleEntry extends ArticleEntry, CompoundProperties {}

const entry: EnhancedArticleEntry = {
  name: 'Dimethyl Sulfoxide (DMSO)',
  hash: '0x8csM5u8m7',
  class: 'Sulfoxides',
  chemical_formula_html: '(CH<sub>3</sub>)<sub>2</sub>SO',
  molecular_formula_html: 'C<sub>2</sub>H<sub>6</sub>OS',
  molecular_weight: '78.13 g/mol',
  optimal_conc: '5% - 10% (v/v)',
  structure_image: 'https://www.sigmaaldrich.com/deepweb/assets/sigmaaldrich/product/structures/351/937/4fba03cc-7107-47d4-8c4f-0193e7565d4d/640/4fba03cc-7107-47d4-8c4f-0193e7565d4d.png',
  cas_number: '67-68-5',
  pricing_info: [],
  safety_document_sheet: '',
  written_by: [],
  html_text: "<h3>Cryoprotectant Use</h3><p>DMSO is widely used in cryopreservation due to its ability to penetrate cell membranes and prevent ice crystal formation, which can cause cellular damage during the freezing and thawing processes. By lowering the freezing point and increasing the viscosity of the intracellular and extracellular solutions, DMSO helps in reducing the mechanical stresses on cells.</p><p><br></p><h3>Applications</</h3>...</p>", // Truncated for brevity
  overview: 'Dimethyl Sulfoxide (DMSO) is a chemical compound with the formula (CH₃)₂SO. It is an organosulfur compound that is commonly used as a solvent and a cryoprotectant. It is a colorless liquid that is miscible with water and many organic solvents.',
  synonyms: [
    'Dimethyl Sulphoxide',
    'Dimethylsulfoxide',
    'Dimethylsulphinyl',
    'Dimexide',
    'DMSO',
    'Rheumabene',
  ],
  date_written: '2024-11-23T23:06:45.232Z',
  cell_info: [
    {
      cellType: 'Cuboidal Epithelial Cells',
      successRate: '60',
      referenceURL: 'https://www.healthcare.nikon.com/en/ss/cell-image-lab/case/c20.html',
    },
  ],
  references: [
    {
      organisation: 'PubMed',
      reference: 'Ekpo, Marlene Davis et al. “Strategies in developing dimethyl sulfoxide (DMSO)-free cryopreservation protocols for biotherapeutics.” Frontiers in immunology vol. 13 1030965. 5 Oct. 2022, doi:10.3389/fimmu.2022.1030965',
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9579275/',
    },
    {
      organisation: 'PubMed',
      reference: 'Best, Benjamin P. “Cryoprotectant Toxicity: Facts, Issues, and Questions.” Rejuvenation research vol. 18,5 (2015): 422-36. doi:10.1089/rej.2014.1656',
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4620521/',
    },
  ],
  gras_info: {
    found: true,
    reference_url: 'https://www.hfpappexternal.fda.gov/scripts/fdcc/index.cfm?set=FoodSubstances&id=DIMETHYLSULFOXIDE',
  },
  solubility: {
    value: 1000,
    units: "g/L",
    notes: "Miscible with water and many organic solvents",
  },
  viscosity: {
    value: 1.996,
    units: "mPa·s",
    notes: "Measured at 20°C",
  },
  glassFormingCapacity: {
    value: 10,
    units: "% v/v",
    condition: "Used in vitrification protocols",
    notes: "Effective for vitrification at 5-10% concentrations",
  },
  tgPrime: {
    value: -132,
    units: "°C",
    condition: "Cooled at 10°C/min",
    notes: "Glass transition temperature for DMSO solutions varies with concentration",
  },
  partitionCoefficient: {
    value: -1.35,
    units: "log P",
    notes: "Water:octanol partition coefficient, indicating hydrophilicity",
  },
  dielectricConstant: {
    value: 47.2,
    units: "unitless",
    notes: "Measured at 20°C",
  },
  complexDielectricPermittivity: {
    real: 47.2,
    imaginary: 0.1,
    units: "unitless",
    notes: "Imaginary part estimated; depends on frequency and temperature",
  },
  thermalConductivity: {
    value: 0.2,
    units: "W/(m·K)",
    notes: "Approximate value at 25°C",
  },
  heatCapacity: {
    value: 1.95,
    units: "J/(g·K)",
    notes: "Specific heat capacity at 25°C",
  },
  thermalExpansionCoefficient: {
    value: 0.00089,
    units: "1/K",
    notes: "Approximate value at 25°C",
  },
  crystallizationTemperature: {
    value: 18.5,
    units: "°C",
    notes: "Crystallization temperature for pure DMSO",
  },
  diffusionCoefficient: {
    value: 1.0e-9,
    units: "m²/s",
    notes: "Approximate in water at 25°C",
  },
  hydrogenBondDonors: 0,
  hydrogenBondAcceptors: 2,
  source: [
    {
      vendor: "Sigma-Aldrich",
      catalogNumber: "D2650",
      notes: "High-purity DMSO for laboratory use",
    },
  ],
  grasCertification: {
    name: "GRAS",
    certified: "Yes",
    certifyingBody: "FDA",
    reference_url: "https://www.hfpappexternal.fda.gov/scripts/fdcc/index.cfm?set=FoodSubstances&id=DIMETHYLSULFOXIDE",
  },
  freezingPoint: {
    value: 18.5,
    units: "°C",
    notes: "Freezing point of pure DMSO",
  },
  meltingPoint: {
    value: 18.5,
    units: "°C",
    notes: "Melting point of pure DMSO",
  },
  hydrophobicHydrophilicNature: "Hydrophilic",
  density: {
    value: 1.1004,
    units: "g/cm³",
    notes: "Density at 20°C",
  },
  refractiveIndex: {
    value: 1.479,
    units: "unitless",
    notes: "Measured at 20°C",
  },
  surfaceTension: {
    value: 43.5,
    units: "mN/m",
    notes: "Measured at 20°C",
  },
  pH: {
    value: 7,
    units: "unitless",
    notes: "Neutral in aqueous solutions; may vary with concentration",
  },
  osmolality: {
    value: 13.3,
    units: "Osm/kg",
    notes: "Approximate for 10% v/v solution in water",
  },
  osmolarity: {
    value: 14.1,
    units: "Osm/L",
    notes: "Approximate for 10% v/v solution in water",
  },
  polarSurfaceArea: {
    value: 40.5,
    units: "Å²",
    notes: "Calculated from molecular structure",
  },
};

export default async function ArticlePage() {


  return (
    <div className="pt-4">
      {/* Breadcrumb */}
      <SearchBreadcrumb agentName={entry.name} />

      {/* Content Box */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] max-w-[1800px] pt-2 mx-auto">
        {/* Main Content */}
        <div className="flex flex-col mb-8">
          <h1 className="flex items-center gap-1 flex-wrap text-3xl font-semibold">
            {entry.name}
            {entry.chemical_formula_html && (
              <span className="flex items-center gap-1 max-md:hidden">
                - <span dangerouslySetInnerHTML={{ __html: entry.chemical_formula_html }} />
              </span>
            )}
          </h1>

          {/* Author and Actions */}
          <div className="flex justify-between items-center pt-1 max-md:flex-col max-md:items-start max-md:gap-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Upload height={14} width={14} />
              <h5 className="text-sm font-medium">
                Written by
                <span className="pl-[2px]">
                  {entry.written_by && entry.written_by.length > 0
                    ? entry.written_by.join(', ')
                    : "Cryorepository Foundation"}
                </span>
              </h5>
              <h6 className="flex items-center gap-1 px-1 py-[1px] text-purple-500 border border-[#6638b0] rounded-2xl bg-gradient-to-r from-[#6638b0] to-[#9848a3] text-transparent bg-clip-text text-xs">
                <CheckCheck stroke="#6638b0" height={16} width={16} />
                <span className="max-md:hidden">Verified</span>
              </h6>
            </div>
            <div className="flex items-center gap-2.5">
              <CitePopup citationsData={{name: entry.name, date_written: entry.date_written, written_by: entry.written_by, hash: entry.hash}} />
              <ReportError hash={entry.hash} name={entry.name} />
              <CopyButton token={entry.hash} />
            </div>
          </div>

          {/* Main Content */}
          {/*<div
            className="prose max-w-none mt-4
            [&_ul]:ml-5 [&_ol]:ml-5
            [&_ul]:mt-1 [&_ol]:mt-1
            [&_li]:font-semibold
            [&_h2]:pt-[8px] [&_h2]:pb-[6px]
            [&_h3]:pt-[8px] [&_h3]:pb-[6px]
            [&_h4]:pt-[8px] [&_h4]:pb-[6px]" //[&_ul]:ml-5 [&_ol]:ml-5 [&_ul]:mt-1 [&_ol]:mt-1
            dangerouslySetInnerHTML={{ __html: entry.html_text }}
          />*/}
          <div className="flex flex-col w-full mx-auto gap-4 mt-4">
            {/* Top Section: 50%/50% Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Left Box: Physical/Chemical Properties */}
              <div className="p-4 border border-border rounded-lg">
                <h4 className="pb-2 text-lg font-semibold">Physical/Chemical Properties</h4>
                <div className="w-full">
                  <table className="w-full">
                    <tbody>
                      {entry.solubility && (
                        <tr>
                          <td className="text-muted-foreground font-semibold py-0.5">Solubility</td>
                          <td className="text-right py-0.5">
                            {entry.solubility.value} {entry.solubility.units}{' '}
                            {entry.solubility.notes && `(${entry.solubility.notes})`}
                          </td>
                        </tr>
                      )}
                      {entry.viscosity && (
                        <tr>
                          <td className="text-muted-foreground font-semibold py-0.5">Viscosity</td>
                          <td className="text-right py-0.5">
                            {entry.viscosity.value} {entry.viscosity.units}{' '}
                            {entry.viscosity.notes && `(${entry.viscosity.notes})`}
                          </td>
                        </tr>
                      )}
                      {entry.density && (
                        <tr>
                          <td className="text-muted-foreground font-semibold py-0.5">Density</td>
                          <td className="text-right py-0.5">
                            {entry.density.value} {entry.density.units}{' '}
                            {entry.density.notes && `(${entry.density.notes})`}
                          </td>
                        </tr>
                      )}
                      {entry.refractiveIndex && (
                        <tr>
                          <td className="text-muted-foreground font-semibold py-0.5">Refractive Index</td>
                          <td className="text-right py-0.5">
                            {entry.refractiveIndex.value} {entry.refractiveIndex.units}{' '}
                            {entry.refractiveIndex.notes && `(${entry.refractiveIndex.notes})`}
                          </td>
                        </tr>
                      )}
                      {entry.surfaceTension && (
                        <tr>
                          <td className="text-muted-foreground font-semibold py-0.5">Surface Tension</td>
                          <td className="text-right py-0.5">
                            {entry.surfaceTension.value} {entry.surfaceTension.units}{' '}
                            {entry.surfaceTension.notes && `(${entry.surfaceTension.notes})`}
                          </td>
                        </tr>
                      )}
                      {entry.dielectricConstant && (
                        <tr>
                          <td className="text-muted-foreground font-semibold py-0.5">Dielectric Constant</td>
                          <td className="text-right py-0.5">
                            {entry.dielectricConstant.value} {entry.dielectricConstant.units}{' '}
                            {entry.dielectricConstant.notes && `(${entry.dielectricConstant.notes})`}
                          </td>
                        </tr>
                      )}
                      {entry.complexDielectricPermittivity && (
                        <tr>
                          <td className="text-muted-foreground font-semibold py-0.5">Complex Dielectric Permittivity</td>
                          <td className="text-right py-0.5">
                            {entry.complexDielectricPermittivity.real} (real), {entry.complexDielectricPermittivity.imaginary} (imaginary) {entry.complexDielectricPermittivity.units}{' '}
                            {entry.complexDielectricPermittivity.notes && `(${entry.complexDielectricPermittivity.notes})`}
                          </td>
                        </tr>
                      )}
                      {entry.thermalConductivity && (
                        <tr>
                          <td className="text-muted-foreground font-semibold py-0.5">Thermal Conductivity</td>
                          <td className="text-right py-0.5">
                            {entry.thermalConductivity.value} {entry.thermalConductivity.units}{' '}
                            {entry.thermalConductivity.notes && `(${entry.thermalConductivity.notes})`}
                          </td>
                        </tr>
                      )}
                      {entry.heatCapacity && (
                        <tr>
                          <td className="text-muted-foreground font-semibold py-0.5">Heat Capacity</td>
                          <td className="text-right py-0.5">
                            {entry.heatCapacity.value} {entry.heatCapacity.units}{' '}
                            {entry.heatCapacity.notes && `(${entry.heatCapacity.notes})`}
                          </td>
                        </tr>
                      )}
                      {entry.thermalExpansionCoefficient && (
                        <tr>
                          <td className="text-muted-foreground font-semibold py-0.5">Thermal Expansion Coefficient</td>
                          <td className="text-right py-0.5">
                            {entry.thermalExpansionCoefficient.value} {entry.thermalExpansionCoefficient.units}{' '}
                            {entry.thermalExpansionCoefficient.notes && `(${entry.thermalExpansionCoefficient.notes})`}
                          </td>
                        </tr>
                      )}
                      {entry.pH && (
                        <tr>
                          <td className="text-muted-foreground font-semibold py-0.5">pH</td>
                          <td className="text-right py-0.5">
                            {entry.pH.value} {entry.pH.units}{' '}
                            {entry.pH.notes && `(${entry.pH.notes})`}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Box: Cryoprotectant-Related Properties */}
              <div className="p-4 border border-border rounded-lg">
                <h4 className="pb-2 text-lg font-semibold">Cryoprotectant Properties</h4>
                <div className="w-full">
                  <table className="w-full">
                    <tbody>
                      {entry.glassFormingCapacity && (
                        <tr>
                          <td className="text-muted-foreground font-semibold py-0.5">Glass Forming Capacity</td>
                          <td className="text-right py-0.5">
                            {entry.glassFormingCapacity.value} {entry.glassFormingCapacity.units}{' '}
                            {entry.glassFormingCapacity.condition && `(${entry.glassFormingCapacity.condition})`}{' '}
                            {entry.glassFormingCapacity.notes && `(${entry.glassFormingCapacity.notes})`}
                          </td>
                        </tr>
                      )}
                      {entry.tgPrime && (
                        <tr>
                          <td className="text-muted-foreground font-semibold py-0.5">Tg&apos; (Glass Transition Temp)</td>
                          <td className="text-right py-0.5">
                            {entry.tgPrime.value} {entry.tgPrime.units}{' '}
                            {entry.tgPrime.condition && `(${entry.tgPrime.condition})`}{' '}
                            {entry.tgPrime.notes && `(${entry.tgPrime.notes})`}
                          </td>
                        </tr>
                      )}
                      {entry.crystallizationTemperature && (
                        <tr>
                          <td className="text-muted-foreground font-semibold py-0.5">Crystallization Temperature</td>
                          <td className="text-right py-0.5">
                            {entry.crystallizationTemperature.value} {entry.crystallizationTemperature.units}{' '}
                            {entry.crystallizationTemperature.notes && `(${entry.crystallizationTemperature.notes})`}
                          </td>
                        </tr>
                      )}
                      {entry.freezingPoint && (
                        <tr>
                          <td className="text-muted-foreground font-semibold py-0.5">Freezing Point</td>
                          <td className="text-right py-0.5">
                            {entry.freezingPoint.value} {entry.freezingPoint.units}{' '}
                            {entry.freezingPoint.notes && `(${entry.freezingPoint.notes})`}
                          </td>
                        </tr>
                      )}
                      {entry.meltingPoint && (
                        <tr>
                          <td className="text-muted-foreground font-semibold py-0.5">Melting Point</td>
                          <td className="text-right py-0.5">
                            {entry.meltingPoint.value} {entry.meltingPoint.units}{' '}
                            {entry.meltingPoint.notes && `(${entry.meltingPoint.notes})`}
                          </td>
                        </tr>
                      )}
                      {entry.osmolality && (
                        <tr>
                          <td className="text-muted-foreground font-semibold py-0.5">Osmolality</td>
                          <td className="text-right py-0.5">
                            {entry.osmolality.value} {entry.osmolality.units}{' '}
                            {entry.osmolality.notes && `(${entry.osmolality.notes})`}
                          </td>
                        </tr>
                      )}
                      {entry.osmolarity && (
                        <tr>
                          <td className="text-muted-foreground font-semibold py-0.5">Osmolarity</td>
                          <td className="text-right py-0.5">
                            {entry.osmolarity.value} {entry.osmolarity.units}{' '}
                            {entry.osmolarity.notes && `(${entry.osmolarity.notes})`}
                          </td>
                        </tr>
                      )}
                      {entry.polarSurfaceArea && (
                        <tr>
                          <td className="text-muted-foreground font-semibold py-0.5">Polar Surface Area</td>
                          <td className="text-right py-0.5">
                            {entry.polarSurfaceArea.value} {entry.polarSurfaceArea.units}{' '}
                            {entry.polarSurfaceArea.notes && `(${entry.polarSurfaceArea.notes})`}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Bottom Section: Full-Width Table for Miscellaneous/Structural Properties */}
            <div className="p-4 border border-border rounded-lg">
              <h4 className="pb-2 text-lg font-semibold">Miscellaneous Properties</h4>
              <div className="w-full">
                <table className="w-full">
                  <tbody>
                    {entry.partitionCoefficient && (
                      <tr>
                        <td className="text-muted-foreground font-semibold py-0.5">Partition Coefficient</td>
                        <td className="text-right py-0.5">
                          {entry.partitionCoefficient.value} {entry.partitionCoefficient.units}{' '}
                          {entry.partitionCoefficient.notes && `(${entry.partitionCoefficient.notes})`}
                        </td>
                      </tr>
                    )}
                    {entry.hydrogenBondDonors !== undefined && (
                      <tr>
                        <td className="text-muted-foreground font-semibold py-0.5">Hydrogen Bond Donors</td>
                        <td className="text-right py-0.5">{entry.hydrogenBondDonors}</td>
                      </tr>
                    )}
                    {entry.hydrogenBondAcceptors !== undefined && (
                      <tr>
                        <td className="text-muted-foreground font-semibold py-0.5">Hydrogen Bond Acceptors</td>
                        <td className="text-right py-0.5">{entry.hydrogenBondAcceptors}</td>
                      </tr>
                    )}
                    {entry.hydrophobicHydrophilicNature && (
                      <tr>
                        <td className="text-muted-foreground font-semibold py-0.5">Hydrophobic/Hydrophilic Nature</td>
                        <td className="text-right py-0.5">{entry.hydrophobicHydrophilicNature}</td>
                      </tr>
                    )}
                    {entry.diffusionCoefficient && (
                      <tr>
                        <td className="text-muted-foreground font-semibold py-0.5">Diffusion Coefficient</td>
                        <td className="text-right py-0.5">
                          {entry.diffusionCoefficient.value} {entry.diffusionCoefficient.units}{' '}
                          {entry.diffusionCoefficient.notes && `(${entry.diffusionCoefficient.notes})`}
                        </td>
                      </tr>
                    )}
                    {entry.source && (
                      <tr>
                        <td className="text-muted-foreground font-semibold py-0.5">Source</td>
                        <td className="text-right py-0.5">
                          {entry.source.map(s => `${s.vendor} (${s.catalogNumber})`).join(', ')}{' '}
                          {entry.source[0].notes && `(${entry.source[0].notes})`}
                        </td>
                      </tr>
                    )}
                    {entry.grasCertification && (
                      <tr>
                        <td className="text-muted-foreground font-semibold py-0.5">GRAS Certification</td>
                        <td className="text-right py-0.5">
                          {entry.grasCertification.certified} ({entry.grasCertification.certifyingBody}){' '}
                          {entry.grasCertification.reference_url && (
                            <a href={entry.grasCertification.reference_url} target="_blank" rel="noopener noreferrer" className="underline">
                              Link
                            </a>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* References */}
          {entry.references.length > 0 &&
            entry.references.some(ref => ref.reference && ref.reference.trim() !== '') && (
              <div className="my-3">
                <h3 className="text-lg font-semibold">References</h3>
                <div className="flex flex-col gap-3 mb-4">
                  {entry.references
                    .filter(ref => ref.reference && ref.reference.trim() !== '')
                    .map((reference, index) => (
                      <div key={index} className="flex flex-col">
                        <span className="text-sm text-muted-foreground">
                          <a
                            href={reference.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {reference.organisation}
                          </a>{' '}
                          - {reference.reference}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
        </div>

        {/* Sidebar */}
        <div className="mt-4 lg:mt-0 lg:pl-5">
          {/* Info Table */}
          <div className="p-4 border border-border rounded-lg max-w-[930px] lg:max-w-[320px]">
            <h4 className="pb-2 text-lg font-semibold">Information</h4>
            <h6 className="text-xs font-semibold">CAS number: {entry.cas_number}</h6>
            <div className="w-full">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="text-muted-foreground font-semibold py-0.5">Class</td>
                    <td className="text-right py-0.5">{entry.class}</td>
                  </tr>
                  <tr>
                    <td className="text-muted-foreground font-semibold py-0.5">Chemical Formula</td>
                    <td
                      className="text-right py-0.5"
                      dangerouslySetInnerHTML={{ __html: entry.chemical_formula_html }}
                    />
                  </tr>
                  <tr>
                    <td className="text-muted-foreground font-semibold py-0.5">Molecular Weight</td>
                    <td className="text-right py-0.5">{entry.molecular_weight}</td>
                  </tr>
                  {entry.optimal_conc && (
                    <tr>
                      <td className="text-muted-foreground font-semibold py-0.5">Optimal Conc</td>
                      <td className="text-right py-0.5">{entry.optimal_conc}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Synonyms */}
          {entry.synonyms.length > 0 && entry.synonyms.some(syn => syn.trim() !== '') && (
            <div className="my-3 p-4 border border-border rounded-lg max-w-[930px] lg:max-w-[320px]">
              <h3 className="text-lg font-semibold">Synonyms</h3>
              <h6 className="text-sm text-muted-foreground">Also Known As</h6>
              <div className="flex flex-wrap gap-2 mt-2">
                {entry.synonyms.map((synonym, index) => (
                  <p
                    key={index}
                    className="px-2 py-1 border border-border text-muted-foreground rounded-2xl"
                  >
                    {synonym}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* GRAS Info */}
          {entry.gras_info?.found !== undefined && (
            <div className="flex items-center justify-between my-3 p-4 border border-border rounded-lg max-w-[930px] lg:max-w-[320px]">
              <div>
                <h6 className="text-xs">{entry.name}</h6>
                <h3 className="text-xl font-semibold">
                  {entry.gras_info.found ? 'Is on FDAs GRAS list' : 'Is not on FDAs GRAS list'}
                </h3>
              </div>
              {entry.gras_info.reference_url && (
                <a
                  href={entry.gras_info.reference_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink />
                </a>
              )}
            </div>
          )}

          {/* Cell Info */}
          {entry.cell_info.length > 0 &&
            entry.cell_info.some(cell => cell.cellType && cell.cellType.trim() !== '') && (
              <div className="my-3 p-4 border border-border rounded-lg max-w-[930px] lg:max-w-[320px]">
                <p className="font-semibold">Tested On</p>
                <h6 className="text-sm text-muted-foreground">Cell Type - Success Rate</h6>
                <div className="flex flex-col gap-1 mt-2.5">
                  {entry.cell_info.map((cell, index) => (
                    <p key={index} className="flex justify-between items-center">
                      <span>{cell.cellType}</span>
                      {cell.referenceURL && cell.referenceURL.trim() !== '' ? (
                        <a
                          href={cell.referenceURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-muted-foreground hover:underline"
                        >
                          <span>{cell.successRate && `(${cell.successRate}%)`}</span>
                          <MoveUpRight height={18} />
                        </a>
                      ) : (
                        <span className="flex items-center gap-0.5 text-muted-foreground">
                          {cell.successRate && `(${cell.successRate}%)`}
                        </span>
                      )}
                    </p>
                  ))}
                </div>
              </div>
            )}

          {/* Structure Image */}
          {entry.structure_image && (
            <div className="my-3 p-4 border border-border rounded-lg max-w-[930px] lg:max-w-[320px] bg-transparent">
              <img
                className="w-full max-w-[400px] rounded-lg dark:bg-white"
                alt="structural diagram"
                src={entry.structure_image}
              />
            </div>
          )}

          {/* Safety Document */}
          {entry.safety_document_sheet && (
            <div className="flex items-center justify-between my-3 p-4 border border-border rounded-lg max-w-[930px] lg:max-w-[320px]">
              <div>
                <h6 className="text-sm">Safety Document Sheet</h6>
                <h3 className="text-base">{entry.name} SDS</h3>
              </div>
              <a
                href={entry.safety_document_sheet}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl text-muted-foreground"
              >
                <MoveUpRight />
              </a>
            </div>
          )}

          {/* Powered By */}
          <div className="flex items-center justify-between my-3 p-4 border border-border rounded-lg max-w-[930px] lg:max-w-[320px]">
            <div>
              <h5 className="text-sm">Powered By</h5>
              <h1 className="text-2xl font-bold">CryoDAO</h1>
            </div>
            <Image
              className="h-11 w-11 invert-0 dark:invert"
              alt="CryoDao Logo"
              src="/assets/cryodao.svg"
              height={44}
              width={44}
            />
          </div>
        </div>
      </div>
    </div>
  );
}