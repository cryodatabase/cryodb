import { 
  papers, 
  chemicalAgents, 
  agentProperties, 
  cpaChemicals,
  type Paper, 
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
}

export class MemStorage implements IStorage {

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
