/*import { 
  type Paper, 
  type PaperData,
  type CpaChemical,
  type NamesSynonymsView,
  type PropertiesView,
  CryopreservationComponent,
  PropertyFilter
} from "./schema";
import { pool } from "./db";
import { convertToBaseUnit, getBaseUnit, CONVERSION_FACTORS, type PropertyType } from './unitConversion';

/**
 * Generate SQL expression to convert a database value to its base unit
 * This creates a CASE statement that handles all possible units for a property
 * /
function buildUnitConversionSQL(propertyType: PropertyType, valueColumn: string): string {
  const conversions = CONVERSION_FACTORS[propertyType as PropertyType];
  //const baseUnit = getBaseUnit(propertyType as PropertyType);
  
  if (!conversions) {
    // No conversions defined, return value as-is
    return valueColumn;
  }

  const cases: string[] = [];
  
  // Build CASE statement for each unit
  Object.entries(conversions).forEach(([unit, factor]) => {
    // Handle temperature conversions with offsets
    if (['TG_PRIME', 'MELTING_POINT', 'BOILING_POINT', 'CRITICAL_TEMP', 'CRYSTALLIZATION_TEMPERATURE'].includes(propertyType)) {
      if (unit === 'degK') {
        cases.push(`WHEN cpv.unit = '${unit}' THEN ${valueColumn} - 273.15`);
      } else if (unit === 'degF') {
        cases.push(`WHEN cpv.unit = '${unit}' THEN (${valueColumn} - 32) * 5.0/9.0`);
      } else {
        cases.push(`WHEN cpv.unit = '${unit}' THEN ${valueColumn} * ${factor}`);
      }
    } else {
      cases.push(`WHEN cpv.unit = '${unit}' THEN ${valueColumn} * ${factor}`);
    }
  });

  // Default case: return value unchanged if unit not recognized
  cases.push(`ELSE ${valueColumn}`);

  return `(CASE ${cases.join(' ')} END)`;
}

export interface IStorage {
  getPaper(id: string): Promise<Paper | undefined>;
  getPaperByPaperId(paperId: string): Promise<Paper | undefined>;
  getPaperById(id: string): Promise<Paper | undefined>;
  getAllPapers(): Promise<Paper[]>;
  searchPapers(query: string): Promise<Paper[]>;
  
  // ChemSpider-style chemical methods
  getChemicalEmbeddings(id: string): Promise<CpaChemical | undefined>;
  getAllChemicals(): Promise<CpaChemical[]>;
  searchChemicals(query: string): Promise<CpaChemical[]>;
  semanticSearchChemicals(embedding: number[]): Promise<CpaChemical[]>;
  getChemicalNames(id: string): Promise<NamesSynonymsView[]>;
  getChemicalProperties(id: string): Promise<PropertiesView[]>;
  getChemicalPropertiesFromName(name: string): Promise<PropertiesView[]>;

  // Chemical filtering by properties
  filterChemicalsByProperties(filters: PropertyFilter[]): Promise<CpaChemical[]>;
}

export class MemStorage implements IStorage {
  private papers: Map<number, Paper>;
  private currentId: number;

  constructor() {
    this.papers = new Map();
    this.currentId = 1;
  }

  async getPaper(id: string): Promise<Paper | undefined> {
    const numId = parseInt(id);
    return this.papers.get(numId);
  }

  async getPaperByPaperId(paperId: string): Promise<Paper | undefined> {
    return Array.from(this.papers.values()).find(
      (paper) => paper.paper_id === paperId,
    );
  }

  async getPaperById(id: string): Promise<Paper | undefined> {
    return Array.from(this.papers.values()).find(
      (paper) => paper.id === id,
    );
  }

  async getAllPapers(): Promise<Paper[]> {
    return Array.from(this.papers.values());
  }

  async searchPapers(query: string): Promise<Paper[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.papers.values()).filter(paper => {
      const data = paper.cpa_facts_json as PaperData;
      return (
        paper.title.toLowerCase().includes(lowerQuery) ||
        (data && data.experiments && data.experiments.some(exp => 
          exp.label.toLowerCase().includes(lowerQuery) ||
          exp.quote.toLowerCase().includes(lowerQuery)
        )) ||
        (data && data.formulations && data.formulations.some(form => 
          form.label.toLowerCase().includes(lowerQuery) ||
          form.components.some(comp => comp.label.toLowerCase().includes(lowerQuery))
        ))
      );
    });
  }

  // ChemSpider-style chemical methods (placeholder for MemStorage)
  async getChemicalEmbeddings(/*id: string* /): Promise<CpaChemical | undefined> {
    return undefined; // Not implemented for memory storage
  }

  async getAllChemicals(): Promise<CpaChemical[]> {
    return []; // Not implemented for memory storage
  }

  async searchChemicals(/*query: string* /): Promise<CpaChemical[]> {
    return []; // Not implemented for memory storage
  }

  async semanticSearchChemicals(/*embedding: number[]* /): Promise<CpaChemical[]> {
    return []; // Not implemented for memory storage
  }

  async getChemicalNames(/*id: string* /): Promise<NamesSynonymsView[]> {
    return []; // Not implemented for memory storage
  }

  async getChemicalProperties(/*id: string* /): Promise<PropertiesView[]> {
    return []; // Not implemented for memory storage
  }

  async getChemicalPropertiesFromName(/*name: string* /): Promise<PropertiesView[]> {
    return []; // Not implemented for memory storage
  }

  async filterChemicalsByProperties(/*filters: PropertyFilter[]* /): Promise<CpaChemical[]> {
    return []; // Not implemented for memory storage
  }
}

export class DatabaseStorage implements IStorage {
  async getPaper(id: string): Promise<Paper | undefined> {
    const result = await pool.query(`SELECT * FROM papers WHERE id = $1`, [id]);
    if (result.rows.length === 0) return undefined;
    const row = result.rows[0];
    return {
      ...row,
      data: row.cpa_facts_json
    } as Paper;
  }

  async getPaperByPaperId(paperId: string): Promise<Paper | undefined> {
    const result = await pool.query(`SELECT * FROM papers WHERE paper_id = $1`, [paperId]);
    return result.rows[0] as Paper || undefined;
  }

  async getPaperById(id: string): Promise<Paper | undefined> {
    const result = await pool.query(`SELECT * FROM papers WHERE id = $1`, [id]);
    return result.rows[0] as Paper || undefined;
  }

  async getAllPapers(): Promise<Paper[]> {
    const result = await pool.query(`SELECT * FROM papers ORDER BY id DESC`);
    return result.rows.map(row => ({
      ...row,
      data: row.cpa_facts_json
    })) as Paper[];
  }

  async searchPapers(query: string): Promise<Paper[]> {
    if (!query.trim()) {
      return await this.getAllPapers();
    }
    
    const result = await pool.query(
      `SELECT * FROM papers WHERE title ILIKE $1 ORDER BY id DESC`,
      [`%${query}%`]
    );
    return result.rows.map(row => ({
      ...row,
      data: row.cpa_facts_json
    })) as Paper[];
  }

  // ChemSpider-style chemical methods
  async getChemicalEmbeddings(id: string): Promise<CpaChemical | undefined> {
    const result = await pool.query(`SELECT * FROM cpa_chemicals WHERE id = $1`, [id]);
    return result.rows[0] as CpaChemical || undefined;
  }

  async getAllChemicals(): Promise<CpaChemical[]> {
    const result = await pool.query(`
      SELECT DISTINCT c.id, c.inchikey, c.preferred_name, c.role, c.synonyms
      FROM cpa_chemicals c 
      WHERE EXISTS (
        SELECT 1 FROM v_cpa_property_values vpv 
        WHERE vpv.chemical_id = c.id
      )
      ORDER BY c.preferred_name
    `);
    return result.rows as CpaChemical[];
  }

  async searchChemicals(query: string, role?: string): Promise<CpaChemical[]> {
    if (!query.trim() && !role) {
      return await this.getAllChemicals();
    }
    
    const whereConditions = [];
    const params = [];
    let paramIndex = 1;
    
    // Text search in preferred_name and synonyms
    if (query.trim()) {
      whereConditions.push(`(c.preferred_name ILIKE $${paramIndex} 
          OR EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(c.synonyms) AS synonym
            WHERE synonym ILIKE $${paramIndex}
          ))`);
      params.push(`%${query}%`);
      paramIndex++;
    }
    
    // Role filter
    if (role) {
      whereConditions.push(`c.role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }
    
    // Add filter for chemicals that have properties
    whereConditions.push(`EXISTS (
      SELECT 1 FROM v_cpa_property_values vpv 
      WHERE vpv.chemical_id = c.id
    )`);
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    const result = await pool.query(
      `SELECT c.id, c.inchikey, c.preferred_name, c.role, c.synonyms
       FROM cpa_chemicals c 
       ${whereClause}
       GROUP BY c.id, c.inchikey, c.preferred_name, c.role, c.synonyms
       ORDER BY c.preferred_name`,
      params
    );
    return result.rows as CpaChemical[];
  }

  async getChemicalNames(id: string): Promise<NamesSynonymsView[]> {
    const result = await pool.query(`SELECT * FROM v_cpa_names_synonyms WHERE chemical_id = $1`, [id]);
    return result.rows as NamesSynonymsView[];
  }

  /*async getChemicalProperties(id: string): Promise<PropertiesView[]> {
    const result = await pool.query(`SELECT * FROM v_cpa_properties WHERE chemical_id = $1`, [id]);
    return result.rows as PropertiesView[];
  }* /

  async getChemicalProperties(id: string): Promise<PropertiesView[]> {
    // Query property values with their sources, then aggregate in JavaScript
    const result = await pool.query(`
      SELECT
        c.id::text as chemical_id,
        c.preferred_name,
        c.role,
        prop.prop_type,
        cpv.id as value_id,
        cpv.unit,
        cpv.value_kind,
        CASE 
          WHEN cpv.value_kind = 'POINT' THEN cpv.numeric_value::text
          WHEN cpv.value_kind = 'RANGE' THEN cpv.range_min::text || ' - ' || cpv.range_max::text
          ELSE cpv.raw_value
        END as value,
        ref.paper_id,
        ref.quote,
        ref.link,
        p.doi
      FROM cpa_chemicals c
      JOIN chemical_properties prop ON prop.chemical_id = c.id
      JOIN chemical_property_values cpv ON cpv.property_id = prop.id
      LEFT JOIN cpa_references ref ON ref.property_value_id = cpv.id
      LEFT JOIN papers p ON CAST(p.id AS TEXT) = CAST(ref.paper_id AS TEXT)
      WHERE c.id = $1::uuid
      ORDER BY prop.prop_type, cpv.value_kind, value
    `, [id]);

    // Group by prop_type and aggregate property_values
    const propertiesMap = new Map<string, PropertiesView>();
    
    result.rows.forEach((row) => {
      const key = row.prop_type;
      
      if (!propertiesMap.has(key)) {
        propertiesMap.set(key, {
          chemical_id: row.chemical_id,
          preferred_name: row.preferred_name,
          role: row.role,
          prop_type: row.prop_type,
          property_values: []
        });
      }
      
      const property = propertiesMap.get(key)!;
      
      // Find or create property value entry
      let propertyValue = property.property_values.find(
        pv => pv.value === row.value && pv.unit === row.unit
      );
      
      if (!propertyValue) {
        propertyValue = {
          value: row.value,
          unit: row.unit,
          sources: []
        };
        property.property_values.push(propertyValue);
      }
      
      // Add source with proper deduplication
      // Deduplicate by quote when present (same quote = same source, regardless of paper_id)
      // For sources without quotes, deduplicate by (paper_id + link) to preserve distinct references
      const isDuplicate = row.quote 
        ? propertyValue.sources.some(s => s.quote === row.quote)
        : row.paper_id && propertyValue.sources.some(s => 
            s.paper_id === row.paper_id && 
            s.link === row.link && 
            !s.quote
          );
      
      if (!isDuplicate && (row.quote || row.paper_id || row.link)) {
        propertyValue.sources.push({
          paper_id: row.paper_id,
          doi: row.doi,
          link: row.link,
          quote: row.quote,
          experiment_quote: null
        });
      }
    });

    return Array.from(propertiesMap.values());
  }

  async getChemicalPropertiesFromName(name: string): Promise<PropertiesView[]> {
    //const result = await pool.query(`SELECT * FROM v_cpa_properties WHERE preferred_name = $1`, [name]);
    const result = await pool.query(`SELECT * FROM v_cpa_property_values WHERE preferred_name = $1`, [name]);
    console.log(result.rows);
    /*const result = await pool.query(`SELECT DISTINCT
        c.inchikey,
        c.preferred_name,
        c.role,
        c.synonyms,
        vp.*
    FROM cpa_chemicals c
    JOIN v_cpa_properties vp
        ON c.preferred_name = vp.preferred_name
    WHERE EXISTS (
        SELECT 1 
        FROM v_cpa_property_values vpv
        WHERE vpv.chemical_id = c.id
    )
    AND vp.preferred_name = $1
    ORDER BY c.preferred_name;
    `, [name]);* /
    return result.rows as PropertiesView[];
  }

  async semanticSearchChemicals(embedding: number[]): Promise<CpaChemical[]> {
    const vectorStr = `[${embedding.join(',')}]`;
    
    // Use the v_cpa_alias_embeddings view with filter for chemicals that have properties
    const result = await pool.query(`
      SELECT DISTINCT 
        vae.chemical_id as id,
        vae.inchikey,
        vae.preferred_name,
        vae.role
      FROM v_cpa_alias_embeddings vae
      WHERE EXISTS (
        SELECT 1 FROM v_cpa_property_values vpv 
        WHERE vpv.chemical_id = vae.chemical_id
      )
      ORDER BY vae.embedding <-> $1::vector
      LIMIT 20
    `, [vectorStr]);
    
    return result.rows as CpaChemical[];
  }

  // Get experiments and formulations for a paper using the new view
  //async getPaperExperimentsAndFormulations(paperId: string): Promise<any[]> {
  async getPaperExperimentsAndFormulations(paperId: string): Promise<CryopreservationComponent[]> {
    const result = await pool.query(`
      SELECT *
      FROM v_paper_experiments_formulations_new
      WHERE paper_id = $1
      ORDER BY experiment_id, formulation_id, component_id
    `, [paperId]);
    
    return result.rows;
  }

  async filterChemicalsByProperties(filters: PropertyFilter[]): Promise<CpaChemical[]> {
    if (!filters || filters.length === 0) {
      return this.getAllChemicals();
    }

    // Build the SQL query dynamically based on filters
    const filterConditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    filters.forEach((filter) => {
      const conditions: string[] = [];
      const propertyType = filter.prop_type as PropertyType;
      
      // Property type condition
      conditions.push(`prop.prop_type = $${paramIndex}`);
      params.push(filter.prop_type);
      paramIndex++;

      // Numeric range filtering with unit conversion
      if (filter.min_value !== undefined || filter.max_value !== undefined) {
        // Convert user's input values to base unit
        const baseUnit = getBaseUnit(propertyType);
        const userUnit = filter.unit || baseUnit;
        
        // Generate SQL expression to convert database values to base unit
        const convertedPointValue = buildUnitConversionSQL(
          propertyType,
          'cpv.numeric_value'
        );
        const convertedRangeMin = buildUnitConversionSQL(
          propertyType,
          'cpv.range_min'
        );
        const convertedRangeMax = buildUnitConversionSQL(
          propertyType,
          'cpv.range_max'
        );

        if (filter.min_value !== undefined) {
          // Convert user's min value to base unit
          const normalizedMinValue = convertToBaseUnit(
            filter.min_value,
            userUnit,
            propertyType
          );
          
          // value_max >= min_value (checking if max of range is above our minimum)
          conditions.push(`
            (CASE cpv.value_kind
              WHEN 'POINT' THEN ${convertedPointValue}
              WHEN 'RANGE' THEN ${convertedRangeMax}
              ELSE NULL
            END) >= $${paramIndex}
          `);
          params.push(normalizedMinValue);
          paramIndex++;
        }
        
        if (filter.max_value !== undefined) {
          // Convert user's max value to base unit
          const normalizedMaxValue = convertToBaseUnit(
            filter.max_value,
            userUnit,
            propertyType
          );
          
          // value_min <= max_value (checking if min of range is below our maximum)
          conditions.push(`
            (CASE cpv.value_kind
              WHEN 'POINT' THEN ${convertedPointValue}
              WHEN 'RANGE' THEN ${convertedRangeMin}
              ELSE NULL
            END) <= $${paramIndex}
          `);
          params.push(normalizedMaxValue);
          paramIndex++;
        }
      }

      // Raw value filtering (for text properties)
      if (filter.raw_value) {
        conditions.push(`cpv.raw_value ILIKE $${paramIndex}`);
        params.push(`%${filter.raw_value}%`);
        paramIndex++;
      }

      filterConditions.push(`(${conditions.join(' AND ')})`);
    });

    const whereClause = filterConditions.join(' OR ');

    // Use direct JOINs instead of view to avoid permission issues
    const result = await pool.query(`
      SELECT DISTINCT 
        chem.id,
        chem.inchikey,
        chem.preferred_name,
        chem.role
      FROM chemical_property_values AS cpv
      JOIN chemical_properties AS prop ON prop.id = cpv.property_id
      JOIN cpa_chemicals AS chem ON chem.id = prop.chemical_id
      WHERE ${whereClause}
      ORDER BY chem.preferred_name
    `, params);

    return result.rows as CpaChemical[];
  }
}

export const storage = new DatabaseStorage();


// REVIEW CHANGES

/*
import { 
  papers, 
  chemicalAgents, 
  agentProperties, 
  cpaChemicals,
  type Paper, 
  type InsertPaper, 
  type PaperData,
  type CpaChemical,
  type NamesSynonymsView,
  type PropertiesView,
  type FilterablePropertyView,
  type PropertyFilter
} from "./schema";
import { pool } from "./db";
import { eq, ilike, sql } from "drizzle-orm";
import { convertToBaseUnit, getBaseUnit, CONVERSION_FACTORS, type PropertyType } from './unitConversion';

/**
 * Generate SQL expression to convert a database value to its base unit
 * This creates a CASE statement that handles all possible units for a property
 * /
function buildUnitConversionSQL(propertyType: PropertyType, valueColumn: string): string {
  const conversions = CONVERSION_FACTORS[propertyType as PropertyType];
  const baseUnit = getBaseUnit(propertyType as PropertyType);
  
  if (!conversions) {
    // No conversions defined, return value as-is
    return valueColumn;
  }

  const cases: string[] = [];
  
  // Build CASE statement for each unit
  Object.entries(conversions).forEach(([unit, factor]) => {
    // Handle temperature conversions with offsets
    if (['TG_PRIME', 'MELTING_POINT', 'BOILING_POINT', 'CRITICAL_TEMP', 'CRYSTALLIZATION_TEMPERATURE'].includes(propertyType)) {
      if (unit === 'degK') {
        cases.push(`WHEN cpv.unit = '${unit}' THEN ${valueColumn} - 273.15`);
      } else if (unit === 'degF') {
        cases.push(`WHEN cpv.unit = '${unit}' THEN (${valueColumn} - 32) * 5.0/9.0`);
      } else {
        cases.push(`WHEN cpv.unit = '${unit}' THEN ${valueColumn} * ${factor}`);
      }
    } else {
      cases.push(`WHEN cpv.unit = '${unit}' THEN ${valueColumn} * ${factor}`);
    }
  });

  // Default case: return value unchanged if unit not recognized
  cases.push(`ELSE ${valueColumn}`);

  return `(CASE ${cases.join(' ')} END)`;
}

export interface IStorage {
  getPaper(id: string): Promise<Paper | undefined>;
  getPaperByPaperId(paperId: string): Promise<Paper | undefined>;
  getAllPapers(): Promise<Paper[]>;
  searchPapers(query: string): Promise<Paper[]>;
  
  // ChemSpider-style chemical methods
  getChemical(id: string): Promise<CpaChemical | undefined>;
  getAllChemicals(): Promise<CpaChemical[]>;
  searchChemicals(query: string, role?: string): Promise<CpaChemical[]>;
  semanticSearchChemicals(embedding: number[]): Promise<CpaChemical[]>;
  getChemicalNames(id: string): Promise<NamesSynonymsView[]>;
  getChemicalProperties(id: string): Promise<PropertiesView[]>;
  
  // Chemical filtering by properties
  filterChemicalsByProperties(filters: PropertyFilter[]): Promise<CpaChemical[]>;
}

export class DatabaseStorage implements IStorage {
  async getPaper(id: string): Promise<Paper | undefined> {
    const result = await pool.query(`SELECT * FROM papers WHERE id = $1`, [id]);
    if (result.rows.length === 0) return undefined;
    const row = result.rows[0];
    return {
      ...row,
      data: row.cpa_facts_json
    } as Paper;
  }

  async getPaperByPaperId(paperId: string): Promise<Paper | undefined> {
    const result = await pool.query(`SELECT * FROM papers WHERE paper_id = $1`, [paperId]);
    return result.rows[0] as Paper || undefined;
  }

  async getAllPapers(): Promise<Paper[]> {
    const result = await pool.query(`SELECT * FROM papers ORDER BY id DESC`);
    return result.rows.map(row => ({
      ...row,
      data: row.cpa_facts_json
    })) as Paper[];
  }

  async searchPapers(query: string): Promise<Paper[]> {
    if (!query.trim()) {
      return await this.getAllPapers();
    }
    
    const result = await pool.query(
      `SELECT * FROM papers WHERE title ILIKE $1 ORDER BY id DESC`,
      [`%${query}%`]
    );
    return result.rows.map(row => ({
      ...row,
      data: row.cpa_facts_json
    })) as Paper[];
  }

  // ChemSpider-style chemical methods
  async getChemical(id: string): Promise<CpaChemical | undefined> {
    const result = await pool.query(`SELECT * FROM cpa_chemicals WHERE id = $1`, [id]);
    return result.rows[0] as CpaChemical || undefined;
  }

  async getAllChemicals(): Promise<CpaChemical[]> {
    const result = await pool.query(`
      SELECT DISTINCT c.id, c.inchikey, c.preferred_name, c.role, c.synonyms
      FROM cpa_chemicals c 
      WHERE EXISTS (
        SELECT 1 FROM v_cpa_property_values vpv 
        WHERE vpv.chemical_id = c.id
      )
      ORDER BY c.preferred_name
    `);
    return result.rows as CpaChemical[];
  }

  async searchChemicals(query: string, role?: string): Promise<CpaChemical[]> {
    if (!query.trim() && !role) {
      return await this.getAllChemicals();
    }
    
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;
    
    // Text search in preferred_name and synonyms
    if (query.trim()) {
      whereConditions.push(`(c.preferred_name ILIKE $${paramIndex} 
          OR EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(c.synonyms) AS synonym
            WHERE synonym ILIKE $${paramIndex}
          ))`);
      params.push(`%${query}%`);
      paramIndex++;
    }
    
    // Role filter
    if (role) {
      whereConditions.push(`c.role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }
    
    // Add filter for chemicals that have properties
    whereConditions.push(`EXISTS (
      SELECT 1 FROM v_cpa_property_values vpv 
      WHERE vpv.chemical_id = c.id
    )`);
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    const result = await pool.query(
      `SELECT c.id, c.inchikey, c.preferred_name, c.role, c.synonyms
       FROM cpa_chemicals c 
       ${whereClause}
       GROUP BY c.id, c.inchikey, c.preferred_name, c.role, c.synonyms
       ORDER BY c.preferred_name`,
      params
    );
    return result.rows as CpaChemical[];
  }

  async getChemicalNames(id: string): Promise<NamesSynonymsView[]> {
    const result = await pool.query(`SELECT * FROM v_cpa_names_synonyms WHERE chemical_id = $1`, [id]);
    return result.rows as NamesSynonymsView[];
  }

  async getChemicalProperties(id: string): Promise<PropertiesView[]> {
    // Query property values with their sources, then aggregate in JavaScript
    const result = await pool.query(`
      SELECT
        c.id::text as chemical_id,
        c.preferred_name,
        c.role,
        prop.prop_type,
        cpv.id as value_id,
        cpv.unit,
        cpv.value_kind,
        CASE 
          WHEN cpv.value_kind = 'POINT' THEN cpv.numeric_value::text
          WHEN cpv.value_kind = 'RANGE' THEN cpv.range_min::text || ' - ' || cpv.range_max::text
          ELSE cpv.raw_value
        END as value,
        ref.paper_id,
        ref.quote,
        ref.link,
        p.doi
      FROM cpa_chemicals c
      JOIN chemical_properties prop ON prop.chemical_id = c.id
      JOIN chemical_property_values cpv ON cpv.property_id = prop.id
      LEFT JOIN cpa_references ref ON ref.property_value_id = cpv.id
      LEFT JOIN papers p ON CAST(p.id AS TEXT) = CAST(ref.paper_id AS TEXT)
      WHERE c.id = $1::uuid
      ORDER BY prop.prop_type, cpv.value_kind, value
    `, [id]);

    // Group by prop_type and aggregate property_values
    const propertiesMap = new Map<string, PropertiesView>();
    
    result.rows.forEach((row: any) => {
      const key = row.prop_type;
      
      if (!propertiesMap.has(key)) {
        propertiesMap.set(key, {
          chemical_id: row.chemical_id,
          preferred_name: row.preferred_name,
          role: row.role,
          prop_type: row.prop_type,
          property_values: []
        });
      }
      
      const property = propertiesMap.get(key)!;
      
      // Find or create property value entry
      let propertyValue = property.property_values.find(
        pv => pv.value === row.value && pv.unit === row.unit
      );
      
      if (!propertyValue) {
        propertyValue = {
          value: row.value,
          unit: row.unit,
          sources: []
        };
        property.property_values.push(propertyValue);
      }
      
      // Add source with proper deduplication
      // Deduplicate by quote when present (same quote = same source, regardless of paper_id)
      // For sources without quotes, deduplicate by (paper_id + link) to preserve distinct references
      const isDuplicate = row.quote 
        ? propertyValue.sources.some(s => s.quote === row.quote)
        : row.paper_id && propertyValue.sources.some(s => 
            s.paper_id === row.paper_id && 
            s.link === row.link && 
            !s.quote
          );
      
      if (!isDuplicate && (row.quote || row.paper_id || row.link)) {
        propertyValue.sources.push({
          paper_id: row.paper_id,
          doi: row.doi,
          link: row.link,
          quote: row.quote,
          experiment_quote: null
        });
      }
    });

    return Array.from(propertiesMap.values());
  }

  async semanticSearchChemicals(embedding: number[]): Promise<CpaChemical[]> {
    const vectorStr = `[${embedding.join(',')}]`;
    
    // Use the v_cpa_alias_embeddings view with filter for chemicals that have properties
    const result = await pool.query(`
      SELECT DISTINCT 
        vae.chemical_id as id,
        vae.inchikey,
        vae.preferred_name,
        vae.role
      FROM v_cpa_alias_embeddings vae
      WHERE EXISTS (
        SELECT 1 FROM v_cpa_property_values vpv 
        WHERE vpv.chemical_id = vae.chemical_id
      )
      ORDER BY vae.embedding <-> $1::vector
      LIMIT 20
    `, [vectorStr]);
    
    return result.rows as CpaChemical[];
  }

  async filterChemicalsByProperties(filters: PropertyFilter[]): Promise<CpaChemical[]> {
    if (!filters || filters.length === 0) {
      return this.getAllChemicals();
    }

    // Build the SQL query dynamically based on filters
    const filterConditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    filters.forEach((filter) => {
      const conditions: string[] = [];
      const propertyType = filter.prop_type as PropertyType;
      
      // Property type condition
      conditions.push(`prop.prop_type = $${paramIndex}`);
      params.push(filter.prop_type);
      paramIndex++;

      // Numeric range filtering with unit conversion
      if (filter.min_value !== undefined || filter.max_value !== undefined) {
        // Convert user's input values to base unit
        const baseUnit = getBaseUnit(propertyType);
        const userUnit = filter.unit || baseUnit;
        
        // Generate SQL expression to convert database values to base unit
        const convertedPointValue = buildUnitConversionSQL(
          propertyType,
          'cpv.numeric_value'
        );
        const convertedRangeMin = buildUnitConversionSQL(
          propertyType,
          'cpv.range_min'
        );
        const convertedRangeMax = buildUnitConversionSQL(
          propertyType,
          'cpv.range_max'
        );

        if (filter.min_value !== undefined) {
          // Convert user's min value to base unit
          const normalizedMinValue = convertToBaseUnit(
            filter.min_value,
            userUnit,
            propertyType
          );
          
          // value_max >= min_value (checking if max of range is above our minimum)
          conditions.push(`
            (CASE cpv.value_kind
              WHEN 'POINT' THEN ${convertedPointValue}
              WHEN 'RANGE' THEN ${convertedRangeMax}
              ELSE NULL
            END) >= $${paramIndex}
          `);
          params.push(normalizedMinValue);
          paramIndex++;
        }
        
        if (filter.max_value !== undefined) {
          // Convert user's max value to base unit
          const normalizedMaxValue = convertToBaseUnit(
            filter.max_value,
            userUnit,
            propertyType
          );
          
          // value_min <= max_value (checking if min of range is below our maximum)
          conditions.push(`
            (CASE cpv.value_kind
              WHEN 'POINT' THEN ${convertedPointValue}
              WHEN 'RANGE' THEN ${convertedRangeMin}
              ELSE NULL
            END) <= $${paramIndex}
          `);
          params.push(normalizedMaxValue);
          paramIndex++;
        }
      }

      // Raw value filtering (for text properties)
      if (filter.raw_value) {
        conditions.push(`cpv.raw_value ILIKE $${paramIndex}`);
        params.push(`%${filter.raw_value}%`);
        paramIndex++;
      }

      filterConditions.push(`(${conditions.join(' AND ')})`);
    });

    const whereClause = filterConditions.join(' OR ');

    // Use direct JOINs instead of view to avoid permission issues
    const result = await pool.query(`
      SELECT DISTINCT 
        chem.id,
        chem.inchikey,
        chem.preferred_name,
        chem.role
      FROM chemical_property_values AS cpv
      JOIN chemical_properties AS prop ON prop.id = cpv.property_id
      JOIN cpa_chemicals AS chem ON chem.id = prop.chemical_id
      WHERE ${whereClause}
      ORDER BY chem.preferred_name
    `, params);

    return result.rows as CpaChemical[];
  }

  // Get experiments and formulations for a paper using the new view
  async getPaperExperimentsAndFormulations(paperId: string): Promise<any[]> {
    const result = await pool.query(`
      SELECT *
      FROM v_paper_experiments_formulations_new
      WHERE paper_id = $1
      ORDER BY experiment_id, formulation_id, component_id
    `, [paperId]);
    
    return result.rows;
  }
}

export const storage = new DatabaseStorage();
*/

import { 
  papers, 
  chemicalAgents, 
  agentProperties, 
  cpaChemicals,
  type Paper, 
  type InsertPaper, 
  type PaperData,
  type CpaChemical,
  type NamesSynonymsView,
  type PropertiesView,
  type FilterablePropertyView,
  type PropertyFilter,
  type FormulationSearchResult,
  type FormulationDetail,
  type FormulationComponent,
  type FormulationExperiment,
  type FormulationPaper,
  type AdvancedSearchFilters,
  type AdvancedSearchResult,
  type AdvancedSearchExperiment,
  type MoleculeSearchResult,
  type ChemicalAutocompleteResult,
  CryopreservationComponent
} from "./schema";
import { pool } from "./db";
import { eq, ilike, sql } from "drizzle-orm";
import { convertToBaseUnit, getBaseUnit, CONVERSION_FACTORS, type PropertyType } from './unitConversion';

/**
 * Generate SQL expression to convert a database value to its base unit
 * This creates a CASE statement that handles all possible units for a property
 */
function buildUnitConversionSQL(propertyType: PropertyType, valueColumn: string): string {
  const conversions = CONVERSION_FACTORS[propertyType as PropertyType];
  const baseUnit = getBaseUnit(propertyType as PropertyType);
  
  if (!conversions) {
    // No conversions defined, return value as-is
    return valueColumn;
  }

  const cases: string[] = [];
  
  // Build CASE statement for each unit
  Object.entries(conversions).forEach(([unit, factor]) => {
    // Handle temperature conversions with offsets
    if (['TG_PRIME', 'MELTING_POINT', 'BOILING_POINT', 'CRITICAL_TEMP', 'CRYSTALLIZATION_TEMPERATURE'].includes(propertyType)) {
      if (unit === 'degK') {
        cases.push(`WHEN cpv.unit = '${unit}' THEN ${valueColumn} - 273.15`);
      } else if (unit === 'degF') {
        cases.push(`WHEN cpv.unit = '${unit}' THEN (${valueColumn} - 32) * 5.0/9.0`);
      } else {
        cases.push(`WHEN cpv.unit = '${unit}' THEN ${valueColumn} * ${factor}`);
      }
    } else {
      cases.push(`WHEN cpv.unit = '${unit}' THEN ${valueColumn} * ${factor}`);
    }
  });

  // Default case: return value unchanged if unit not recognized
  cases.push(`ELSE ${valueColumn}`);

  return `(CASE ${cases.join(' ')} END)`;
}

export interface PropertyMigration {
  property_id: string;
  prop_type: string;
  value_count: number;
}

export interface PropertyValueForMigration {
  value_id: string;
  prop_type: string;
  value: string;
  unit: string | null;
  value_kind: string;
  reference_count: number;
}

export interface BiologicalContextFilter {
  species?: string;
  organ?: string;
  tissue?: string;
}

export interface FormulationPaginatedResult {
  formulations: FormulationSearchResult[];
  total: number;
  page: number;
  limit: number;
}

export interface IStorage {
  getPaper(id: string): Promise<Paper | undefined>;
  getPaperByPaperId(paperId: string): Promise<Paper | undefined>;
  createPaper(paper: InsertPaper): Promise<Paper>;
  getAllPapers(): Promise<Paper[]>;
  searchPapers(query: string): Promise<Paper[]>;
  filterPapersByBiologicalContext(filter: BiologicalContextFilter): Promise<Paper[]>;
  
  // ChemSpider-style chemical methods
  getChemical(id: string): Promise<CpaChemical | undefined>;
  getAllChemicals(): Promise<CpaChemical[]>;
  searchChemicals(query: string, role?: string, isAdmin?: boolean, includeAll?: boolean): Promise<CpaChemical[]>;
  autocompleteChemicals(query: string, limit?: number, isAdmin?: boolean): Promise<ChemicalAutocompleteResult[]>;
  semanticSearchChemicals(embedding: number[], isAdmin?: boolean): Promise<CpaChemical[]>;
  getChemicalNames(id: string, isAdmin?: boolean): Promise<NamesSynonymsView[]>;
  getChemicalProperties(id: string): Promise<PropertiesView[]>;
  
  // Chemical filtering by properties
  filterChemicalsByProperties(filters: PropertyFilter[]): Promise<CpaChemical[]>;
  getAvailablePropertyTypes(): Promise<string[]>;
  
  // Formulation search and detail
  searchFormulations(query: string, page?: number, limit?: number): Promise<FormulationPaginatedResult>;
  searchFormulationsByChemicals(chemicalIds: string[], page?: number, limit?: number): Promise<FormulationPaginatedResult>;
  getFormulationDetail(formulationId: string): Promise<FormulationDetail | undefined>;
  getChemicalFormulations(chemicalId: string, page?: number, limit?: number): Promise<FormulationPaginatedResult>;
  
  // Advanced search for studies
  advancedSearchStudies(filters: AdvancedSearchFilters): Promise<AdvancedSearchResult[]>;
  advancedSearchMolecules(filters: AdvancedSearchFilters): Promise<MoleculeSearchResult[]>;
  getAvailableBiologicalContextValues(): Promise<{species: string[], organs: string[], tissues: string[], cellTypes: string[]}>;
  getFilteredBiologicalContextValues(chemicalIds?: string[], species?: string, organ?: string, tissue?: string): Promise<{species: string[], organs: string[], tissues: string[], cellTypes: string[]}>;
  
  // Admin methods for chemical curation
  createChemical(preferredName: string, inchikey?: string, role?: string): Promise<CpaChemical>;
  getAllChemicalsForAdmin(): Promise<CpaChemical[]>;
  getChemicalPropertyIds(chemicalId: string): Promise<PropertyMigration[]>;
  getChemicalPropertyValuesForMigration(chemicalId: string): Promise<PropertyValueForMigration[]>;
  migrateProperties(propertyIds: string[], targetChemicalId: string): Promise<void>;
  migratePropertyValues(valueIds: string[], targetChemicalId: string): Promise<void>;
  
  // Admin CRUD methods for chemical editing
  updateChemicalName(chemicalId: string, preferredName: string): Promise<void>;
  updateChemicalRole(chemicalId: string, role: string): Promise<void>;
  addChemicalSynonym(chemicalId: string, synonym: string): Promise<void>;
  removeChemicalSynonym(chemicalId: string, synonym: string): Promise<void>;
  updateChemicalSynonym(chemicalId: string, oldSynonym: string, newSynonym: string): Promise<void>;
  toggleSynonymVisibility(chemicalId: string, synonym: string, hidden: boolean): Promise<void>;
  togglePropertyValueVisibility(valueId: string, hidden: boolean): Promise<void>;
  toggleChemicalVisibility(chemicalId: string, hidden: boolean): Promise<void>;
  cloneChemical(chemicalId: string): Promise<CpaChemical>;
  mergeChemical(sourceId: string, targetId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private papers: Map<number, Paper>;
  private currentId: number;

  constructor() {
    this.papers = new Map();
    this.currentId = 1;
    
    // Initialize with the provided data
    this.initializeData();
  }

  private initializeData() {
    const sampleData: PaperData = {
      "link": "https://doi.org/10.1016/j.cryobiol.2019.10.193",
      "title": "Vitrification of collared peccary ovarian tissue using open or closed systems and different intracellular cryoprotectants",
      "paper_id": "10.1016/j.cryobiol.2019.10.193",
      "experiments": [
        {
          "label": "Vitrification of collared peccary ovarian tissue",
          "quote": "The pairs of ovaries (n=6) were divided into 21 fragments (3 mm × 3 mm × 1 mm). For the fresh control group, one fragment was immediately fixed in Carnoy's solution and underwent histological procedures for morphological evaluation; a second fragment was fixed in paraformaldehyde for subsequent immunohistochemical analysis to identify activated caspase-3 expression and assessment of cell proliferation; and a third fragment was subjected to the isolation protocol to evaluate the viability of the follicles. The other 18 fragments were vitrified and subsequently analyzed.",
          "method": "SSV and OTC",
          "experiment_id": "a3f9b7d2-4c1e-4f3a-8a3d-1b2e4c5d6f7a",
          "biological_context": {
            "tissue": "ovarian preantral follicles",
            "species": "Pecari tajacu",
            "cell_line": null,
            "dimensions": {
              "fragment_width_mm": 3,
              "fragment_length_mm": 3,
              "fragment_thickness_mm": 1
            },
            "health_status": "healthy",
            "developmental_stage": "mature females, 2 years old"
          }
        },
        {
          "label": "Hypothermic RBC storage solutions",
          "quote": "Red blood cells were stored at 4°C using different preservation solutions to evaluate storage quality over time.",
          "method": "storage",
          "experiment_id": "b4a5c6d7-e8f9-4a1b-9c2d-2b3e5c6d7f8a",
          "biological_context": {
            "tissue": "Red blood cells",
            "species": "Human",
            "cell_line": null,
            "dimensions": {
              "fragment_width_mm": 0,
              "fragment_length_mm": 0,
              "fragment_thickness_mm": 0
            },
            "health_status": "healthy donor",
            "developmental_stage": "adult"
          }
        },
        {
          "label": "Cryopreservation protocol optimization",
          "quote": "Testing various cryoprotectant combinations for optimal cell survival rates during freezing and thawing.",
          "method": "cryopreservation",
          "experiment_id": "c5b6d7e8-f9a0-4b2c-0d3e-3c4f6d7e8f9b",
          "biological_context": {
            "tissue": "Stem cells",
            "species": "Human",
            "cell_line": "hMSC",
            "dimensions": {
              "fragment_width_mm": 0,
              "fragment_length_mm": 0,
              "fragment_thickness_mm": 0
            },
            "health_status": "healthy",
            "developmental_stage": "adult"
          }
        }
      ],
      "formulations": [
        {
          "label": "3 M EG + 0.25 M sucrose + 10% FBS in MEM (SSV)",
          "quote": "For SSV, a vitrification solution composed of minimal essential medium (MEM) supplemented with sucrose (0.25 M), 10% fetal bovine serum (FBS), and CPAs was used. As experimental groups, DMSO and EG were individually tested at 3 M concentration, as well as in combination (DMSO 1.5 M and EG 1.5 M).",
          "components": [
            {
              "note": null,
              "role": "CPA",
              "unit": "M",
              "label": "Ethylene glycol",
              "quote": "DMSO and EG were individually tested at 3 M concentration",
              "amount": {
                "value": 3,
                "value_type": "point"
              },
              "agent_id": "WXYWZJQXQZQZQZQ-UHFFFAOYSA-N",
              "component_id": "f1a2b3c4-d5e6-4789-8a0b-1c2d3e4f5a6b"
            },
            {
              "note": null,
              "role": "ADJUVANT",
              "unit": "M",
              "label": "Sucrose",
              "quote": "minimal essential medium (MEM) supplemented with sucrose (0.25 M)",
              "amount": {
                "value": 0.25,
                "value_type": "point"
              },
              "agent_id": "00000000-0000-0000-0000-000000000002",
              "component_id": "a1b2c3d4-e5f6-4789-8a0b-1c2d3e4f5a6b"
            },
            {
              "note": null,
              "role": "ADJUVANT",
              "unit": "%",
              "label": "Fetal bovine serum",
              "quote": "minimal essential medium (MEM) supplemented with ... 10% fetal bovine serum (FBS)",
              "amount": {
                "value": 10,
                "value_type": "point"
              },
              "agent_id": "00000000-0000-0000-0000-000000000003",
              "component_id": "b1c2d3e4-f5a6-4789-8a0b-1c2d3e4f5a6b"
            },
            {
              "note": null,
              "role": "CARRIER",
              "unit": null,
              "label": "Minimal Essential Medium (MEM)",
              "quote": "minimal essential medium (MEM) supplemented with sucrose (0.25 M), 10% fetal bovine serum (FBS)",
              "amount": null,
              "agent_id": "00000000-0000-0000-0000-000000000001",
              "component_id": "c1d2e3f4-a5b6-4789-8a0b-1c2d3e4f5a6b"
            }
          ],
          "experiment_id": "a3f9b7d2-4c1e-4f3a-8a3d-1b2e4c5d6f7a",
          "formulation_id": "d1e2f3a4-b5c6-4789-8d0e-1f2a3b4c5d6e"
        },
        {
          "label": "3 M DMSO + 0.25 M sucrose + 10% FBS in MEM (SSV)",
          "quote": "For SSV, a vitrification solution composed of minimal essential medium (MEM) supplemented with sucrose (0.25 M), 10% fetal bovine serum (FBS), and CPAs was used. As experimental groups, DMSO and EG were individually tested at 3 M concentration, as well as in combination (DMSO 1.5 M and EG 1.5 M).",
          "components": [
            {
              "note": null,
              "role": "CPA",
              "unit": "M",
              "label": "Dimethyl sulfoxide",
              "quote": "DMSO and EG were individually tested at 3 M concentration",
              "amount": {
                "value": 3,
                "value_type": "point"
              },
              "agent_id": "IAZDPXIOMUYVGZ-UHFFFAOYSA-N",
              "component_id": "d2e3f4a5-b6c7-4890-8b1c-2d3e4f5a6b7c"
            },
            {
              "note": null,
              "role": "ADJUVANT",
              "unit": "M",
              "label": "Sucrose",
              "quote": "minimal essential medium (MEM) supplemented with sucrose (0.25 M)",
              "amount": {
                "value": 0.25,
                "value_type": "point"
              },
              "agent_id": "00000000-0000-0000-0000-000000000002",
              "component_id": "e3f4a5b6-c7d8-4890-8b1c-2d3e4f5a6b7c"
            },
            {
              "note": null,
              "role": "ADJUVANT",
              "unit": "%",
              "label": "Fetal bovine serum",
              "quote": "minimal essential medium (MEM) supplemented with ... 10% fetal bovine serum (FBS)",
              "amount": {
                "value": 10,
                "value_type": "point"
              },
              "agent_id": "00000000-0000-0000-0000-000000000003",
              "component_id": "f4a5b6c7-d8e9-4890-8b1c-2d3e4f5a6b7c"
            },
            {
              "note": null,
              "role": "CARRIER",
              "unit": null,
              "label": "Minimal Essential Medium (MEM)",
              "quote": "minimal essential medium (MEM) supplemented with sucrose (0.25 M), 10% fetal bovine serum (FBS)",
              "amount": null,
              "agent_id": "00000000-0000-0000-0000-000000000001",
              "component_id": "a5b6c7d8-e9f0-4890-8b1c-2d3e4f5a6b7c"
            }
          ],
          "experiment_id": "a3f9b7d2-4c1e-4f3a-8a3d-1b2e4c5d6f7a",
          "formulation_id": "e2f3a4b5-c6d7-4890-8b1c-2d3e4f5a6b7c"
        },
        {
          "label": "1.5 M EG + 1.5 M DMSO + 0.25 M sucrose + 10% FBS in MEM (SSV)",
          "quote": "For SSV, a vitrification solution composed of minimal essential medium (MEM) supplemented with sucrose (0.25 M), 10% fetal bovine serum (FBS), and CPAs was used. As experimental groups, DMSO and EG were individually tested at 3 M concentration, as well as in combination (DMSO 1.5 M and EG 1.5 M).",
          "components": [
            {
              "note": null,
              "role": "CPA",
              "unit": "M",
              "label": "Ethylene glycol",
              "quote": "DMSO 1.5 M and EG 1.5 M",
              "amount": {
                "value": 1.5,
                "value_type": "point"
              },
              "agent_id": "WXYWZJQXQZQZQZQ-UHFFFAOYSA-N",
              "component_id": "a4b5c6d7-e8f9-4901-8c2d-3e4f5a6b7c8d"
            },
            {
              "note": null,
              "role": "CPA",
              "unit": "M",
              "label": "Dimethyl sulfoxide",
              "quote": "DMSO 1.5 M and EG 1.5 M",
              "amount": {
                "value": 1.5,
                "value_type": "point"
              },
              "agent_id": "IAZDPXIOMUYVGZ-UHFFFAOYSA-N",
              "component_id": "b5c6d7e8-f9a0-4901-8c2d-3e4f5a6b7c8d"
            },
            {
              "note": null,
              "role": "ADJUVANT",
              "unit": "M",
              "label": "Sucrose",
              "quote": "minimal essential medium (MEM) supplemented with sucrose (0.25 M)",
              "amount": {
                "value": 0.25,
                "value_type": "point"
              },
              "agent_id": "00000000-0000-0000-0000-000000000002",
              "component_id": "c6d7e8f9-a0b1-4901-8c2d-3e4f5a6b7c8d"
            },
            {
              "note": null,
              "role": "ADJUVANT",
              "unit": "%",
              "label": "Fetal bovine serum",
              "quote": "minimal essential medium (MEM) supplemented with ... 10% fetal bovine serum (FBS)",
              "amount": {
                "value": 10,
                "value_type": "point"
              },
              "agent_id": "00000000-0000-0000-0000-000000000003",
              "component_id": "d7e8f9a0-b1c2-4901-8c2d-3e4f5a6b7c8d"
            },
            {
              "note": null,
              "role": "CARRIER",
              "unit": null,
              "label": "Minimal Essential Medium (MEM)",
              "quote": "minimal essential medium (MEM) supplemented with sucrose (0.25 M), 10% fetal bovine serum (FBS)",
              "amount": null,
              "agent_id": "00000000-0000-0000-0000-000000000001",
              "component_id": "e8f9a0b1-c2d3-4901-8c2d-3e4f5a6b7c8d"
            }
          ],
          "experiment_id": "a3f9b7d2-4c1e-4f3a-8a3d-1b2e4c5d6f7a",
          "formulation_id": "f3a4b5c6-d7e8-4901-8c2d-3e4f5a6b7c8d"
        },
        {
          "label": "3 M EG + 0.25 M sucrose + 10% FBS in MEM (OTC)",
          "quote": "The vitrification using the OTC followed the same procedure as that described for the SSV method; however, the entire process of exposure to the CPAs was conducted inside the OTC and then the solution was removed, the device closed, and the sample transferred to the LN2.",
          "components": [
            {
              "note": null,
              "role": "CPA",
              "unit": "M",
              "label": "Ethylene glycol",
              "quote": "DMSO and EG were individually tested at 3 M concentration",
              "amount": {
                "value": 3,
                "value_type": "point"
              },
              "agent_id": "WXYWZJQXQZQZQZQ-UHFFFAOYSA-N",
              "component_id": "b6c7d8e9-f0a1-4a01-8d2e-4f5a6b7c8d9e"
            },
            {
              "note": null,
              "role": "ADJUVANT",
              "unit": "M",
              "label": "Sucrose",
              "quote": "minimal essential medium (MEM) supplemented with sucrose (0.25 M)",
              "amount": {
                "value": 0.25,
                "value_type": "point"
              },
              "agent_id": "00000000-0000-0000-0000-000000000002",
              "component_id": "c7d8e9f0-a1b2-4a01-8d2e-4f5a6b7c8d9e"
            },
            {
              "note": null,
              "role": "ADJUVANT",
              "unit": "%",
              "label": "Fetal bovine serum",
              "quote": "minimal essential medium (MEM) supplemented with ... 10% fetal bovine serum (FBS)",
              "amount": {
                "value": 10,
                "value_type": "point"
              },
              "agent_id": "00000000-0000-0000-0000-000000000003",
              "component_id": "d8e9f0a1-b1c2-4a01-8d2e-4f5a6b7c8d9e"
            },
            {
              "note": null,
              "role": "CARRIER",
              "unit": null,
              "label": "Minimal Essential Medium (MEM)",
              "quote": "minimal essential medium (MEM) supplemented with sucrose (0.25 M), 10% fetal bovine serum (FBS)",
              "amount": null,
              "agent_id": "00000000-0000-0000-0000-000000000001",
              "component_id": "e9f0a1b2-c3d4-4a01-8d2e-4f5a6b7c8d9e"
            }
          ],
          "experiment_id": "a3f9b7d2-4c1e-4f3a-8a3d-1b2e4c5d6f7a",
          "formulation_id": "a5b6c7d8-e9f0-4a01-8d2e-4f5a6b7c8d9e"
        },
        {
          "label": "3 M DMSO + 0.25 M sucrose + 10% FBS in MEM (OTC)",
          "quote": "The vitrification using the OTC followed the same procedure as that described for the SSV method; however, the entire process of exposure to the CPAs was conducted inside the OTC and then the solution was removed, the device closed, and the sample transferred to the LN2.",
          "components": [
            {
              "note": null,
              "role": "CPA",
              "unit": "M",
              "label": "Dimethyl sulfoxide",
              "quote": "DMSO and EG were individually tested at 3 M concentration",
              "amount": {
                "value": 3,
                "value_type": "point"
              },
              "agent_id": "IAZDPXIOMUYVGZ-UHFFFAOYSA-N",
              "component_id": "c8d9e0f1-a2b3-4b01-8d2e-5f6a7b8c9d0e"
            },
            {
              "note": null,
              "role": "ADJUVANT",
              "unit": "M",
              "label": "Sucrose",
              "quote": "minimal essential medium (MEM) supplemented with sucrose (0.25 M)",
              "amount": {
                "value": 0.25,
                "value_type": "point"
              },
              "agent_id": "00000000-0000-0000-0000-000000000002",
              "component_id": "d9e0f1a2-b3c4-4b01-8d2e-5f6a7b8c9d0e"
            },
            {
              "note": null,
              "role": "ADJUVANT",
              "unit": "%",
              "label": "Fetal bovine serum",
              "quote": "minimal essential medium (MEM) supplemented with ... 10% fetal bovine serum (FBS)",
              "amount": {
                "value": 10,
                "value_type": "point"
              },
              "agent_id": "00000000-0000-0000-0000-000000000003",
              "component_id": "e0f1a2b3-c4d5-4b01-8d2e-5f6a7b8c9d0e"
            },
            {
              "note": null,
              "role": "CARRIER",
              "unit": null,
              "label": "Minimal Essential Medium (MEM)",
              "quote": "minimal essential medium (MEM) supplemented with sucrose (0.25 M), 10% fetal bovine serum (FBS)",
              "amount": null,
              "agent_id": "00000000-0000-0000-0000-000000000001",
              "component_id": "f1a2b3c4-d5e6-4b01-8d2e-5f6a7b8c9d0e"
            }
          ],
          "experiment_id": "a3f9b7d2-4c1e-4f3a-8a3d-1b2e4c5d6f7a",
          "formulation_id": "b7c8d9e0-f1a2-4b01-8d2e-5f6a7b8c9d0e"
        },
        {
          "label": "1.5 M EG + 1.5 M DMSO + 0.25 M sucrose + 10% FBS in MEM (OTC)",
          "quote": "The vitrification using the OTC followed the same procedure as that described for the SSV method; however, the entire process of exposure to the CPAs was conducted inside the OTC and then the solution was removed, the device closed, and the sample transferred to the LN2.",
          "components": [
            {
              "note": null,
              "role": "CPA",
              "unit": "M",
              "label": "Ethylene glycol",
              "quote": "DMSO 1.5 M and EG 1.5 M",
              "amount": {
                "value": 1.5,
                "value_type": "point"
              },
              "agent_id": "WXYWZJQXQZQZQZQ-UHFFFAOYSA-N",
              "component_id": "d0e1f2a3-b4c5-4d01-8d2e-6f7a8b9c0d1e"
            },
            {
              "note": null,
              "role": "CPA",
              "unit": "M",
              "label": "Dimethyl sulfoxide",
              "quote": "DMSO 1.5 M and EG 1.5 M",
              "amount": {
                "value": 1.5,
                "value_type": "point"
              },
              "agent_id": "IAZDPXIOMUYVGZ-UHFFFAOYSA-N",
              "component_id": "e1f2a3b4-c5d6-4d01-8d2e-6f7a8b9c0d1e"
            },
            {
              "note": null,
              "role": "ADJUVANT",
              "unit": "M",
              "label": "Sucrose",
              "quote": "minimal essential medium (MEM) supplemented with sucrose (0.25 M)",
              "amount": {
                "value": 0.25,
                "value_type": "point"
              },
              "agent_id": "00000000-0000-0000-0000-000000000002",
              "component_id": "f2a3b4c5-d6e7-4d01-8d2e-6f7a8b9c0d1e"
            },
            {
              "note": null,
              "role": "ADJUVANT",
              "unit": "%",
              "label": "Fetal bovine serum",
              "quote": "minimal essential medium (MEM) supplemented with ... 10% fetal bovine serum (FBS)",
              "amount": {
                "value": 10,
                "value_type": "point"
              },
              "agent_id": "00000000-0000-0000-0000-000000000003",
              "component_id": "a3b4c5d6-e7f8-4d01-8d2e-6f7a8b9c0d1e"
            },
            {
              "note": null,
              "role": "CARRIER",
              "unit": null,
              "label": "Minimal Essential Medium (MEM)",
              "quote": "minimal essential medium (MEM) supplemented with sucrose (0.25 M), 10% fetal bovine serum (FBS)",
              "amount": null,
              "agent_id": "00000000-0000-0000-0000-000000000001",
              "component_id": "b4c5d6e7-f8a9-4d01-8d2e-6f7a8b9c0d1e"
            }
          ],
          "experiment_id": "a3f9b7d2-4c1e-4f3a-8a3d-1b2e4c5d6f7a",
          "formulation_id": "c8d9e0f1-a2b3-4c01-8d2e-6f7a8b9c0d1e"
        }
      ],
      "chemical_agents": [
        {
          "label": "Ethylene glycol",
          "agent_id": "WXYWZJQXQZQZQZQ-UHFFFAOYSA-N"
        },
        {
          "label": "Dimethyl sulfoxide",
          "agent_id": "IAZDPXIOMUYVGZ-UHFFFAOYSA-N"
        },
        {
          "label": "Minimal Essential Medium (MEM)",
          "agent_id": "00000000-0000-0000-0000-000000000001"
        },
        {
          "label": "Sucrose",
          "agent_id": "00000000-0000-0000-0000-000000000002"
        },
        {
          "label": "Fetal bovine serum",
          "agent_id": "00000000-0000-0000-0000-000000000003"
        }
      ],
      "agent_properties": [
        {
          "unit": "g/mol",
          "quote": "EG has a lower molecular weight (62.07 g/mol) than that of DMSO (78.13 kDa), which facilitates its penetration into tissues",
          "value": {
            "value": 62.07,
            "value_type": "point"
          },
          "agent_id": "WXYWZJQXQZQZQZQ-UHFFFAOYSA-N",
          "prop_type": "MOLECULAR_MASS",
          "property_id": "f9a8b7c6-d5e4-4f3a-9b8c-7d6e5f4a3b2c"
        },
        {
          "unit": "g/mol",
          "quote": "EG has a lower molecular weight (62.07 g/mol) than that of DMSO (78.13 kDa), which facilitates its penetration into tissues",
          "value": {
            "value": 78.13,
            "value_type": "point"
          },
          "agent_id": "IAZDPXIOMUYVGZ-UHFFFAOYSA-N",
          "prop_type": "MOLECULAR_MASS",
          "property_id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"
        }
      ]
    };

    this.createPaper({
      title: sampleData.title,
      paper_id: sampleData.paper_id,
      cpa_facts_json: sampleData as any
    });
  }

  async getPaper(id: string): Promise<Paper | undefined> {
    const numId = parseInt(id);
    return this.papers.get(numId);
  }

  async getPaperByPaperId(paperId: string): Promise<Paper | undefined> {
    return Array.from(this.papers.values()).find(
      (paper) => paper.paper_id === paperId,
    );
  }

  async createPaper(insertPaper: InsertPaper): Promise<Paper> {
    const id = this.currentId.toString();
    this.currentId++;
    const paper: Paper = { 
      ...insertPaper, 
      id,
      doi: insertPaper.doi ?? null,
      source: insertPaper.source ?? null,
      journal: insertPaper.journal ?? null,
      published_year: insertPaper.published_year ?? null,
      published_month: insertPaper.published_month ?? null,
      published_day: insertPaper.published_day ?? null,
      abstract: insertPaper.abstract ?? null,
      authors_json: insertPaper.authors_json ?? null,
      authors_flat: insertPaper.authors_flat ?? null,
      paper_url: insertPaper.paper_url ?? null,
      download_url: insertPaper.download_url ?? null,
      is_free_fulltext: insertPaper.is_free_fulltext ?? null,
      license: insertPaper.license ?? null,
      md5_hash: insertPaper.md5_hash ?? null,
      file_size_bytes: insertPaper.file_size_bytes ?? null,
      file_s3_uri: insertPaper.file_s3_uri ?? null,
      fulltext_s3_uri: insertPaper.fulltext_s3_uri ?? null,
      cpa_facts_json: insertPaper.cpa_facts_json ?? null,
      data: insertPaper.data ?? null
    };
    this.papers.set(parseInt(id), paper);
    return paper;
  }

  async getAllPapers(): Promise<Paper[]> {
    return Array.from(this.papers.values());
  }

  async searchPapers(query: string): Promise<Paper[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.papers.values()).filter(paper => {
      const data = paper.cpa_facts_json as PaperData;
      return (
        paper.title.toLowerCase().includes(lowerQuery) ||
        (data && data.experiments && data.experiments.some(exp => 
          exp.label.toLowerCase().includes(lowerQuery) ||
          exp.quote.toLowerCase().includes(lowerQuery)
        )) ||
        (data && data.formulations && data.formulations.some(form => 
          form.label.toLowerCase().includes(lowerQuery) ||
          form.components.some(comp => comp.label.toLowerCase().includes(lowerQuery))
        ))
      );
    });
  }

  async filterPapersByBiologicalContext(filter: BiologicalContextFilter): Promise<Paper[]> {
    const { species, organ, tissue } = filter;
    
    // If no filters provided, return all papers
    if (!species && !organ && !tissue) {
      return await this.getAllPapers();
    }

    // Filter papers based on biological context in experiments
    return Array.from(this.papers.values()).filter(paper => {
      const data = paper.cpa_facts_json as PaperData;
      if (!data || !data.experiments) return false;

      return data.experiments.some(exp => {
        if (!exp.biological_context) return false;
        
        const ctx = exp.biological_context;
        const speciesMatch = !species || ctx.species === species;
        const organMatch = !organ || ctx.organ === organ;
        const tissueMatch = !tissue || ctx.tissue === tissue;
        
        return speciesMatch && organMatch && tissueMatch;
      });
    });
  }

  // ChemSpider-style chemical methods (placeholder for MemStorage)
  async getChemical(id: string): Promise<CpaChemical | undefined> {
    return undefined; // Not implemented for memory storage
  }

  async getAllChemicals(): Promise<CpaChemical[]> {
    return []; // Not implemented for memory storage
  }

  async searchChemicals(query: string): Promise<CpaChemical[]> {
    return []; // Not implemented for memory storage
  }

  async autocompleteChemicals(query: string, limit?: number, isAdmin?: boolean): Promise<ChemicalAutocompleteResult[]> {
    return []; // Not implemented for memory storage
  }

  async semanticSearchChemicals(embedding: number[], isAdmin?: boolean): Promise<CpaChemical[]> {
    return []; // Not implemented for memory storage
  }

  async getChemicalNames(id: string, isAdmin?: boolean): Promise<NamesSynonymsView[]> {
    return []; // Not implemented for memory storage
  }

  async getChemicalProperties(id: string): Promise<PropertiesView[]> {
    return []; // Not implemented for memory storage
  }

  async filterChemicalsByProperties(filters: PropertyFilter[]): Promise<CpaChemical[]> {
    return []; // Not implemented for memory storage
  }

  async getAvailablePropertyTypes(): Promise<string[]> {
    return []; // Not implemented for memory storage
  }

  async searchFormulations(query: string, page?: number, limit?: number): Promise<FormulationPaginatedResult> {
    return { formulations: [], total: 0, page: page || 1, limit: limit || 10 }; // Not implemented for memory storage
  }

  async searchFormulationsByChemicals(chemicalIds: string[], page?: number, limit?: number): Promise<FormulationPaginatedResult> {
    return { formulations: [], total: 0, page: page || 1, limit: limit || 10 }; // Not implemented for memory storage
  }

  async getFormulationDetail(formulationId: string): Promise<FormulationDetail | undefined> {
    return undefined; // Not implemented for memory storage
  }

  async getChemicalFormulations(chemicalId: string, page?: number, limit?: number): Promise<FormulationPaginatedResult> {
    return { formulations: [], total: 0, page: page || 1, limit: limit || 10 }; // Not implemented for memory storage
  }

  async advancedSearchStudies(filters: AdvancedSearchFilters): Promise<AdvancedSearchResult[]> {
    return []; // Not implemented for memory storage
  }

  async advancedSearchMolecules(filters: AdvancedSearchFilters): Promise<MoleculeSearchResult[]> {
    return []; // Not implemented for memory storage
  }

  async getAvailableBiologicalContextValues(): Promise<{species: string[], organs: string[], tissues: string[], cellTypes: string[]}> {
    return { species: [], organs: [], tissues: [], cellTypes: [] }; // Not implemented for memory storage
  }

  async getFilteredBiologicalContextValues(chemicalIds?: string[], species?: string, organ?: string, tissue?: string): Promise<{species: string[], organs: string[], tissues: string[], cellTypes: string[]}> {
    return { species: [], organs: [], tissues: [], cellTypes: [] }; // Not implemented for memory storage
  }

  // Admin methods (not implemented for MemStorage)
  async createChemical(preferredName: string, inchikey?: string, role?: string): Promise<CpaChemical> {
    throw new Error('Admin methods not implemented for memory storage');
  }

  async getAllChemicalsForAdmin(): Promise<CpaChemical[]> {
    return []; // Not implemented for memory storage
  }

  async getChemicalPropertyIds(chemicalId: string): Promise<PropertyMigration[]> {
    return []; // Not implemented for memory storage
  }

  async getChemicalPropertyValuesForMigration(chemicalId: string): Promise<PropertyValueForMigration[]> {
    return []; // Not implemented for memory storage
  }

  async migrateProperties(propertyIds: string[], targetChemicalId: string): Promise<void> {
    throw new Error('Admin methods not implemented for memory storage');
  }

  async migratePropertyValues(valueIds: string[], targetChemicalId: string): Promise<void> {
    throw new Error('Admin methods not implemented for memory storage');
  }

  async updateChemicalName(chemicalId: string, preferredName: string): Promise<void> {
    throw new Error('Admin methods not implemented for memory storage');
  }

  async updateChemicalRole(chemicalId: string, role: string): Promise<void> {
    throw new Error('Admin methods not implemented for memory storage');
  }

  async addChemicalSynonym(chemicalId: string, synonym: string): Promise<void> {
    throw new Error('Admin methods not implemented for memory storage');
  }

  async removeChemicalSynonym(chemicalId: string, synonym: string): Promise<void> {
    throw new Error('Admin methods not implemented for memory storage');
  }

  async updateChemicalSynonym(chemicalId: string, oldSynonym: string, newSynonym: string): Promise<void> {
    throw new Error('Admin methods not implemented for memory storage');
  }

  async toggleSynonymVisibility(chemicalId: string, synonym: string, hidden: boolean): Promise<void> {
    throw new Error('Admin methods not implemented for memory storage');
  }

  async togglePropertyValueVisibility(valueId: string, hidden: boolean): Promise<void> {
    throw new Error('Admin methods not implemented for memory storage');
  }

  async toggleChemicalVisibility(chemicalId: string, hidden: boolean): Promise<void> {
    throw new Error('Admin methods not implemented for memory storage');
  }

  async cloneChemical(chemicalId: string): Promise<CpaChemical> {
    throw new Error('Admin methods not implemented for memory storage');
  }

  async mergeChemical(sourceId: string, targetId: string): Promise<void> {
    throw new Error('Admin methods not implemented for memory storage');
  }
}

export class DatabaseStorage implements IStorage {
  async getPaper(id: string): Promise<Paper | undefined> {
    const result = await pool.query(`SELECT * FROM papers WHERE id = $1`, [id]);
    if (result.rows.length === 0) return undefined;
    const row = result.rows[0];
    return {
      ...row,
      data: row.cpa_facts_json
    } as Paper;
  }

  async getPaperByPaperId(paperId: string): Promise<Paper | undefined> {
    const result = await pool.query(`SELECT * FROM papers WHERE paper_id = $1`, [paperId]);
    return result.rows[0] as Paper || undefined;
  }

  async createPaper(paper: InsertPaper): Promise<Paper> {
    const result = await pool.query(
      `INSERT INTO papers (title, paper_id, cpa_facts_json) VALUES ($1, $2, $3) RETURNING *`,
      [paper.title, paper.paper_id, JSON.stringify(paper.cpa_facts_json)]
    );
    return result.rows[0] as Paper;
  }

  async getAllPapers(): Promise<Paper[]> {
    const result = await pool.query(`
      SELECT * 
      FROM papers 
      WHERE title IS NOT NULL AND title != ''
      ORDER BY id DESC
    `);
    return result.rows.map(row => ({
      ...row,
      data: row.cpa_facts_json
    })) as Paper[];
  }

  async searchPapers(query: string): Promise<Paper[]> {
    if (!query.trim()) {
      return await this.getAllPapers();
    }
    
    const result = await pool.query(
      `SELECT * FROM papers 
       WHERE title ILIKE $1 
          OR authors_flat ILIKE $1 
          OR doi ILIKE $1
       ORDER BY id DESC`,
      [`%${query}%`]
    );
    return result.rows.map(row => ({
      ...row,
      data: row.cpa_facts_json
    })) as Paper[];
  }

  async filterPapersByBiologicalContext(filter: BiologicalContextFilter): Promise<Paper[]> {
    const { species, organ, tissue } = filter;
    
    // If no filters provided, return all papers
    if (!species && !organ && !tissue) {
      return await this.getAllPapers();
    }

    // Build WHERE conditions based on provided filters
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (species) {
      conditions.push(`biological_context->>'species' = $${paramIndex}`);
      params.push(species);
      paramIndex++;
    }

    if (organ) {
      conditions.push(`biological_context->>'organ' = $${paramIndex}`);
      params.push(organ);
      paramIndex++;
    }

    if (tissue) {
      conditions.push(`biological_context->>'tissue' = $${paramIndex}`);
      params.push(tissue);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

    // Query papers that have experiments matching the biological context filters
    const result = await pool.query(`
      SELECT DISTINCT p.*
      FROM papers p
      INNER JOIN experiments e ON e.paper_id::text = p.id::text
      WHERE p.title IS NOT NULL AND p.title != ''
        ${whereClause}
      ORDER BY p.id DESC
    `, params);

    return result.rows.map(row => ({
      ...row,
      data: row.cpa_facts_json
    })) as Paper[];
  }

  // ChemSpider-style chemical methods
  async getChemical(id: string): Promise<CpaChemical | undefined> {
    const result = await pool.query(`SELECT * FROM cpa_chemicals WHERE id = $1`, [id]);
    return result.rows[0] as CpaChemical || undefined;
  }

  async getAllChemicals(): Promise<CpaChemical[]> {
    const result = await pool.query(`
      SELECT DISTINCT c.id, c.inchikey, c.preferred_name, c.role, c.synonyms, c.hidden
      FROM cpa_chemicals c 
      WHERE (c.hidden = false OR c.hidden IS NULL)
        AND EXISTS (
          SELECT 1 FROM v_cpa_property_values vpv 
          WHERE vpv.chemical_id = c.id
        )
      ORDER BY c.preferred_name
    `);
    return result.rows as CpaChemical[];
  }

  async searchChemicals(query: string, role?: string, isAdmin?: boolean, includeAll?: boolean): Promise<CpaChemical[]> {
    if (!query.trim() && !role && !includeAll) {
      return isAdmin ? await this.getAllChemicalsForAdmin() : await this.getAllChemicals();
    }
    
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;
    
    // Text search in preferred_name, synonyms JSONB column, and cpa_chemical_aliases table
    if (query.trim()) {
      // Build alias hidden filter based on admin status
      const aliasHiddenFilter = isAdmin ? '' : 'AND (ca.hidden = false OR ca.hidden IS NULL)';
      
      whereConditions.push(`(c.preferred_name ILIKE $${paramIndex} 
          OR EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(c.synonyms) AS synonym
            WHERE synonym ILIKE $${paramIndex}
          )
          OR EXISTS (
            SELECT 1 FROM cpa_chemical_aliases ca
            WHERE ca.chemical_id = c.id
              AND ca.alias ILIKE $${paramIndex}
              ${aliasHiddenFilter}
          ))`);
      params.push(`%${query}%`);
      paramIndex++;
    }
    
    // Role filter
    if (role) {
      whereConditions.push(`c.role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }
    
    // Only filter for chemicals with properties if includeAll is not set
    if (!includeAll) {
      whereConditions.push(`EXISTS (
        SELECT 1 FROM v_cpa_property_values vpv 
        WHERE vpv.chemical_id = c.id
      )`);
    }
    
    // Always filter out hidden chemicals (even for includeAll, we don't want hidden chemicals in merge target)
    whereConditions.push(`(c.hidden = false OR c.hidden IS NULL)`);
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    const result = await pool.query(
      `SELECT c.id, c.inchikey, c.preferred_name, c.role, c.synonyms, c.hidden
       FROM cpa_chemicals c 
       ${whereClause}
       GROUP BY c.id, c.inchikey, c.preferred_name, c.role, c.synonyms, c.hidden
       ORDER BY c.preferred_name`,
      params
    );
    return result.rows as CpaChemical[];
  }

  async autocompleteChemicals(query: string, limit: number = 20, isAdmin?: boolean): Promise<ChemicalAutocompleteResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = `%${query.trim()}%`;
    const aliasHiddenFilter = isAdmin ? '' : 'AND (ca.hidden = false OR ca.hidden IS NULL)';
    const chemicalHiddenFilter = '(c.hidden = false OR c.hidden IS NULL)';
    
    // Filter to only include chemicals that have property values (matching main page behavior)
    const propertyExistsFilter = `EXISTS (
      SELECT 1 FROM v_cpa_property_values vpv 
      WHERE vpv.chemical_id = c.id
    )`;
    
    // Query that returns chemicals with info about which alias/name matched
    const result = await pool.query(`
      WITH matches AS (
        -- Preferred name matches (highest priority)
        SELECT 
          c.id,
          c.preferred_name,
          c.role,
          c.inchikey,
          NULL::text AS matched_alias,
          'preferred_name' AS match_type,
          1 AS priority
        FROM cpa_chemicals c
        WHERE c.preferred_name ILIKE $1
          AND ${chemicalHiddenFilter}
          AND ${propertyExistsFilter}
        
        UNION ALL
        
        -- Alias matches
        SELECT 
          c.id,
          c.preferred_name,
          c.role,
          c.inchikey,
          ca.alias AS matched_alias,
          'alias' AS match_type,
          2 AS priority
        FROM cpa_chemicals c
        JOIN cpa_chemical_aliases ca ON ca.chemical_id = c.id
        WHERE ca.alias ILIKE $1
          AND ${chemicalHiddenFilter}
          AND ${propertyExistsFilter}
          ${aliasHiddenFilter}
          AND ca.alias != c.preferred_name
      )
      SELECT DISTINCT ON (id)
        id,
        preferred_name,
        role,
        inchikey,
        matched_alias,
        match_type
      FROM matches
      ORDER BY id, priority
      LIMIT $2
    `, [searchTerm, limit]);

    return result.rows as ChemicalAutocompleteResult[];
  }

  async getChemicalNames(id: string, isAdmin?: boolean): Promise<NamesSynonymsView[]> {
    // Query from cpa_chemical_aliases, filtering hidden synonyms for non-admin users
    const hiddenFilter = isAdmin ? '' : 'AND (ca.hidden = false OR ca.hidden IS NULL)';
    
    const result = await pool.query(`
      SELECT 
        c.id::text as chemical_id,
        c.inchikey,
        c.preferred_name,
        ca.alias as synonym,
        CASE 
          WHEN ca.is_preferred THEN 'preferred'::text
          ELSE 'synonym'::text
        END as label_type,
        ca.hidden
      FROM cpa_chemicals c
      LEFT JOIN cpa_chemical_aliases ca ON c.id = ca.chemical_id
      WHERE c.id = $1::uuid
        ${hiddenFilter}
      ORDER BY ca.is_preferred DESC, ca.alias
    `, [id]);
    return result.rows as NamesSynonymsView[];
  }

  async getChemicalProperties(id: string): Promise<PropertiesView[]> {
    // Query property values with their sources, then aggregate in JavaScript
    const result = await pool.query(`
      SELECT
        c.id::text as chemical_id,
        c.preferred_name,
        c.role,
        prop.prop_type,
        cpv.id as value_id,
        cpv.unit,
        cpv.value_kind,
        cpv.hidden,
        CASE 
          WHEN cpv.value_kind = 'POINT' THEN cpv.numeric_value::text
          WHEN cpv.value_kind = 'RANGE' THEN cpv.range_min::text || ' - ' || cpv.range_max::text
          ELSE cpv.raw_value
        END as value,
        ref.paper_id,
        ref.quote,
        ref.link,
        p.doi
      FROM cpa_chemicals c
      JOIN chemical_properties prop ON prop.chemical_id = c.id
      JOIN chemical_property_values cpv ON cpv.property_id = prop.id
      LEFT JOIN cpa_references ref ON ref.property_value_id = cpv.id
      LEFT JOIN papers p ON CAST(p.id AS TEXT) = CAST(ref.paper_id AS TEXT)
      WHERE c.id = $1::uuid
      ORDER BY prop.prop_type, cpv.hidden, cpv.value_kind, value
    `, [id]);

    // Group by prop_type and aggregate property_values
    const propertiesMap = new Map<string, PropertiesView>();
    
    result.rows.forEach((row: any) => {
      const key = row.prop_type;
      
      if (!propertiesMap.has(key)) {
        propertiesMap.set(key, {
          chemical_id: row.chemical_id,
          preferred_name: row.preferred_name,
          role: row.role,
          prop_type: row.prop_type,
          property_values: []
        });
      }
      
      const property = propertiesMap.get(key)!;
      
      // Find or create property value entry
      let propertyValue = property.property_values.find(
        pv => pv.value === row.value && pv.unit === row.unit
      );
      
      if (!propertyValue) {
        propertyValue = {
          value_id: row.value_id,
          value: row.value,
          unit: row.unit,
          hidden: row.hidden,
          sources: []
        };
        property.property_values.push(propertyValue);
      }
      
      // Add source with proper deduplication
      // Deduplicate by quote when present (same quote = same source, regardless of paper_id)
      // For sources without quotes, deduplicate by (paper_id + link) to preserve distinct references
      const isDuplicate = row.quote 
        ? propertyValue.sources.some(s => s.quote === row.quote)
        : row.paper_id && propertyValue.sources.some(s => 
            s.paper_id === row.paper_id && 
            s.link === row.link && 
            !s.quote
          );
      
      if (!isDuplicate && (row.quote || row.paper_id || row.link)) {
        propertyValue.sources.push({
          paper_id: row.paper_id,
          doi: row.doi,
          link: row.link,
          quote: row.quote,
          experiment_quote: null
        });
      }
    });

    return Array.from(propertiesMap.values());
  }

  async semanticSearchChemicals(embedding: number[], isAdmin?: boolean): Promise<CpaChemical[]> {
    const vectorStr = `[${embedding.join(',')}]`;
    
    // Build WHERE conditions
    const conditions: string[] = [];
    
    // Always filter for chemicals that have properties
    conditions.push(`EXISTS (
      SELECT 1 FROM v_cpa_property_values vpv 
      WHERE vpv.chemical_id = vae.chemical_id
    )`);
    
    // Filter out hidden chemicals only for non-admin users
    if (!isAdmin) {
      conditions.push(`NOT EXISTS (
        SELECT 1 FROM cpa_chemicals c
        WHERE c.id = vae.chemical_id AND c.hidden = true
      )`);
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Use a subquery to get distinct chemicals by their minimum distance, avoiding the DISTINCT + ORDER BY issue
    const result = await pool.query(`
      WITH ranked AS (
        SELECT 
          vae.chemical_id as id,
          vae.inchikey,
          vae.preferred_name,
          vae.role,
          vae.embedding <-> $1::vector as distance,
          ROW_NUMBER() OVER (PARTITION BY vae.chemical_id ORDER BY vae.embedding <-> $1::vector) as rn
        FROM v_cpa_alias_embeddings vae
        ${whereClause}
      )
      SELECT id, inchikey, preferred_name, role
      FROM ranked
      WHERE rn = 1
      ORDER BY distance
      LIMIT 20
    `, [vectorStr]);
    
    return result.rows as CpaChemical[];
  }

  async filterChemicalsByProperties(filters: PropertyFilter[]): Promise<CpaChemical[]> {
    if (!filters || filters.length === 0) {
      return this.getAllChemicals();
    }

    // Build the SQL query dynamically based on filters
    const filterConditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    filters.forEach((filter) => {
      const conditions: string[] = [];
      const propertyType = filter.prop_type as PropertyType;
      
      // Property type condition
      conditions.push(`prop.prop_type = $${paramIndex}`);
      params.push(filter.prop_type);
      paramIndex++;

      // Numeric range filtering with unit conversion
      if (filter.min_value !== undefined || filter.max_value !== undefined) {
        // Convert user's input values to base unit
        const baseUnit = getBaseUnit(propertyType);
        const userUnit = filter.unit || baseUnit;
        
        // Generate SQL expression to convert database values to base unit
        const convertedPointValue = buildUnitConversionSQL(
          propertyType,
          'cpv.numeric_value'
        );
        const convertedRangeMin = buildUnitConversionSQL(
          propertyType,
          'cpv.range_min'
        );
        const convertedRangeMax = buildUnitConversionSQL(
          propertyType,
          'cpv.range_max'
        );

        if (filter.min_value !== undefined) {
          // Convert user's min value to base unit
          const normalizedMinValue = convertToBaseUnit(
            filter.min_value,
            userUnit,
            propertyType
          );
          
          // value_max >= min_value (checking if max of range is above our minimum)
          conditions.push(`
            (CASE cpv.value_kind
              WHEN 'POINT' THEN ${convertedPointValue}
              WHEN 'RANGE' THEN ${convertedRangeMax}
              ELSE NULL
            END) >= $${paramIndex}
          `);
          params.push(normalizedMinValue);
          paramIndex++;
        }
        
        if (filter.max_value !== undefined) {
          // Convert user's max value to base unit
          const normalizedMaxValue = convertToBaseUnit(
            filter.max_value,
            userUnit,
            propertyType
          );
          
          // value_min <= max_value (checking if min of range is below our maximum)
          conditions.push(`
            (CASE cpv.value_kind
              WHEN 'POINT' THEN ${convertedPointValue}
              WHEN 'RANGE' THEN ${convertedRangeMin}
              ELSE NULL
            END) <= $${paramIndex}
          `);
          params.push(normalizedMaxValue);
          paramIndex++;
        }
      }

      // Raw value filtering (for text properties)
      if (filter.raw_value) {
        conditions.push(`cpv.raw_value ILIKE $${paramIndex}`);
        params.push(`%${filter.raw_value}%`);
        paramIndex++;
      }

      filterConditions.push(`(${conditions.join(' AND ')})`);
    });

    const whereClause = filterConditions.join(' OR ');

    // Use direct JOINs instead of view to avoid permission issues
    const result = await pool.query(`
      SELECT DISTINCT 
        chem.id,
        chem.inchikey,
        chem.preferred_name,
        chem.role
      FROM chemical_property_values AS cpv
      JOIN chemical_properties AS prop ON prop.id = cpv.property_id
      JOIN cpa_chemicals AS chem ON chem.id = prop.chemical_id
      WHERE ${whereClause}
      ORDER BY chem.preferred_name
    `, params);

    return result.rows as CpaChemical[];
  }

  async getAvailablePropertyTypes(): Promise<string[]> {
    const result = await pool.query(`
      SELECT DISTINCT prop.prop_type
      FROM chemical_properties prop
      WHERE EXISTS (
        SELECT 1
        FROM chemical_property_values cpv
        WHERE cpv.property_id = prop.id
        AND cpv.hidden = false
      )
      ORDER BY prop.prop_type
    `);
    
    return result.rows.map((row: any) => row.prop_type);
  }

  async searchFormulations(query: string, page: number = 1, limit: number = 10): Promise<FormulationPaginatedResult> {
    if (!query || query.trim().length === 0) {
      return { formulations: [], total: 0, page, limit };
    }

    const searchTerm = `%${query.toLowerCase()}%`;
    const offset = (page - 1) * limit;
    
    // Search formulations by label or component display_label
    // Groups by component_signature to deduplicate, counts papers, sorts by paper count
    const result = await pool.query(`
      WITH matching_formulations AS (
        SELECT DISTINCT uc.formulation_id
        FROM v_formulation_unique_components uc
        JOIN v_paper_experiments_formulations_new v ON v.formulation_id = uc.formulation_id
        WHERE LOWER(v.formulation_label) ILIKE $1
           OR LOWER(v.display_label) ILIKE $1
      ),
      unique_formulations AS (
        SELECT 
          uc.formulation_id,
          uc.formulation_label,
          uc.component_signature,
          uc.unique_chemical_count,
          ROW_NUMBER() OVER (
            PARTITION BY uc.component_signature 
            ORDER BY uc.formulation_label, uc.formulation_id
          ) AS rn
        FROM v_formulation_unique_components uc
        WHERE uc.formulation_id IN (SELECT formulation_id FROM matching_formulations)
      ),
      with_paper_count AS (
        SELECT 
          uf.formulation_id,
          uf.formulation_label,
          uf.component_signature,
          uf.unique_chemical_count AS component_count,
          COUNT(DISTINCT p.id) AS paper_count,
          (ARRAY_AGG(p.id ORDER BY p.title))[1] AS paper_id,
          (ARRAY_AGG(p.title ORDER BY p.title))[1] AS paper_title,
          (ARRAY_AGG(p.doi ORDER BY p.title))[1] AS paper_doi
        FROM unique_formulations uf
        JOIN formulations f ON f.component_signature = uf.component_signature
        JOIN experiments e ON e.id = f.experiment_id
        JOIN papers p ON p.id = e.paper_id
        WHERE uf.rn = 1
        GROUP BY uf.formulation_id, uf.formulation_label, uf.component_signature, uf.unique_chemical_count
        HAVING COUNT(DISTINCT p.id) >= 2
      )
      SELECT 
        formulation_id,
        formulation_label,
        paper_id,
        paper_title,
        paper_doi,
        NULL AS experiment_label,
        component_signature,
        component_count,
        paper_count::int
      FROM with_paper_count
      ORDER BY paper_count DESC, formulation_label
      LIMIT $2 OFFSET $3
    `, [searchTerm, limit, offset]);
    
    // Get total count for pagination
    const countResult = await pool.query(`
      WITH matching_formulations AS (
        SELECT DISTINCT uc.formulation_id
        FROM v_formulation_unique_components uc
        JOIN v_paper_experiments_formulations_new v ON v.formulation_id = uc.formulation_id
        WHERE LOWER(v.formulation_label) ILIKE $1
           OR LOWER(v.display_label) ILIKE $1
      ),
      unique_formulations AS (
        SELECT 
          uc.component_signature,
          ROW_NUMBER() OVER (
            PARTITION BY uc.component_signature 
            ORDER BY uc.formulation_label, uc.formulation_id
          ) AS rn
        FROM v_formulation_unique_components uc
        WHERE uc.formulation_id IN (SELECT formulation_id FROM matching_formulations)
      ),
      with_paper_count AS (
        SELECT uf.component_signature
        FROM unique_formulations uf
        JOIN formulations f ON f.component_signature = uf.component_signature
        JOIN experiments e ON e.id = f.experiment_id
        JOIN papers p ON p.id = e.paper_id
        WHERE uf.rn = 1
        GROUP BY uf.component_signature
        HAVING COUNT(DISTINCT p.id) >= 2
      )
      SELECT COUNT(*) AS total
      FROM with_paper_count
    `, [searchTerm]);
    
    const total = parseInt(countResult.rows[0]?.total || '0', 10);
    
    return { 
      formulations: result.rows as FormulationSearchResult[], 
      total, 
      page, 
      limit 
    };
  }

  async searchFormulationsByChemicals(chemicalIds: string[], page: number = 1, limit: number = 10): Promise<FormulationPaginatedResult> {
    if (!chemicalIds || chemicalIds.length === 0) {
      return { formulations: [], total: 0, page, limit };
    }

    const offset = (page - 1) * limit;
    const numChemicals = chemicalIds.length;
    
    // Use component_signature column for aggregation (now materialized on formulations table)
    const client = await pool.connect();
    try {
      await client.query('SET statement_timeout = 30000'); // 30 second timeout
      
      // Query aggregates by component_signature for unique chemical combinations
      // Returns one row per unique formulation (same chemicals = same signature)
      // Uses AND logic: only formulations containing ALL selected chemicals
      const result = await client.query(`
        WITH matching_formulations AS (
          -- Find formulations that contain ALL selected chemicals (AND logic)
          SELECT f.id, f.component_signature
          FROM formulations f
          JOIN formulation_components fc ON fc.formulation_id = f.id
          WHERE fc.chemical_id = ANY($1::uuid[])
            AND f.component_signature IS NOT NULL
          GROUP BY f.id, f.component_signature
          HAVING COUNT(DISTINCT fc.chemical_id) = $4
        ),
        aggregated AS (
          SELECT 
            mf.component_signature,
            (ARRAY_AGG(mf.id))[1] AS formulation_id,
            COUNT(DISTINCT p.id) AS paper_count
          FROM matching_formulations mf
          JOIN formulations f ON f.component_signature = mf.component_signature
          JOIN experiments e ON e.id = f.experiment_id
          JOIN papers p ON p.id = e.paper_id
          GROUP BY mf.component_signature
          ORDER BY paper_count DESC, mf.component_signature
          LIMIT $2 OFFSET $3
        )
        SELECT 
          a.formulation_id,
          a.component_signature,
          a.paper_count,
          string_agg(DISTINCT c.preferred_name, ' + ' ORDER BY c.preferred_name) AS formulation_label,
          COUNT(DISTINCT c.id)::int AS component_count,
          (SELECT p.id FROM formulations f2 
           JOIN experiments e2 ON e2.id = f2.experiment_id 
           JOIN papers p ON p.id = e2.paper_id 
           WHERE f2.component_signature = a.component_signature 
           LIMIT 1) AS paper_id,
          (SELECT p.title FROM formulations f2 
           JOIN experiments e2 ON e2.id = f2.experiment_id 
           JOIN papers p ON p.id = e2.paper_id 
           WHERE f2.component_signature = a.component_signature 
           LIMIT 1) AS paper_title,
          (SELECT p.doi FROM formulations f2 
           JOIN experiments e2 ON e2.id = f2.experiment_id 
           JOIN papers p ON p.id = e2.paper_id 
           WHERE f2.component_signature = a.component_signature 
           LIMIT 1) AS paper_doi
        FROM aggregated a
        JOIN formulation_components fc ON fc.formulation_id = a.formulation_id
        JOIN cpa_chemicals c ON c.id = fc.chemical_id
        GROUP BY a.formulation_id, a.component_signature, a.paper_count
        ORDER BY a.paper_count DESC
      `, [chemicalIds, limit, offset, numChemicals]);

      // Get total count of unique signatures (using AND logic)
      const countResult = await client.query(`
        WITH matching_formulations AS (
          SELECT f.component_signature
          FROM formulations f
          JOIN formulation_components fc ON fc.formulation_id = f.id
          WHERE fc.chemical_id = ANY($1::uuid[])
            AND f.component_signature IS NOT NULL
          GROUP BY f.id, f.component_signature
          HAVING COUNT(DISTINCT fc.chemical_id) = $2
        )
        SELECT COUNT(DISTINCT component_signature) AS total
        FROM matching_formulations
      `, [chemicalIds, numChemicals]);

      await client.query('RESET statement_timeout');

      const total = parseInt(countResult.rows[0]?.total || '0', 10);

      const formulations = result.rows.map(row => ({
        formulation_id: row.formulation_id,
        formulation_label: row.formulation_label || 'Unknown formulation',
        paper_id: row.paper_id,
        paper_title: row.paper_title || 'Unknown paper',
        paper_doi: row.paper_doi,
        experiment_label: null,
        component_count: row.component_count,
        paper_count: parseInt(row.paper_count, 10),
        component_signature: row.component_signature
      }));

      return {
        formulations: formulations as FormulationSearchResult[],
        total,
        page,
        limit
      };
    } catch (error: any) {
      console.error("Formulation search error:", error.message);
      return { formulations: [], total: 0, page, limit };
    } finally {
      client.release();
    }
  }

  async getFormulationDetail(formulationId: string): Promise<FormulationDetail | undefined> {
    // Step 1: Get the component_signature for the given formulation
    const signatureResult = await pool.query(`
      SELECT component_signature, formulation_label
      FROM v_formulation_unique_components
      WHERE formulation_id = $1
    `, [formulationId]);

    if (signatureResult.rows.length === 0) {
      return undefined;
    }

    const { component_signature, formulation_label } = signatureResult.rows[0];

    // Step 2: Get all formulation IDs that share the same component_signature
    const relatedFormulationsResult = await pool.query(`
      SELECT formulation_id
      FROM v_formulation_unique_components
      WHERE component_signature = $1
    `, [component_signature]);

    const relatedFormulationIds = relatedFormulationsResult.rows.map((r: any) => r.formulation_id);

    // Step 3: Get the formulation quote from the original formulation
    const quoteResult = await pool.query(`
      SELECT DISTINCT formulation_quote
      FROM v_paper_experiments_formulations_new
      WHERE formulation_id = $1
      LIMIT 1
    `, [formulationId]);
    const formulation_quote = quoteResult.rows[0]?.formulation_quote || null;

    // Step 4: Get components for the original formulation (use just one formulation for components)
    const componentsResult = await pool.query(`
      SELECT DISTINCT
        v.component_id,
        v.display_label,
        v.chemical_id,
        c.preferred_name AS chemical_name,
        v.amount AS concentration,
        v.unit,
        v.component_role AS role
      FROM v_paper_experiments_formulations_new v
      LEFT JOIN cpa_chemicals c ON c.id = v.chemical_id
      WHERE v.formulation_id = $1
      ORDER BY v.display_label
    `, [formulationId]);

    const components: FormulationComponent[] = componentsResult.rows.map((row: any) => ({
      component_id: row.component_id,
      display_label: row.display_label,
      chemical_id: row.chemical_id,
      chemical_name: row.chemical_name,
      concentration: row.concentration,
      unit: row.unit,
      role: row.role
    }));

    // Step 5: Get ALL experiments from ALL formulations with the same component_signature
    const experimentsResult = await pool.query(`
      SELECT DISTINCT
        v.experiment_id,
        v.experiment_label,
        v.experiment_quote,
        v.cooling_method AS experiment_method,
        v.biological_context,
        v.formulation_id,
        v.formulation_label
      FROM v_paper_experiments_formulations_new v
      WHERE v.formulation_id = ANY($1)
      ORDER BY v.experiment_label
    `, [relatedFormulationIds]);

    const experiments: FormulationExperiment[] = experimentsResult.rows.map((row: any) => ({
      experiment_id: row.experiment_id,
      experiment_label: row.experiment_label,
      experiment_quote: row.experiment_quote,
      experiment_method: row.experiment_method,
      biological_context: row.biological_context,
      formulation_id: row.formulation_id,
      formulation_label: row.formulation_label
    }));

    // Step 6: Get ALL unique papers from ALL formulations with the same component_signature
    const papersResult = await pool.query(`
      SELECT DISTINCT
        p.id AS paper_id,
        p.title AS paper_title,
        p.doi AS paper_doi,
        p.authors_flat AS paper_authors,
        p.published_year AS paper_published_year,
        p.paper_url
      FROM v_paper_experiments_formulations_new v
      JOIN papers p ON p.id = v.paper_id
      WHERE v.formulation_id = ANY($1)
      ORDER BY p.title
    `, [relatedFormulationIds]);

    const papers: FormulationPaper[] = papersResult.rows.map((row: any) => ({
      paper_id: row.paper_id,
      paper_title: row.paper_title,
      paper_doi: row.paper_doi,
      paper_authors: row.paper_authors,
      paper_published_year: row.paper_published_year,
      paper_url: row.paper_url
    }));

    return {
      formulation_id: formulationId,
      formulation_label: formulation_label,
      formulation_quote: formulation_quote,
      component_signature: component_signature,
      components,
      experiments,
      papers
    };
  }

  async getChemicalFormulations(chemicalId: string, page: number = 1, limit: number = 10): Promise<FormulationPaginatedResult> {
    // Get unique formulations that contain this chemical, deduplicated by component signature
    // Filter to only include formulations with 2+ papers (well-researched)
    // Sort by paper count descending (most cited first)
    // Includes pagination support
    const offset = (page - 1) * limit;
    
    const result = await pool.query(`
      WITH unique_formulations AS (
        SELECT 
          uc.formulation_id,
          uc.formulation_label,
          uc.component_signature,
          uc.unique_chemical_count,
          ROW_NUMBER() OVER (
            PARTITION BY uc.component_signature 
            ORDER BY uc.formulation_label, uc.formulation_id
          ) AS rn
        FROM v_formulation_unique_components uc
        WHERE EXISTS (
          SELECT 1 FROM v_paper_experiments_formulations_new v 
          WHERE v.formulation_id = uc.formulation_id AND v.chemical_id = $1
        )
      ),
      signature_paper_counts AS (
        SELECT 
          uf.component_signature,
          COUNT(DISTINCT v.paper_id) AS paper_count
        FROM unique_formulations uf
        JOIN v_formulation_unique_components uc2 ON uc2.component_signature = uf.component_signature
        JOIN v_paper_experiments_formulations_new v ON v.formulation_id = uc2.formulation_id
        WHERE uf.rn = 1
        GROUP BY uf.component_signature
        HAVING COUNT(DISTINCT v.paper_id) >= 2
      )
      SELECT DISTINCT
        uf.formulation_id,
        uf.formulation_label,
        v.paper_id,
        p.title AS paper_title,
        p.doi AS paper_doi,
        v.experiment_label,
        uf.component_signature,
        uf.unique_chemical_count AS component_count,
        spc.paper_count
      FROM unique_formulations uf
      JOIN signature_paper_counts spc ON spc.component_signature = uf.component_signature
      JOIN v_paper_experiments_formulations_new v ON v.formulation_id = uf.formulation_id
      JOIN papers p ON p.id = v.paper_id
      WHERE uf.rn = 1
      ORDER BY spc.paper_count DESC, uf.unique_chemical_count ASC, uf.formulation_label
      LIMIT $2 OFFSET $3
    `, [chemicalId, limit, offset]);
    
    // Get total count for pagination
    const countResult = await pool.query(`
      WITH unique_formulations AS (
        SELECT 
          uc.formulation_id,
          uc.component_signature,
          ROW_NUMBER() OVER (
            PARTITION BY uc.component_signature 
            ORDER BY uc.formulation_label, uc.formulation_id
          ) AS rn
        FROM v_formulation_unique_components uc
        WHERE EXISTS (
          SELECT 1 FROM v_paper_experiments_formulations_new v 
          WHERE v.formulation_id = uc.formulation_id AND v.chemical_id = $1
        )
      ),
      signature_paper_counts AS (
        SELECT 
          uf.component_signature,
          COUNT(DISTINCT v.paper_id) AS paper_count
        FROM unique_formulations uf
        JOIN v_formulation_unique_components uc2 ON uc2.component_signature = uf.component_signature
        JOIN v_paper_experiments_formulations_new v ON v.formulation_id = uc2.formulation_id
        WHERE uf.rn = 1
        GROUP BY uf.component_signature
        HAVING COUNT(DISTINCT v.paper_id) >= 2
      )
      SELECT COUNT(*) as total FROM signature_paper_counts
    `, [chemicalId]);
    
    const total = parseInt(countResult.rows[0]?.total || '0', 10);
    
    return {
      formulations: result.rows as FormulationSearchResult[],
      total,
      page,
      limit
    };
  }

  // Get experiments and formulations for a paper using the new view
  async getPaperExperimentsAndFormulations(paperId: string): Promise<any[]> { // review - change any[] to CryopreservationComponent[]
    const result = await pool.query(`
      SELECT *
      FROM v_paper_experiments_formulations_new
      WHERE paper_id = $1
      ORDER BY experiment_id, formulation_id, component_id
    `, [paperId]);
    
    return result.rows;
  }

  // Get papers and experiments for a chemical (reverse lookup)
  async getChemicalPapersAndExperiments(chemicalId: string): Promise<any[]> {
    const result = await pool.query(`
      SELECT DISTINCT
        v.paper_id,
        v.experiment_id,
        v.experiment_label,
        v.cooling_method,
        v.rewarming_method,
        v.biological_context,
        v.experiment_quote,
        p.title AS paper_title,
        p.doi AS paper_doi,
        p.paper_url AS paper_link
      FROM v_paper_experiments_formulations_new v
      JOIN papers p ON p.id = v.paper_id
      WHERE v.chemical_id = $1
      ORDER BY p.title, v.experiment_id
    `, [chemicalId]);
    
    return result.rows;
  }

  // Admin methods for chemical curation
  async createChemical(preferredName: string, inchikey?: string, role?: string): Promise<CpaChemical> {
    const result = await pool.query(`
      INSERT INTO cpa_chemicals (preferred_name, inchikey, role, source, batch_id)
      VALUES ($1, $2, $3, 'manual', NULL)
      RETURNING id, inchikey, preferred_name, role, source, batch_id
    `, [preferredName, inchikey || null, role || null]);
    
    return result.rows[0] as CpaChemical;
  }

  async getAllChemicalsForAdmin(): Promise<CpaChemical[]> {
    const result = await pool.query(`
      SELECT c.id, c.inchikey, c.preferred_name, c.role, c.hidden
      FROM cpa_chemicals c
      WHERE EXISTS (
        SELECT 1 FROM v_cpa_property_values vpv 
        WHERE vpv.chemical_id = c.id
      )
      ORDER BY c.preferred_name
    `);
    return result.rows as CpaChemical[];
  }

  async getChemicalPropertyIds(chemicalId: string): Promise<PropertyMigration[]> {
    const result = await pool.query(`
      SELECT 
        prop.id as property_id,
        prop.prop_type,
        COUNT(cpv.id) as value_count
      FROM chemical_properties prop
      LEFT JOIN chemical_property_values cpv ON cpv.property_id = prop.id
      WHERE prop.chemical_id = $1::uuid
      GROUP BY prop.id, prop.prop_type
      ORDER BY prop.prop_type
    `, [chemicalId]);
    
    return result.rows.map((row: any) => ({
      property_id: row.property_id,
      prop_type: row.prop_type,
      value_count: parseInt(row.value_count)
    })) as PropertyMigration[];
  }

  async getChemicalPropertyValuesForMigration(chemicalId: string): Promise<PropertyValueForMigration[]> {
    const result = await pool.query(`
      SELECT 
        cpv.id as value_id,
        prop.prop_type,
        CASE 
          WHEN cpv.value_kind = 'POINT' THEN cpv.numeric_value::text
          WHEN cpv.value_kind = 'RANGE' THEN cpv.range_min::text || ' - ' || cpv.range_max::text
          ELSE cpv.raw_value
        END as value,
        cpv.unit,
        cpv.value_kind,
        COUNT(ref.id) as reference_count
      FROM chemical_properties prop
      JOIN chemical_property_values cpv ON cpv.property_id = prop.id
      LEFT JOIN cpa_references ref ON ref.property_value_id = cpv.id
      WHERE prop.chemical_id = $1::uuid
      GROUP BY cpv.id, prop.prop_type, cpv.value_kind, cpv.numeric_value, cpv.range_min, cpv.range_max, cpv.raw_value, cpv.unit
      ORDER BY prop.prop_type, cpv.value_kind, value
    `, [chemicalId]);
    
    return result.rows.map((row: any) => ({
      value_id: row.value_id,
      prop_type: row.prop_type,
      value: row.value,
      unit: row.unit,
      value_kind: row.value_kind,
      reference_count: parseInt(row.reference_count)
    })) as PropertyValueForMigration[];
  }

  async migrateProperties(propertyIds: string[], targetChemicalId: string): Promise<void> {
    // Update the chemical_id in chemical_properties table for the specified property IDs
    if (propertyIds.length === 0) {
      return;
    }

    const placeholders = propertyIds.map((_, i) => `$${i + 2}`).join(', ');
    await pool.query(`
      UPDATE chemical_properties
      SET chemical_id = $1::uuid
      WHERE id IN (${placeholders})
    `, [targetChemicalId, ...propertyIds]);
  }

  async migratePropertyValues(valueIds: string[], targetChemicalId: string): Promise<void> {
    // For each value, we need to:
    // 1. Find or create the corresponding property on the target chemical
    // 2. Update the property_id of the value to point to the target's property
    
    if (valueIds.length === 0) {
      return;
    }
    
    // Use a transaction to ensure atomicity
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Step 1: Get all unique prop_types from the values we're migrating
      // Note: value_ids are UUIDs from chemical_property_values.id
      const propTypesResult = await client.query(`
        SELECT DISTINCT prop.prop_type
        FROM chemical_property_values cpv
        JOIN chemical_properties prop ON cpv.property_id = prop.id
        WHERE cpv.id::text = ANY($1::text[])
      `, [valueIds]);
      
      const propTypes = propTypesResult.rows.map((row: any) => row.prop_type);
      
      // Step 2: Ensure all necessary properties exist on the target chemical
      for (const propType of propTypes) {
        await client.query(`
          INSERT INTO chemical_properties (chemical_id, prop_type, source, batch_id)
          SELECT $1::uuid, $2, 'manual', NULL
          WHERE NOT EXISTS (
            SELECT 1 FROM chemical_properties 
            WHERE chemical_id = $1::uuid AND prop_type = $2
          )
        `, [targetChemicalId, propType]);
      }
      
      // Step 3: Update the values to point to the target chemical's properties
      // Mark migrated values as manual curation
      await client.query(`
        UPDATE chemical_property_values cpv
        SET property_id = target_prop.id,
            source = 'manual',
            batch_id = NULL
        FROM chemical_properties source_prop
        JOIN chemical_properties target_prop 
          ON target_prop.chemical_id = $1::uuid 
          AND target_prop.prop_type = source_prop.prop_type
        WHERE cpv.property_id = source_prop.id
          AND cpv.id::text = ANY($2::text[])
      `, [targetChemicalId, valueIds]);
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateChemicalName(chemicalId: string, preferredName: string): Promise<void> {
    await pool.query(`
      UPDATE cpa_chemicals
      SET preferred_name = $1,
          source = 'manual',
          batch_id = NULL
      WHERE id = $2::uuid
    `, [preferredName, chemicalId]);
  }

  async updateChemicalRole(chemicalId: string, role: string): Promise<void> {
    const validRoles = ['CPA', 'ADJUVANT', 'CARRIER'];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }
    
    await pool.query(`
      UPDATE cpa_chemicals
      SET role = $1,
          source = 'manual',
          batch_id = NULL
      WHERE id = $2::uuid
    `, [role, chemicalId]);
  }

  async addChemicalSynonym(chemicalId: string, synonym: string): Promise<void> {
    // Add to cpa_chemical_aliases table with source='manual'
    // Note: embedding will need to be generated separately for semantic search
    await pool.query(`
      INSERT INTO cpa_chemical_aliases (chemical_id, alias, is_preferred, source, batch_id)
      VALUES ($1::uuid, $2, false, 'manual', NULL)
      ON CONFLICT (alias) DO NOTHING
    `, [chemicalId, synonym]);
  }

  async removeChemicalSynonym(chemicalId: string, synonym: string): Promise<void> {
    // Soft-delete from cpa_chemical_aliases table by setting hidden=true
    await pool.query(`
      UPDATE cpa_chemical_aliases
      SET hidden = true
      WHERE chemical_id = $1::uuid AND alias = $2
    `, [chemicalId, synonym]);
  }

  async updateChemicalSynonym(chemicalId: string, oldSynonym: string, newSynonym: string): Promise<void> {
    // Update in cpa_chemical_aliases table and mark as manual
    await pool.query(`
      UPDATE cpa_chemical_aliases
      SET alias = $1,
          source = 'manual',
          batch_id = NULL
      WHERE chemical_id = $2::uuid AND alias = $3
    `, [newSynonym, chemicalId, oldSynonym]);
  }

  async toggleSynonymVisibility(chemicalId: string, synonym: string, hidden: boolean): Promise<void> {
    // Toggle synonym visibility - hidden synonyms are filtered out for non-admin users
    await pool.query(`
      UPDATE cpa_chemical_aliases
      SET hidden = $1
      WHERE chemical_id = $2::uuid AND alias = $3
    `, [hidden, chemicalId, synonym]);
  }

  async deleteChemicalSynonym(chemicalId: string, synonym: string): Promise<void> {
    // Hard delete from cpa_chemical_aliases table - permanently removes the record
    await pool.query(`
      DELETE FROM cpa_chemical_aliases
      WHERE chemical_id = $1::uuid AND alias = $2
    `, [chemicalId, synonym]);
  }

  async togglePropertyValueVisibility(valueId: string, hidden: boolean): Promise<void> {
    // Soft-delete: Toggle hidden flag instead of deleting
    // Mark as manual curation when toggling visibility
    await pool.query(`
      UPDATE chemical_property_values
      SET hidden = $1,
          source = 'manual',
          batch_id = NULL
      WHERE id = $2
    `, [hidden, valueId]);
  }

  async toggleChemicalVisibility(chemicalId: string, hidden: boolean): Promise<void> {
    // Toggle chemical visibility - hidden chemicals are filtered out for non-admin users
    await pool.query(`
      UPDATE cpa_chemicals
      SET hidden = $1
      WHERE id = $2::uuid
    `, [hidden, chemicalId]);
  }

  async cloneChemical(chemicalId: string): Promise<CpaChemical> {
    // Clone a chemical with all its properties, values, aliases, and references
    // All cloned data is marked as source='manual' and batch_id=NULL
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Step 1: Get the original chemical
      const originalChemical = await client.query(`
        SELECT * FROM cpa_chemicals WHERE id = $1::uuid
      `, [chemicalId]);
      
      if (originalChemical.rows.length === 0) {
        throw new Error('Chemical not found');
      }
      
      const original = originalChemical.rows[0];
      
      // Step 2: Create new chemical with "Copy of" prefix and timestamp for uniqueness
      const timestamp = Date.now();
      const newChemicalResult = await client.query(`
        INSERT INTO cpa_chemicals (preferred_name, inchikey, role, source, batch_id)
        VALUES ($1, $2, $3, 'manual', NULL)
        RETURNING id, inchikey, preferred_name, role, source, batch_id
      `, [`Copy of ${original.preferred_name} (${timestamp})`, original.inchikey, original.role]);
      
      const newChemical = newChemicalResult.rows[0];
      const newChemicalId = newChemical.id;
      
      // Step 3: Copy all chemical_properties
      await client.query(`
        INSERT INTO chemical_properties (chemical_id, prop_type, source, batch_id)
        SELECT $1::uuid, prop_type, 'manual', NULL
        FROM chemical_properties
        WHERE chemical_id = $2::uuid
      `, [newChemicalId, chemicalId]);
      
      // Step 4: Copy all chemical_property_values
      await client.query(`
        INSERT INTO chemical_property_values (
          property_id, value_kind, numeric_value, range_min, range_max, 
          raw_value, unit, extra, hidden, source, batch_id
        )
        SELECT new_prop.id, cpv.value_kind, cpv.numeric_value, cpv.range_min, cpv.range_max,
               cpv.raw_value, cpv.unit, cpv.extra, cpv.hidden, 'manual', NULL
        FROM chemical_property_values cpv
        JOIN chemical_properties old_prop ON cpv.property_id = old_prop.id
        JOIN chemical_properties new_prop ON new_prop.chemical_id = $1::uuid 
          AND new_prop.prop_type = old_prop.prop_type
        WHERE old_prop.chemical_id = $2::uuid
      `, [newChemicalId, chemicalId]);
      
      // Step 5: Copy all cpa_chemical_aliases (synonyms) including embeddings
      // Note: Appending suffix to aliases to avoid global unique constraint conflicts
      await client.query(`
        INSERT INTO cpa_chemical_aliases (chemical_id, alias, is_preferred, embedding, source, batch_id)
        SELECT $1::uuid, 
               alias || ' (clone ' || LEFT($1::text, 8) || ')', 
               is_preferred, 
               embedding, 
               'manual', 
               NULL
        FROM cpa_chemical_aliases
        WHERE chemical_id = $2::uuid
      `, [newChemicalId, chemicalId]);
      
      // Step 6: Copy all cpa_references
      await client.query(`
        INSERT INTO cpa_references (property_value_id, paper_id, quote, link, source, batch_id)
        SELECT new_cpv.id, ref.paper_id, ref.quote, ref.link, 'manual', NULL
        FROM cpa_references ref
        JOIN chemical_property_values old_cpv ON ref.property_value_id = old_cpv.id
        JOIN chemical_properties old_prop ON old_cpv.property_id = old_prop.id
        JOIN chemical_properties new_prop ON new_prop.chemical_id = $1::uuid 
          AND new_prop.prop_type = old_prop.prop_type
        JOIN chemical_property_values new_cpv ON new_cpv.property_id = new_prop.id
          AND new_cpv.value_kind = old_cpv.value_kind
          AND COALESCE(new_cpv.numeric_value::text, '') = COALESCE(old_cpv.numeric_value::text, '')
          AND COALESCE(new_cpv.unit, '') = COALESCE(old_cpv.unit, '')
        WHERE old_prop.chemical_id = $2::uuid
      `, [newChemicalId, chemicalId]);
      
      await client.query('COMMIT');
      
      return newChemical as CpaChemical;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async mergeChemical(sourceId: string, targetId: string): Promise<void> {
    // Merge source chemical into target chemical:
    // For conflicting properties (same prop_type):
    //   - Migrate property VALUES from source property_id to target property_id
    //   - Delete the source property record
    // For non-conflicting properties:
    //   - Move entire property record to target chemical
    // For aliases: move non-conflicting, delete conflicting
    // Finally hide the source chemical
    // Mark all moved data as source='manual' and batch_id=NULL
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Verify both chemicals exist
      const sourceCheck = await client.query(
        'SELECT id FROM cpa_chemicals WHERE id = $1::uuid',
        [sourceId]
      );
      const targetCheck = await client.query(
        'SELECT id FROM cpa_chemicals WHERE id = $1::uuid',
        [targetId]
      );
      
      if (sourceCheck.rows.length === 0) {
        throw new Error('Source chemical not found');
      }
      if (targetCheck.rows.length === 0) {
        throw new Error('Target chemical not found');
      }
      
      // Step 1: Handle conflicting properties (same prop_type on both chemicals)
      // For each conflict, migrate property values from source to target, then delete source property
      await client.query(`
        UPDATE chemical_property_values
        SET property_id = target_prop.id,
            source = 'manual',
            batch_id = NULL
        FROM chemical_properties source_prop
        JOIN chemical_properties target_prop 
          ON target_prop.chemical_id = $2::uuid 
          AND target_prop.prop_type = source_prop.prop_type
        WHERE chemical_property_values.property_id = source_prop.id
          AND source_prop.chemical_id = $1::uuid
      `, [sourceId, targetId]);
      
      // Delete the now-empty source property records for conflicting properties
      await client.query(`
        DELETE FROM chemical_properties
        WHERE chemical_id = $1::uuid
        AND prop_type IN (
          SELECT prop_type FROM chemical_properties WHERE chemical_id = $2::uuid
        )
      `, [sourceId, targetId]);
      
      // Step 2: Move remaining non-conflicting properties to target
      await client.query(`
        UPDATE chemical_properties
        SET chemical_id = $1::uuid,
            source = 'manual',
            batch_id = NULL
        WHERE chemical_id = $2::uuid
      `, [targetId, sourceId]);
      
      // Step 3: Handle cpa_chemical_aliases
      // Delete source aliases that would conflict (same alias exists on target)
      await client.query(`
        DELETE FROM cpa_chemical_aliases
        WHERE chemical_id = $1::uuid
        AND alias IN (
          SELECT alias FROM cpa_chemical_aliases WHERE chemical_id = $2::uuid
        )
      `, [sourceId, targetId]);
      
      // Move remaining non-conflicting aliases to target
      await client.query(`
        UPDATE cpa_chemical_aliases
        SET chemical_id = $1::uuid,
            source = 'manual',
            batch_id = NULL
        WHERE chemical_id = $2::uuid
      `, [targetId, sourceId]);
      
      // Step 4: Re-point all formulation components from source to target chemical
      // This is critical for proper formulation aggregation across papers
      await client.query(`
        UPDATE formulation_components
        SET chemical_id = $1::uuid
        WHERE chemical_id = $2::uuid
      `, [targetId, sourceId]);
      
      // Step 5: Hide the source chemical and mark as duplicate
      await client.query(`
        UPDATE cpa_chemicals
        SET hidden = true,
            duplicated = true,
            dedup_chem_id = $2::uuid
        WHERE id = $1::uuid
      `, [sourceId, targetId]);
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getAvailableBiologicalContextValues(): Promise<{species: string[], organs: string[], tissues: string[], cellTypes: string[]}> {
    const result = await pool.query(`
      SELECT DISTINCT
        biological_context->>'species' as species,
        biological_context->>'organ' as organ,
        biological_context->>'tissue' as tissue,
        biological_context->>'cell_line' as cell_type
      FROM v_paper_experiments_formulations_new
      WHERE biological_context IS NOT NULL
    `);
    
    const species = new Set<string>();
    const organs = new Set<string>();
    const tissues = new Set<string>();
    const cellTypes = new Set<string>();
    
    result.rows.forEach((row: any) => {
      if (row.species) species.add(row.species);
      if (row.organ) organs.add(row.organ);
      if (row.tissue) tissues.add(row.tissue);
      if (row.cell_type) cellTypes.add(row.cell_type);
    });
    
    return {
      species: Array.from(species).sort(),
      organs: Array.from(organs).sort(),
      tissues: Array.from(tissues).sort(),
      cellTypes: Array.from(cellTypes).sort()
    };
  }

  async getFilteredBiologicalContextValues(
    chemicalIds?: string[], 
    species?: string, 
    organ?: string, 
    tissue?: string
  ): Promise<{species: string[], organs: string[], tissues: string[], cellTypes: string[]}> {
    const conditions: string[] = ['biological_context IS NOT NULL'];
    const params: any[] = [];
    let paramIndex = 1;

    // Filter by selected chemicals (OR logic - any experiment containing at least one of the chemicals)
    if (chemicalIds && chemicalIds.length > 0) {
      const placeholders = chemicalIds.map((_, i) => `$${paramIndex + i}`).join(', ');
      conditions.push(`formulation_id IN (
        SELECT DISTINCT formulation_id 
        FROM v_paper_experiments_formulations_new 
        WHERE chemical_id IN (${placeholders})
      )`);
      params.push(...chemicalIds);
      paramIndex += chemicalIds.length;
    }

    // Cascading filter: filter by species if selected
    if (species) {
      conditions.push(`biological_context->>'species' = $${paramIndex}`);
      params.push(species);
      paramIndex++;
    }

    // Cascading filter: filter by organ if selected
    if (organ) {
      conditions.push(`biological_context->>'organ' = $${paramIndex}`);
      params.push(organ);
      paramIndex++;
    }

    // Cascading filter: filter by tissue if selected
    if (tissue) {
      conditions.push(`biological_context->>'tissue' = $${paramIndex}`);
      params.push(tissue);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(`
      SELECT DISTINCT
        biological_context->>'species' as species,
        biological_context->>'organ' as organ,
        biological_context->>'tissue' as tissue,
        biological_context->>'cell_line' as cell_type
      FROM v_paper_experiments_formulations_new
      ${whereClause}
    `, params);
    
    const speciesSet = new Set<string>();
    const organs = new Set<string>();
    const tissues = new Set<string>();
    const cellTypes = new Set<string>();
    
    result.rows.forEach((row: any) => {
      if (row.species) speciesSet.add(row.species);
      if (row.organ) organs.add(row.organ);
      if (row.tissue) tissues.add(row.tissue);
      if (row.cell_type) cellTypes.add(row.cell_type);
    });
    
    return {
      species: Array.from(speciesSet).sort(),
      organs: Array.from(organs).sort(),
      tissues: Array.from(tissues).sort(),
      cellTypes: Array.from(cellTypes).sort()
    };
  }

  async advancedSearchStudies(filters: AdvancedSearchFilters): Promise<AdvancedSearchResult[]> {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Chemical filter - find experiments with formulations containing specific chemicals
    if (filters.chemicalIds && filters.chemicalIds.length > 0) {
      const placeholders = filters.chemicalIds.map((_, i) => `$${paramIndex + i}`).join(', ');
      conditions.push(`v.chemical_id IN (${placeholders})`);
      params.push(...filters.chemicalIds);
      paramIndex += filters.chemicalIds.length;
    }

    // Chemical role filter
    if (filters.chemicalRole) {
      conditions.push(`v.component_role = $${paramIndex}`);
      params.push(filters.chemicalRole);
      paramIndex++;
    }

    // Biological context filters
    if (filters.species) {
      conditions.push(`v.biological_context->>'species' ILIKE $${paramIndex}`);
      params.push(`%${filters.species}%`);
      paramIndex++;
    }

    if (filters.organ) {
      conditions.push(`v.biological_context->>'organ' ILIKE $${paramIndex}`);
      params.push(`%${filters.organ}%`);
      paramIndex++;
    }

    if (filters.tissue) {
      conditions.push(`v.biological_context->>'tissue' ILIKE $${paramIndex}`);
      params.push(`%${filters.tissue}%`);
      paramIndex++;
    }

    if (filters.cellType) {
      conditions.push(`v.biological_context->>'cell_line' ILIKE $${paramIndex}`);
      params.push(`%${filters.cellType}%`);
      paramIndex++;
    }

    // Concentration filters (amount field in the view)
    // Note: Filters on raw stored values without unit normalization
    if (filters.concentrationMin !== undefined) {
      conditions.push(`(v.amount->>'value')::numeric >= $${paramIndex}`);
      params.push(filters.concentrationMin);
      paramIndex++;
    }

    if (filters.concentrationMax !== undefined) {
      conditions.push(`(v.amount->>'value')::numeric <= $${paramIndex}`);
      params.push(filters.concentrationMax);
      paramIndex++;
    }

    // Temperature filters - query experiments with temperature in biological_context
    // Note: Filters on raw stored values without unit normalization
    if (filters.temperatureMin !== undefined) {
      conditions.push(`(v.biological_context->'temperature'->>'value')::numeric >= $${paramIndex}`);
      params.push(filters.temperatureMin);
      paramIndex++;
    }

    if (filters.temperatureMax !== undefined) {
      conditions.push(`(v.biological_context->'temperature'->>'value')::numeric <= $${paramIndex}`);
      params.push(filters.temperatureMax);
      paramIndex++;
    }

    // Keyword search - search across multiple text fields
    if (filters.keyword) {
      const keywordPattern = `%${filters.keyword}%`;
      conditions.push(`(
        p.title ILIKE $${paramIndex}
        OR p.abstract ILIKE $${paramIndex}
        OR v.experiment_label ILIKE $${paramIndex}
        OR v.formulation_label ILIKE $${paramIndex}
        OR v.display_label ILIKE $${paramIndex}
        OR v.experiment_quote ILIKE $${paramIndex}
      )`);
      params.push(keywordPattern);
      paramIndex++;
    }

    // Publication year range filters
    if (filters.yearFrom !== undefined) {
      conditions.push(`p.published_year >= $${paramIndex}`);
      params.push(filters.yearFrom);
      paramIndex++;
    }

    if (filters.yearTo !== undefined) {
      conditions.push(`p.published_year <= $${paramIndex}`);
      params.push(filters.yearTo);
      paramIndex++;
    }

    // Author search
    if (filters.authorQuery) {
      conditions.push(`p.authors_flat ILIKE $${paramIndex}`);
      params.push(`%${filters.authorQuery}%`);
      paramIndex++;
    }

    // Journal search
    if (filters.journalQuery) {
      conditions.push(`p.journal ILIKE $${paramIndex}`);
      params.push(`%${filters.journalQuery}%`);
      paramIndex++;
    }

    // DOI search (partial match)
    if (filters.doiQuery) {
      conditions.push(`p.doi ILIKE $${paramIndex}`);
      params.push(`%${filters.doiQuery}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // First, get the matching papers with their experiments
    const query = `
      WITH matching_data AS (
        SELECT DISTINCT
          p.id as paper_id,
          p.title as paper_title,
          p.doi as paper_doi,
          p.authors_flat as paper_authors,
          p.paper_url,
          p.published_year,
          v.experiment_id,
          v.experiment_label,
          v.cooling_method as experiment_method,
          v.biological_context,
          v.formulation_id,
          v.formulation_label,
          v.component_id,
          v.chemical_id,
          c.preferred_name as chemical_name,
          v.display_label,
          v.amount,
          v.unit,
          v.component_role
        FROM v_paper_experiments_formulations_new v
        JOIN papers p ON p.id = v.paper_id
        LEFT JOIN cpa_chemicals c ON c.id = v.chemical_id
        ${whereClause}
        ORDER BY p.title, v.experiment_label, v.formulation_label
      )
      SELECT * FROM matching_data
    `;

    const result = await pool.query(query, params);

    // Group results by paper -> experiment -> formulation
    const papersMap = new Map<string, AdvancedSearchResult>();

    result.rows.forEach((row: any) => {
      // Get or create paper
      if (!papersMap.has(row.paper_id)) {
        papersMap.set(row.paper_id, {
          paper_id: row.paper_id,
          paper_title: row.paper_title,
          paper_doi: row.paper_doi,
          paper_authors: row.paper_authors,
          paper_url: row.paper_url,
          published_year: row.published_year,
          experiments: []
        });
      }
      const paper = papersMap.get(row.paper_id)!;

      // Get or create experiment
      let experiment = paper.experiments.find(e => e.experiment_id === row.experiment_id);
      if (!experiment) {
        experiment = {
          experiment_id: row.experiment_id,
          experiment_label: row.experiment_label,
          experiment_method: row.experiment_method,
          biological_context: row.biological_context,
          formulations: []
        };
        paper.experiments.push(experiment);
      }

      // Get or create formulation
      let formulation = experiment.formulations.find(f => f.formulation_id === row.formulation_id);
      if (!formulation) {
        formulation = {
          formulation_id: row.formulation_id,
          formulation_label: row.formulation_label,
          components: []
        };
        experiment.formulations.push(formulation);
      }

      // Add component if not already added
      if (row.component_id && !formulation.components.find(c => c.chemical_id === row.chemical_id && c.display_label === row.display_label)) {
        formulation.components.push({
          chemical_id: row.chemical_id,
          chemical_name: row.chemical_name,
          display_label: row.display_label,
          concentration: row.amount ? JSON.stringify(row.amount) : null,
          unit: row.unit,
          role: row.component_role
        });
      }
    });

    return Array.from(papersMap.values());
  }

  async advancedSearchMolecules(filters: AdvancedSearchFilters): Promise<MoleculeSearchResult[]> {
    // Build dynamic WHERE conditions based on filters
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Chemical IDs filter (used when property filtering pre-selects chemicals)
    if (filters.chemicalIds && filters.chemicalIds.length > 0) {
      conditions.push(`c.id = ANY($${paramIndex}::uuid[])`);
      params.push(filters.chemicalIds);
      paramIndex++;
    }

    // Chemical role filter
    if (filters.chemicalRole) {
      conditions.push(`c.role = $${paramIndex}`);
      params.push(filters.chemicalRole);
      paramIndex++;
    }

    // Property range filter - join with property values and apply unit conversion
    let propertyJoin = '';
    if (filters.propertyType) {
      propertyJoin = `
        JOIN chemical_properties cp ON cp.chemical_id = c.id
        JOIN chemical_property_values cpv ON cpv.property_id = cp.id AND cpv.hidden = false
      `;
      conditions.push(`cp.prop_type = $${paramIndex}`);
      params.push(filters.propertyType);
      paramIndex++;

      // Build unit conversion SQL for the property type
      const convertedValueSQL = buildUnitConversionSQL(
        filters.propertyType as PropertyType, 
        'COALESCE(cpv.numeric_value::numeric, cpv.range_min::numeric, cpv.range_max::numeric)'
      );
      const convertedMaxSQL = buildUnitConversionSQL(
        filters.propertyType as PropertyType, 
        'COALESCE(cpv.numeric_value::numeric, cpv.range_max::numeric, cpv.range_min::numeric)'
      );

      if (filters.propertyMin !== undefined) {
        conditions.push(`${convertedValueSQL} >= $${paramIndex}`);
        params.push(filters.propertyMin);
        paramIndex++;
      }

      if (filters.propertyMax !== undefined) {
        conditions.push(`${convertedMaxSQL} <= $${paramIndex}`);
        params.push(filters.propertyMax);
        paramIndex++;
      }
    }

    // Biological context filter - join through formulations/experiments
    let bioContextJoin = '';
    const hasBioContextFilters = filters.species || filters.organ || filters.tissue || filters.cellType;
    if (hasBioContextFilters) {
      bioContextJoin = `
        JOIN formulation_components fc ON fc.chemical_id = c.id
        JOIN formulations f ON f.id = fc.formulation_id
        JOIN experiments e ON e.id = f.experiment_id
      `;

      if (filters.species) {
        conditions.push(`e.biological_context->>'species' = $${paramIndex}`);
        params.push(filters.species);
        paramIndex++;
      }
      if (filters.organ) {
        conditions.push(`e.biological_context->>'organ' = $${paramIndex}`);
        params.push(filters.organ);
        paramIndex++;
      }
      if (filters.tissue) {
        conditions.push(`e.biological_context->>'tissue' = $${paramIndex}`);
        params.push(filters.tissue);
        paramIndex++;
      }
      if (filters.cellType) {
        conditions.push(`e.biological_context->>'cell_line' = $${paramIndex}`);
        params.push(filters.cellType);
        paramIndex++;
      }
    }

    // Keyword search - search in chemical name and aliases
    if (filters.keyword) {
      const keywordPattern = `%${filters.keyword}%`;
      conditions.push(`(c.preferred_name ILIKE $${paramIndex} OR EXISTS (
        SELECT 1 FROM cpa_chemical_aliases ca 
        WHERE ca.chemical_id = c.id AND ca.alias ILIKE $${paramIndex} AND ca.hidden = false
      ))`);
      params.push(keywordPattern);
      paramIndex++;
    }

    // Base filter: not hidden
    conditions.push('c.hidden = false');

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Query to find matching chemicals with their properties
    const query = `
      WITH matching_chemicals AS (
        SELECT DISTINCT c.id, c.preferred_name, c.role, c.inchikey
        FROM cpa_chemicals c
        ${propertyJoin}
        ${bioContextJoin}
        ${whereClause}
      ),
      chemical_properties_agg AS (
        SELECT 
          mc.id,
          mc.preferred_name,
          mc.role,
          mc.inchikey,
          json_agg(
            json_build_object(
              'prop_type', cp.prop_type,
              'value', COALESCE(cpv.numeric_value::text, cpv.raw_value, 
                CASE 
                  WHEN cpv.range_min IS NOT NULL AND cpv.range_max IS NOT NULL 
                  THEN cpv.range_min::text || '-' || cpv.range_max::text
                  ELSE NULL
                END),
              'unit', cpv.unit
            )
          ) FILTER (WHERE cp.id IS NOT NULL) as properties
        FROM matching_chemicals mc
        LEFT JOIN chemical_properties cp ON cp.chemical_id = mc.id
        LEFT JOIN chemical_property_values cpv ON cpv.property_id = cp.id AND cpv.hidden = false
        GROUP BY mc.id, mc.preferred_name, mc.role, mc.inchikey
      ),
      study_counts AS (
        SELECT 
          c.id as chemical_id,
          COUNT(DISTINCT e.id) as study_count
        FROM matching_chemicals c
        LEFT JOIN formulation_components fc ON fc.chemical_id = c.id
        LEFT JOIN formulations f ON f.id = fc.formulation_id
        LEFT JOIN experiments e ON e.id = f.experiment_id
        GROUP BY c.id
      )
      SELECT 
        cpa.id,
        cpa.preferred_name,
        cpa.role,
        cpa.inchikey,
        COALESCE(cpa.properties, '[]'::json) as properties,
        COALESCE(sc.study_count, 0) as study_count
      FROM chemical_properties_agg cpa
      LEFT JOIN study_counts sc ON sc.chemical_id = cpa.id
      ORDER BY cpa.preferred_name
    `;

    try {
      const result = await pool.query(query, params);

      return result.rows.map((row: any) => ({
        id: row.id,
        preferred_name: row.preferred_name,
        role: row.role,
        inchikey: row.inchikey,
        properties: row.properties || [],
        study_count: parseInt(row.study_count) || 0
      }));
    } catch (error) {
      console.error('advancedSearchMolecules error:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
