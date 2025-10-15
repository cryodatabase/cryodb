// Unit conversion utilities for chemical property filtering
// All conversions normalize to a base unit for each property type

export type PropertyType = 
  | 'MOLECULAR_MASS'
  | 'SOLUBILITY'
  | 'VISCOSITY'
  | 'TG_PRIME'
  | 'PARTITION_COEFFICIENT'
  | 'DIELECTRIC_CONSTANT'
  | 'THERMAL_CONDUCTIVITY'
  | 'HEAT_CAPACITY'
  | 'MELTING_POINT'
  | 'BOILING_POINT'
  | 'DENSITY'
  | 'REFRACTIVE_INDEX'
  | 'SURFACE_TENSION'
  | 'VAPOR_PRESSURE'
  | 'THERMAL_EXPANSION_COEFFICIENT'
  | 'IONIZATION_ENERGY'
  | 'DIPOLE_MOMENT'
  | 'CRITICAL_TEMP'
  | 'CRITICAL_PRESSURE'
  | 'ENTHALPY_FUSION'
  | 'ENTHALPY_VAP'
  | 'HYDROGEN_BOND_DONORS'
  | 'HYDROGEN_BOND_ACCEPTORS'
  | 'DIFFUSION_COEFFICIENT'
  | 'CRYSTALLIZATION_TEMPERATURE'
  | 'OSMOLALITY_OSMOLARITY'
  | 'POLAR_SURFACE_AREA'
  | 'PH';

// Base units for each property type (what we normalize everything to)
export const BASE_UNITS: Record<PropertyType, string> = {
  MOLECULAR_MASS: 'g/mol',
  SOLUBILITY: 'mg/mL',
  VISCOSITY: 'mPa.s',
  TG_PRIME: 'degC',
  PARTITION_COEFFICIENT: 'logP',
  DIELECTRIC_CONSTANT: 'dimensionless',
  THERMAL_CONDUCTIVITY: 'W/(m.K)',
  HEAT_CAPACITY: 'J/(mol.K)',
  MELTING_POINT: 'degC',
  BOILING_POINT: 'degC',
  DENSITY: 'g/cm3',
  REFRACTIVE_INDEX: 'dimensionless',
  SURFACE_TENSION: 'mN/m',
  VAPOR_PRESSURE: 'mmHg',
  THERMAL_EXPANSION_COEFFICIENT: '1/K',
  IONIZATION_ENERGY: 'eV',
  DIPOLE_MOMENT: 'D',
  CRITICAL_TEMP: 'degC',
  CRITICAL_PRESSURE: 'bar',
  ENTHALPY_FUSION: 'kJ/mol',
  ENTHALPY_VAP: 'kJ/mol',
  HYDROGEN_BOND_DONORS: 'count',
  HYDROGEN_BOND_ACCEPTORS: 'count',
  DIFFUSION_COEFFICIENT: 'm2/s',
  CRYSTALLIZATION_TEMPERATURE: 'degC',
  OSMOLALITY_OSMOLARITY: 'Osmol/kg',
  POLAR_SURFACE_AREA: 'A2',
  PH: ''
};

// Conversion factors: multiply value by this factor to get base unit
type ConversionFactors = Record<string, number>;
type PropertyConversions = Partial<Record<PropertyType, ConversionFactors>>;

export const CONVERSION_FACTORS: PropertyConversions = {
  MOLECULAR_MASS: {
    'g/mol': 1,
    'Da': 1,        // Dalton = g/mol
    'kDa': 1000     // kiloDalton = 1000 g/mol
  },
  SOLUBILITY: {
    'mg/mL': 1,
    'g/100 mL': 10,     // 1 g/100mL = 10 mg/mL
    '% w/v': 10,        // 1% w/v = 10 mg/mL
    // Note: mM cannot be converted without molecular weight - excluded
  },
  VISCOSITY: {
    'mPa.s': 1,
    'cP': 1,            // centiPoise = mPa.s
    'Pa.s': 1000,       // 1 Pa.s = 1000 mPa.s
    'P': 100            // 1 Poise = 100 cP = 100 mPa.s
  },
  TG_PRIME: {
    'degC': 1,
    'degK': 1,          // Kelvin offset handled separately
    'degF': 5/9         // °F conversion: (F-32)*5/9 = C
  },
  MELTING_POINT: {
    'degC': 1,
    'degK': 1,
    'degF': 5/9
  },
  BOILING_POINT: {
    'degC': 1,
    'degK': 1,
    'degF': 5/9
  },
  CRITICAL_TEMP: {
    'degC': 1,
    'degK': 1,
    'degF': 5/9
  },
  DENSITY: {
    'g/cm3': 1,
    'g/mL': 1,          // same as g/cm3
    'kg/L': 1,          // same as g/cm3
    'kg/m3': 0.001,     // 1 kg/m3 = 0.001 g/cm3
    'g/L': 0.001        // 1 g/L = 0.001 g/cm3
  },
  THERMAL_CONDUCTIVITY: {
    'W/(m.K)': 1,
    'mW/(m.K)': 0.001,
    'cal/(s.cm.degC)': 418.4
  },
  HEAT_CAPACITY: {
    'J/(mol.K)': 1,
    'cal/(mol.K)': 4.184
    // Note: J/(g·K) cannot be converted without molecular weight - excluded
  },
  SURFACE_TENSION: {
    'mN/m': 1,
    'dyn/cm': 1,        // dyn/cm = mN/m
    'N/m': 1000         // 1 N/m = 1000 mN/m
  },
  VAPOR_PRESSURE: {
    'mmHg': 1,
    'Torr': 1,          // Torr = mmHg
    'atm': 760,         // 1 atm = 760 mmHg
    'kPa': 7.50062,     // 1 kPa = 7.50062 mmHg
    'Pa': 0.00750062,   // 1 Pa = 0.00750062 mmHg
    'bar': 750.062      // 1 bar = 750.062 mmHg
  },
  CRITICAL_PRESSURE: {
    'bar': 1,
    'atm': 1.01325,
    'MPa': 10,
    'kPa': 0.01,
    'Pa': 0.00001,
    'psi': 0.0689476
  },
  ENTHALPY_FUSION: {
    'kJ/mol': 1,
    'J/mol': 0.001,
    'kcal/mol': 4.184,
    'cal/mol': 0.004184
  },
  ENTHALPY_VAP: {
    'kJ/mol': 1,
    'J/mol': 0.001,
    'kcal/mol': 4.184,
    'cal/mol': 0.004184
  },
  IONIZATION_ENERGY: {
    'eV': 1,
    'kJ/mol': 0.0103643,
    'kcal/mol': 0.0433641
  },
  DIPOLE_MOMENT: {
    'D': 1,             // Debye
    'C·m': 2.99792458e29  // Coulomb-meter
  },
  THERMAL_EXPANSION_COEFFICIENT: {
    '1/K': 1,
    '1/°C': 1,
    'ppm/K': 0.000001,
    'ppm/°C': 0.000001
  },
  DIFFUSION_COEFFICIENT: {
    'm2/s': 1,
    'cm2/s': 0.0001     // 1 cm²/s = 0.0001 m²/s
  },
  CRYSTALLIZATION_TEMPERATURE: {
    'degC': 1,
    'degK': 1
  },
  OSMOLALITY_OSMOLARITY: {
    'Osmol/kg': 1,
    'Osmol/L': 1        // Approximately equal for dilute solutions
  },
  POLAR_SURFACE_AREA: {
    'A2': 1             // Angstrom squared (Ų)
  },
  PH: {
    '': 1               // pH is dimensionless, no conversion
  }
};

/**
 * Convert a value from one unit to the base unit for a property
 */
export function convertToBaseUnit(
  value: number,
  fromUnit: string,
  propertyType: PropertyType
): number {
  const conversions = CONVERSION_FACTORS[propertyType];
  
  if (!conversions) {
    // No conversion defined, return as-is
    return value;
  }

  const factor = conversions[fromUnit];
  
  if (factor === undefined) {
    // Unknown unit, return as-is
    console.warn(`Unknown unit "${fromUnit}" for property "${propertyType}"`);
    return value;
  }

  // Handle temperature offsets (for Kelvin and Fahrenheit)
  if (['TG_PRIME', 'MELTING_POINT', 'BOILING_POINT', 'CRITICAL_TEMP', 'CRYSTALLIZATION_TEMPERATURE'].includes(propertyType)) {
    if (fromUnit === 'degK') {
      return value - 273.15;  // K to °C
    } else if (fromUnit === 'degF') {
      return (value - 32) * 5/9;  // °F to °C
    }
  }

  return value * factor;
}

/**
 * Convert a value from base unit to a specific unit
 */
export function convertFromBaseUnit(
  value: number,
  toUnit: string,
  propertyType: PropertyType
): number {
  const conversions = CONVERSION_FACTORS[propertyType];
  
  if (!conversions) {
    return value;
  }

  const factor = conversions[toUnit];
  
  if (factor === undefined) {
    console.warn(`Unknown unit "${toUnit}" for property "${propertyType}"`);
    return value;
  }

  // Handle temperature offsets
  if (['TG_PRIME', 'MELTING_POINT', 'BOILING_POINT', 'CRITICAL_TEMP', 'CRYSTALLIZATION_TEMPERATURE'].includes(propertyType)) {
    if (toUnit === 'degK') {
      return value + 273.15;  // °C to K
    } else if (toUnit === 'degF') {
      return value * 9/5 + 32;  // °C to °F
    }
  }

  return value / factor;
}

/**
 * Get the base unit for a property type
 */
export function getBaseUnit(propertyType: PropertyType): string {
  return BASE_UNITS[propertyType] || 'unknown';
}