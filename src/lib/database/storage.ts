import { 
  type Paper, 
  type PaperData,
  type CpaChemical,
  type NamesSynonymsView,
  type PropertiesView,
  CryopreservationComponent
} from "./schema";
import { pool } from "./db";

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
  async getChemicalEmbeddings(/*id: string*/): Promise<CpaChemical | undefined> {
    return undefined; // Not implemented for memory storage
  }

  async getAllChemicals(): Promise<CpaChemical[]> {
    return []; // Not implemented for memory storage
  }

  async searchChemicals(/*query: string*/): Promise<CpaChemical[]> {
    return []; // Not implemented for memory storage
  }

  async semanticSearchChemicals(/*embedding: number[]*/): Promise<CpaChemical[]> {
    return []; // Not implemented for memory storage
  }

  async getChemicalNames(/*id: string*/): Promise<NamesSynonymsView[]> {
    return []; // Not implemented for memory storage
  }

  async getChemicalProperties(/*id: string*/): Promise<PropertiesView[]> {
    return []; // Not implemented for memory storage
  }

  async getChemicalPropertiesFromName(/*name: string*/): Promise<PropertiesView[]> {
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

  async getChemicalProperties(id: string): Promise<PropertiesView[]> {
    const result = await pool.query(`SELECT * FROM v_cpa_properties WHERE chemical_id = $1`, [id]);
    return result.rows as PropertiesView[];
  }

  async getChemicalPropertiesFromName(name: string): Promise<PropertiesView[]> {
    //const result = await pool.query(`SELECT * FROM v_cpa_properties WHERE preferred_name = $1`, [name]);
    const result = await pool.query(`SELECT DISTINCT
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
    `, [name]);
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
    /* const result = await pool.query(`
      SELECT *
      FROM v_paper_experiments_formulations
      WHERE paper_id = $1
      ORDER BY experiment_id, formulation_id, component_id
    `, [paperId]); */
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
