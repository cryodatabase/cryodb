// types.ts
interface PropertyFilter {
  prop_type: string;
  unit?: string;
  min_value?: number;
  max_value?: number;
  raw_value?: string;
}

const PROPERTY_DEFINITIONS = {
  MOLECULAR_MASS: { label: "Molecular Mass", defaultUnit: "g/mol", units: ["g/mol", "Da", "kDa"], type: "numeric" },
  SOLUBILITY: { label: "Solubility", defaultUnit: "mg/mL", units: ["mg/mL", "g/100 mL", "% w/v"], type: "numeric" },
  VISCOSITY: { label: "Viscosity", defaultUnit: "mPa.s", units: ["mPa.s", "cP"], type: "numeric" },
  TG_PRIME: { label: "Tg'", defaultUnit: "degC", units: ["degC", "degK"], type: "numeric" },
  PARTITION_COEFFICIENT: { label: "Partition Coefficient", defaultUnit: "logP", units: ["logP"], type: "numeric" },
  DIELECTRIC_CONSTANT: { label: "Dielectric Constant", defaultUnit: "", units: [], type: "numeric" },
  THERMAL_CONDUCTIVITY: { label: "Thermal Conductivity", defaultUnit: "W/(m.K)", units: ["W/(m.K)"], type: "numeric" },
  HEAT_CAPACITY: { label: "Heat Capacity", defaultUnit: "J/(mol.K)", units: ["J/(mol.K)", "cal/(mol.K)"], type: "numeric" },
  THERMAL_EXPANSION_COEFFICIENT: { label: "Thermal Expansion Coefficient", defaultUnit: "1/K", units: ["1/K"], type: "numeric" },
  CRYSTALLIZATION_TEMPERATURE: { label: "Crystallization Temperature", defaultUnit: "degC", units: ["degC", "degK"], type: "numeric" },
  DIFFUSION_COEFFICIENT: { label: "Diffusion Coefficient", defaultUnit: "m2/s", units: ["m2/s", "cm2/s"], type: "numeric" },
  HYDROGEN_BOND_DONORS_ACCEPTORS: { label: "Hydrogen Bond Donors/Acceptors", defaultUnit: "count", units: ["count"], type: "numeric" },
  SOURCE_OF_COMPOUND: { label: "Source of Compound", defaultUnit: "text", units: ["text"], type: "text" },
  GRAS_CERTIFICATION: { label: "GRAS Certification", defaultUnit: "boolean", units: ["boolean"], type: "boolean" },
  MELTING_POINT: { label: "Melting Point", defaultUnit: "degC", units: ["degC", "degK"], type: "numeric" },
  HYDROPHOBICITY: { label: "Hydrophobicity", defaultUnit: "qualitative", units: ["qualitative"], type: "text" },
  DENSITY: { label: "Density", defaultUnit: "g/cm3", units: ["g/cm3", "kg/m3"], type: "numeric" },
  REFRACTIVE_INDEX: { label: "Refractive Index", defaultUnit: "", units: [], type: "numeric" },
  SURFACE_TENSION: { label: "Surface Tension", defaultUnit: "mN/m", units: ["mN/m", "dyn/cm"], type: "numeric" },
  PH: { label: "pH", defaultUnit: "", units: [], type: "numeric" },
  OSMOLALITY_OSMOLARITY: { label: "Osmolality/Osmolarity", defaultUnit: "Osmol/kg", units: ["Osmol/kg", "Osmol/L"], type: "numeric" },
  POLAR_SURFACE_AREA: { label: "Polar Surface Area", defaultUnit: "A2", units: ["A2"], type: "numeric" },
} as const;

type PropertyType = keyof typeof PROPERTY_DEFINITIONS;

/**
 * Decodes a URI query string into an array of PropertyFilter objects for the /api/chemicals/filter endpoint.
 * @param uri - The full URI or query string (e.g., "/filter/MOLECULAR_MASSMin=100&MOLECULAR_MASSMax=200" or encoded form).
 * @returns An array of PropertyFilter objects compatible with the API.
 * @throws Error if invalid numeric values are provided or if the property is unknown.
 */
export function decodeFiltersFromURI(uri: string): PropertyFilter[] {
  const filters: PropertyFilter[] = [];
  
  // Decode the URI to handle encoded characters like %3D (=) and %26 (&)
  let decodedUri: string;
  try {
    decodedUri = decodeURIComponent(uri);
  } catch {
    throw new Error("Failed to decode URI");
  }

  // Extract query string from URI if it includes a path
  const queryString = decodedUri.includes("?") ? decodedUri.split("?")[1] : decodedUri;
  
  // Parse query string with URLSearchParams
  const params = new URLSearchParams(queryString);

  const propertyKeys = Object.keys(PROPERTY_DEFINITIONS);
  const filterMap: { [key: string]: Partial<PropertyFilter> } = {};

  // Process each parameter
  params.forEach((value, key) => {
    // Match property keys with Min/Max suffixes or direct values
    const minMatch = key.match(/^(.+)Min$/);
    const maxMatch = key.match(/^(.+)Max$/);
    const propKey = minMatch ? minMatch[1] : maxMatch ? maxMatch[1] : key;

    if (!propertyKeys.includes(propKey)) {
      // Skip unknown properties
      return;
    }

    if (!filterMap[propKey]) {
      filterMap[propKey] = { prop_type: propKey };
    }

    const propDef = PROPERTY_DEFINITIONS[propKey as PropertyType];

    if (minMatch) {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        throw new Error(`Invalid min value for ${propDef.label}: ${value}`);
      }
      filterMap[propKey].min_value = numValue;
    } else if (maxMatch) {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        throw new Error(`Invalid max value for ${propDef.label}: ${value}`);
      }
      filterMap[propKey].max_value = numValue;
    } else if (propDef.type === "text" || propDef.type === "boolean") {
      filterMap[propKey].raw_value = value;
    }

    // Assign default unit from PROPERTY_DEFINITIONS
    filterMap[propKey].unit = propDef.defaultUnit || undefined;
  });

  // Convert filterMap to array, only including filters with values
  Object.values(filterMap).forEach((filter) => {
    if (filter.min_value !== undefined || filter.max_value !== undefined || filter.raw_value !== undefined) {
      filters.push(filter as PropertyFilter);
    }
  });

  return filters;
}