import { pgTable, text, serial, integer, boolean, jsonb, decimal, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// CPA Chemicals schema (ChemSpider-style chemicals table)
export const cpaChemicals = pgTable("cpa_chemicals", {
  id: uuid("id").primaryKey().defaultRandom(),
  inchikey: text("inchikey").unique(),
  preferred_name: text("preferred_name").notNull(),
  synonyms: jsonb("synonyms").$type<string[]>(),
  molecular_weight: decimal("molecular_weight"),
  formula: text("formula"),
});

// Chemical Properties schema
export const chemicalProperties = pgTable("chemical_properties", {
  id: serial("id").primaryKey(),
  chemical_id: uuid("chemical_id").notNull(),
  prop_type: text("prop_type").notNull(),
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
});

// CPA References schema (for property sources)
export const cpaReferences = pgTable("cpa_references", {
  id: serial("id").primaryKey(),
  property_value_id: integer("property_value_id").notNull(),
  paper_id: text("paper_id"),
  quote: text("quote"),
  link: text("link"),
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
  tissue: string;
  species: string;
  cell_line: string | null;
  dimensions: {
    fragment_width_mm: number;
    fragment_length_mm: number;
    fragment_thickness_mm: number;
  };
  health_status: string;
  developmental_stage: string;
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

export type PaperData = {
  link: string;
  title: string;
  paper_id: string;
  experiments: Experiment[];
  formulations: Formulation[];
  chemical_agents: ChemicalAgent[];
  agent_properties: AgentProperty[];
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

// ChemSpider-style view types
export type NamesSynonymsView = {
  chemical_id: string;
  inchikey: string | null;
  preferred_name: string;
  synonym: string;
  label_type: 'preferred' | 'synonym';
};

export type PropertyValue = {
  value: string;
  unit: string | null;
  sources: Array<{
    paper_id: string | null;
    doi: string | null;
    quote: string | null;
    link: string | null;
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

interface BiologicalPaperContext {
  organ: string | null;
  tissue: string | null;
  species: string | null;
  cell_line: string | null;
  dimensions: string | null;
  health_status: string | null;
  developmental_stage: string | null;
}

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
}

export type PropertyFilter = {
  prop_type: string;
  unit?: string;
  min_value?: number;
  max_value?: number;
  raw_value?: string;
};




/*

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
});

// Chemical Properties schema
export const chemicalProperties = pgTable("chemical_properties", {
  id: serial("id").primaryKey(),
  chemical_id: uuid("chemical_id").notNull(),
  prop_type: text("prop_type").notNull(),
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
});

// CPA References schema (for property sources)
export const cpaReferences = pgTable("cpa_references", {
  id: serial("id").primaryKey(),
  property_value_id: integer("property_value_id").notNull(),
  paper_id: text("paper_id"),
  quote: text("quote"),
  link: text("link"),
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
  tissue: string;
  species: string;
  cell_line: string | null;
  dimensions: {
    fragment_width_mm: number;
    fragment_length_mm: number;
    fragment_thickness_mm: number;
  };
  health_status: string;
  developmental_stage: string;
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
}

interface BiologicalPaperContext {
  organ: string | null;
  tissue: string | null;
  species: string | null;
  cell_line: string | null;
  dimensions: string | null;
  health_status: string | null;
  developmental_stage: string | null;
}

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

export type PaperData = {
  link: string;
  title: string;
  paper_id: string;
  experiments: Experiment[];
  formulations: Formulation[];
  chemical_agents: ChemicalAgent[];
  agent_properties: AgentProperty[];
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
};

export type PropertyValue = {
  value: string;
  unit: string | null;
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
*/