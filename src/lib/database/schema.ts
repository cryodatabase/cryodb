import { pgTable, text, serial, integer, boolean, jsonb, decimal, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// CPA Chemicals schema (ChemSpider-style chemicals table)
export const cpaChemicals = pgTable("cpa_chemicals", {
  id: uuid("id").primaryKey().defaultRandom(),
  inchikey: text("inchikey").unique(),
  preferred_name: text("preferred_name").notNull(),
  role: text("role"),
  synonyms: jsonb("synonyms").$type<string[]>(),
  molecular_weight: decimal("molecular_weight"),
  formula: text("formula"),
  hidden: boolean("hidden").notNull().default(false), // Visibility flag for admin control
  source: text("source").notNull().default("distiller"), // 'distiller' or 'manual'
  batch_id: integer("batch_id"), // NULL for manual edits
});

// CPA Chemical Aliases schema (for semantic search and synonym management)
export const cpaChemicalAliases = pgTable("cpa_chemical_aliases", {
  chemical_id: uuid("chemical_id").notNull(),
  alias: text("alias").notNull(),
  is_preferred: boolean("is_preferred").default(false),
  hidden: boolean("hidden").notNull().default(false), // Soft-delete flag
  source: text("source").notNull().default("distiller"), // 'distiller' or 'manual'
  batch_id: integer("batch_id"), // NULL for manual edits
});

// Chemical Properties schema
export const chemicalProperties = pgTable("chemical_properties", {
  id: serial("id").primaryKey(),
  chemical_id: uuid("chemical_id").notNull(),
  prop_type: text("prop_type").notNull(),
  source: text("source").notNull().default("distiller"), // 'distiller' or 'manual'
  batch_id: integer("batch_id"), // NULL for manual edits
});

// Chemical Property Values schema
export const chemicalPropertyValues = pgTable("chemical_property_values", {
  id: serial("id").primaryKey(),
  property_id: integer("property_id").notNull(),
  value_kind: text("value_kind").notNull(), // POINT, RANGE, RAW
  numeric_value: decimal("numeric_value"),
  range_min: decimal("range_min"),
  range_max: decimal("range_max"),
  raw_value: text("raw_value"),
  unit: text("unit"),
  extra: jsonb("extra"),
  hidden: boolean("hidden").notNull().default(false), // Soft-delete flag
  source: text("source").notNull().default("distiller"), // 'distiller' or 'manual'
  batch_id: integer("batch_id"), // NULL for manual edits
});

// CPA References schema (for property sources)
export const cpaReferences = pgTable("cpa_references", {
  id: serial("id").primaryKey(),
  property_value_id: integer("property_value_id").notNull(),
  paper_id: text("paper_id"),
  quote: text("quote"),
  link: text("link"),
  source: text("source").notNull().default("distiller"), // 'distiller' or 'manual'
  batch_id: integer("batch_id"), // NULL for manual edits
});

// Legacy schemas for backwards compatibility
export const chemicalAgents = pgTable("chemical_agents", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  agent_id: text("agent_id").notNull().unique(),
});

export const agentProperties = pgTable("agent_properties", {
  id: serial("id").primaryKey(),
  agent_id: text("agent_id").notNull(),
  prop_type: text("prop_type").notNull(),
  value: decimal("value"),
  unit: text("unit"),
  quote: text("quote"),
  property_id: text("property_id").notNull().unique(),
});

// Papers schema - matching actual database structure
export const papers = pgTable("papers", {
  id: text("id").primaryKey(),
  paper_id: text("paper_id").notNull(),
  doi: text("doi"),
  source: text("source"),
  title: text("title").notNull(),
  journal: text("journal"),
  published_year: integer("published_year"),
  published_month: integer("published_month"),
  published_day: integer("published_day"),
  abstract: text("abstract"),
  authors_json: jsonb("authors_json"),
  authors_flat: text("authors_flat"),
  paper_url: text("paper_url"),
  download_url: text("download_url"),
  is_free_fulltext: boolean("is_free_fulltext"),
  license: text("license"),
  md5_hash: text("md5_hash"),
  file_size_bytes: integer("file_size_bytes"),
  file_s3_uri: text("file_s3_uri"),
  fulltext_s3_uri: text("fulltext_s3_uri"),
  cpa_facts_json: jsonb("cpa_facts_json"),
  data: jsonb("cpa_facts_json"), // Alias for backwards compatibility
});

// Types for the nested data structures
export type BiologicalContext = {
  tissue?: string;
  organ?: string;
  species?: string;
  cell_line?: string | null;
  dimensions?: {
    fragment_width_mm: number;
    fragment_length_mm: number;
    fragment_thickness_mm: number;
  };
  health_status?: string;
  developmental_stage?: string;
};

export type Component = {
  note: string | null;
  role: "CPA" | "ADJUVANT" | "CARRIER";
  unit: string | null;
  label: string;
  quote: string;
  amount: {
    value: number;
    value_type: "point";
  } | {
    min: number;
    max: number;
    value_type: "range";
  } | null;
  agent_id: string;
  component_id: string;
};

export type Formulation = {
  label: string;
  quote: string;
  components: Component[];
  experiment_id: string;
  formulation_id: string;
};

export type Experiment = {
  label: string;
  quote: string;
  method: string;
  experiment_id: string;
  biological_context: BiologicalContext;
};

export type ChemicalAgent = {
  label: string;
  agent_id: string;
};

export type AgentProperty = {
  unit: string;
  quote: string;
  value: {
    value: number;
    value_type: "point";
  } | {
    min: number;
    max: number;
    value_type: "range";
  };
  agent_id: string;
  prop_type: string;
  property_id: string;
};

export type FormulationSearchResult = {
  formulation_id: string;
  formulation_label: string;
  paper_id: string;
  paper_title: string;
  paper_doi: string | null;
  experiment_label: string | null;
  component_count: number;
  component_signature?: string; // Sorted concatenated chemical UUIDs for deduplication
  paper_count?: number; // Number of distinct papers referencing this component signature
};

export type ChemicalAutocompleteResult = {
  id: string;
  preferred_name: string;
  role: string | null;
  inchikey: string | null;
  matched_alias: string | null; // The alias that matched the search query, if any
  match_type: 'preferred_name' | 'alias' | 'semantic'; // How the match was found
};

export type FormulationComponent = {
  component_id: string;
  display_label: string;
  chemical_id: string | null;
  chemical_name: string | null;
  concentration: string | null;
  unit: string | null;
  role: string | null;
};

export type FormulationExperiment = {
  experiment_id: string;
  experiment_label: string;
  experiment_quote: string | null;
  experiment_method: string | null;
  biological_context: {
    species: string | null;
    organ: string | null;
    tissue: string | null;
  } | null;
  formulation_id: string;
  formulation_label: string;
};

export type FormulationPaper = {
  paper_id: string;
  paper_title: string;
  paper_doi: string | null;
  paper_authors: string | null;
  paper_published_year: number | null;
  paper_url: string | null;
};

export type FormulationDetail = {
  formulation_id: string;
  formulation_label: string;
  formulation_quote: string | null;
  component_signature: string;
  components: FormulationComponent[];
  experiments: FormulationExperiment[];
  papers: FormulationPaper[];
};

export type PaperData = {
  link: string;
  title: string;
  paper_id: string;
  experiments: Experiment[];
  formulations: Formulation[];
  chemical_agents: ChemicalAgent[];
  agent_properties: AgentProperty[];
};

interface BiologicalPaperContext {
  organ: string | null;
  tissue: string | null;
  species: string | null;
  cell_line: string | null;
  dimensions: string | null;
  health_status: string | null;
  developmental_stage: string | null;
};

export interface CryopreservationComponent {
  paper_id: string;
  experiment_id: string;
  experiment_label: string;
  cooling_method: string;
  rewarming_method: string;
  biological_context: BiologicalPaperContext;
  experiment_quote: string;
  formulation_id: string;
  formulation_label: string;
  formulation_quote: string;
  component_id: string;
  component_role: string;
  amount: string;
  unit: string;
  component_quote: string;
  note: string | null;
  chemical_id: string;
  chemical_preferred_name: string;
  chemical_role: string;
  alias_id: string;
  alias_label: string;
};

export const insertPaperSchema = createInsertSchema(papers).omit({
  id: true,
});

// Insert schemas
export const insertCpaChemicalSchema = createInsertSchema(cpaChemicals).omit({
  id: true,
});

export const insertChemicalPropertySchema = createInsertSchema(chemicalProperties).omit({
  id: true,
});

export const insertChemicalPropertyValueSchema = createInsertSchema(chemicalPropertyValues).omit({
  id: true,
});

export const insertCpaReferenceSchema = createInsertSchema(cpaReferences).omit({
  id: true,
});

export const insertChemicalAgentSchema = createInsertSchema(chemicalAgents).omit({
  id: true,
});

export const insertAgentPropertySchema = createInsertSchema(agentProperties).omit({
  id: true,
});

// Types
export type InsertPaper = z.infer<typeof insertPaperSchema>;
export type InsertCpaChemical = z.infer<typeof insertCpaChemicalSchema>;
export type InsertChemicalProperty = z.infer<typeof insertChemicalPropertySchema>;
export type InsertChemicalPropertyValue = z.infer<typeof insertChemicalPropertyValueSchema>;
export type InsertCpaReference = z.infer<typeof insertCpaReferenceSchema>;
export type InsertChemicalAgent = z.infer<typeof insertChemicalAgentSchema>;
export type InsertAgentProperty = z.infer<typeof insertAgentPropertySchema>;

export type Paper = typeof papers.$inferSelect;
export type CpaChemical = typeof cpaChemicals.$inferSelect;
export type ChemicalProperty = typeof chemicalProperties.$inferSelect;
export type ChemicalPropertyValue = typeof chemicalPropertyValues.$inferSelect;
export type CpaReference = typeof cpaReferences.$inferSelect;
export type ChemicalAgentRecord = typeof chemicalAgents.$inferSelect;
export type AgentPropertyRecord = typeof agentProperties.$inferSelect;

// ChemSpider-style view types
export type NamesSynonymsView = {
  chemical_id: string;
  inchikey: string | null;
  preferred_name: string;
  synonym: string;
  label_type: 'preferred' | 'synonym';
  hidden?: boolean; // For admin mode to show hidden synonyms
};

export type PropertyValue = {
  value_id?: string; // Optional for backward compatibility, used for admin operations
  value: string;
  unit: string | null;
  hidden?: boolean; // Soft-delete flag for admin visibility
  sources: Array<{
    paper_id: string | null;
    doi: string | null;
    link: string | null;
    quote: string | null;
    experiment_quote: string | null;
  }>;
};

export type PropertiesView = {
  chemical_id: string;
  preferred_name: string;
  role: string | null;
  prop_type: string;
  property_values: PropertyValue[];
};

// Filterable properties view type for advanced filtering
export type FilterablePropertyView = {
  chemical_id: string;
  inchikey: string | null;
  preferred_name: string;
  role: string | null;
  prop_type: string;
  unit: string | null;
  value_kind: string;
  value_min: string | null;
  value_max: string | null;
  raw_value: string | null;
};

// Property filter request type
export type PropertyFilter = {
  prop_type: string;
  unit?: string;
  min_value?: number;
  max_value?: number;
  raw_value?: string;
};

// Advanced Search types
export type AdvancedSearchFilters = {
  // Paper-level filters
  keyword?: string;             // Free text search across paper titles, abstracts, experiments
  yearFrom?: number;            // Publication year range start
  yearTo?: number;              // Publication year range end
  authorQuery?: string;         // Author name search
  journalQuery?: string;        // Journal name search
  doiQuery?: string;            // DOI search (exact or partial)
  
  // Chemical filters
  chemicalIds?: string[];       // CPA, Carrier, or Formulation chemical IDs
  chemicalRole?: string;        // Filter by role: CPA, CARRIER, ADJUVANT
  
  // Physicochemical property filters (Use Case 2) - supports multiple properties
  propertyFilters?: PropertyFilter[];  // Array of property filters (AND logic)
  
  // Legacy single property filter (deprecated, use propertyFilters instead)
  propertyType?: string;        // Property type (e.g., MOLECULAR_WEIGHT, TG_PRIME)
  propertyMin?: number;         // Minimum property value
  propertyMax?: number;         // Maximum property value
  
  // Biological context filters
  species?: string;
  organ?: string;
  tissue?: string;
  cellType?: string;
  
  // Experiment condition filters
  temperatureMin?: number;
  temperatureMax?: number;
  concentrationMin?: number;
  concentrationMax?: number;
  concentrationUnit?: string;
};

export type AdvancedSearchExperiment = {
  experiment_id: string;
  experiment_label: string;
  experiment_method: string | null;
  biological_context: BiologicalContext | null;
  formulations: {
    formulation_id: string;
    formulation_label: string;
    components: {
      chemical_id: string | null;
      chemical_name: string | null;
      display_label: string;
      concentration: string | null;
      unit: string | null;
      role: string | null;
    }[];
  }[];
};

export type AdvancedSearchResult = {
  paper_id: string;
  paper_title: string;
  paper_doi: string | null;
  paper_authors: string | null;
  paper_url: string | null;
  published_year: number | null;
  experiments: AdvancedSearchExperiment[];
};

// Molecule search result type for Use Case 2
export type MoleculeSearchResult = {
  id: string;
  preferred_name: string;
  role: string | null;
  inchikey: string | null;
  properties: {
    prop_type: string;
    value: string;
    unit: string | null;
  }[];
  study_count: number;
};
