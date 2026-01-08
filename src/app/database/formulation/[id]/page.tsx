import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";


const BiologicalContextSchema = z.object({
  species: z.string().nullable().optional(),
  organ: z.string().nullable().optional(),
  tissue: z.string().nullable().optional(),
  dimensions: z.string().nullable().optional(),
});

// FormulationComponent
const FormulationComponentSchema = z.object({
  component_id: z.string(),
  display_label: z.string(),
  chemical_id: z.string().nullable().optional(),
  chemical_name: z.string().nullable().optional(),
  concentration: z.string().nullable().optional(),
  unit: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
});

// FormulationExperiment
const FormulationExperimentSchema = z.object({
  experiment_id: z.string(),
  experiment_label: z.string(),
  experiment_quote: z.string().nullable().optional(),
  experiment_method: z.string().nullable().optional(),
  biological_context: BiologicalContextSchema.nullable().optional(),
  formulation_id: z.string(),
  formulation_label: z.string(),
});

// FormulationPaper
const FormulationPaperSchema = z.object({
  paper_id: z.string(),
  paper_title: z.string(),
  paper_doi: z.string().nullable().optional(),
  paper_authors: z.string().nullable().optional(),
  paper_published_year: z.number().int().nullable().optional(),
  paper_url: z.string().nullable().optional(),
});

// FormulationDetail
const FormulationDetailSchema = z.object({
  formulation_id: z.string(),
  formulation_label: z.string(),
  formulation_quote: z.string().nullable().optional(),
  component_signature: z.string(),
  components: z.array(FormulationComponentSchema),
  experiments: z.array(FormulationExperimentSchema),
  papers: z.array(FormulationPaperSchema),
});


const dummyResponse = {
  "formulation_id": "2c83e775-ff89-4639-b6bf-1d358508dc51",
  "formulation_label": "70% ethyl alcohol",
  "formulation_quote": "Cocoons of O. cornuta and O. rufa were collected from managed populations in the vicinity of Belgrade during the autumn of 1994, 1997, and 1998. The samples of cocoons were stored during overwintering periods as follows: during 1994/1995, under natural conditions in the vicinity of Belgrade (average temperature for this period was +5.2 C) and in a cold chamber at +4 C from 1 November 1994 to 1 May 1995; during 1997/1998, in a cold chamber at +3 C from 1 October 1997 to 15 April 1998; and during 1998/1999, in a cold chamber at +2 C from 1 October 1998 to 5 April 1999. Bees during the overwintering period were exposed to different temperatures in different seasons because only one cold chamber was available. The supercooling points were recorded for samples of 20 specimens (10 males and 10 females) of both species during intervals of approximately 15 days, from 26 December 1994 to 27 April 1995; 29 October 1997 to 6 April 1998; and 28 October 1998 to 17 March 1999. The cocoons with specimens were carefully affixed with glycerol grease to a Copper-Constantan (type T) thermocouple connected to a one-channel data logger (Honeywell, Electronik 15). After that, the temperature was decreased at a cooling rate of approximately 1 C min−1, and supercooling point values were recorded at the beginning of the exothermy (release of heat) caused by the crystallization of supercooled body fluids (Lee, 1989). Cocoons were taken out of the cryostat after reaching the temperature of crystallization. Individuals were extracted from cocoons, weighed, and left in 70% ethyl alcohol in a freezer at x18 C.",
  "component_signature": "eaae1012-2003-499d-bdda-d0898b8e35ac",
  "components": [
    {
      "component_id": "98c4cecb-ca31-425b-9c56-805a12960ab6",
      "display_label": "Ethanol",
      "chemical_id": "eaae1012-2003-499d-bdda-d0898b8e35ac",
      "chemical_name": "Ethanol",
      "concentration": "70",
      "unit": "%",
      "role": "CARRIER"
    }
  ],
  "experiments": [
    {
      "experiment_id": "20bc5ab7-dd8d-4c69-a366-96aecff89334",
      "experiment_label": "Ethanol immersion freezing (EIF) — pork loin",
      "experiment_quote": "The third group was immersed into -30ºC ethanol (EIF) for rapid freezing. When the core temperature of the meat was reached at -18ºC, the meat samples were moved to the -18ºC freezer.",
      "experiment_method": "Samples were immersed into -30ºC ethanol for rapid freezing; when the core temperature reached -18ºC they were transferred to a -18ºC freezer.",
      "biological_context": {
        "organ": null,
        "tissue": "pork loin (longissimus dorsi muscle)",
        "species": "pig",
        "cell_line": null,
        "dimensions": "rectangular pieces 2 × 3 × 8 cm",
        "health_status": null,
        "developmental_stage": null
      },
      "formulation_id": "accb0109-9662-459e-a6e3-5ec3e98d045b",
      "formulation_label": "Ethanol immersion freezing (EIF) medium"
    },
    {
      "experiment_id": "f5878337-a8ee-4a2a-9478-d0dfa28c090c",
      "experiment_label": "Experiment 1 – repeated SCP — cooling to −30 °C / warming to 10 °C (adult Pyrrhocoris apterus)",
      "experiment_quote": "The microtubes were then placed in aluminum blocks and an ethanol bath pre-cooled to 0 °C. They were then cooled to −30 °C at a rate of 0.2 °C min⁻¹. All samples were then warmed to 10 °C (warming rate 1.2 °C min⁻¹) to ensure that all of the ice was melted. The samples were then cooled again under the same conditions as described above and the repeated SCP measured.",
      "experiment_method": "Insects in 1.5-mL Eppendorf microtubes placed in aluminum blocks inside an ethanol bath pre-cooled to 0 °C were cooled to −30 °C at 0.2 °C min⁻¹; the entire procedure was carried out twice for each individual.",
      "biological_context": {
        "organ": null,
        "tissue": "whole adult insect",
        "species": "Pyrrhocoris apterus",
        "cell_line": null,
        "dimensions": null,
        "health_status": "cold-acclimated, post-diapause",
        "developmental_stage": "adult"
      },
      "formulation_id": "f5de0ebc-180d-4874-8a03-28c4489f1a27",
      "formulation_label": "Ethanol bath cooling medium"
    },
    {
      "experiment_id": "ddc42e6f-d371-4a49-85f4-a92963a1b956",
      "experiment_label": "Experiment 2a — cooling to population median SCP −17.9 °C (cold-acclimated Pyrrhocoris apterus)",
      "experiment_quote": "They were then cooled to the group specific median SCP … cooling was stopped … warmed (warming rate 1.2 °C min⁻¹) to 5 °C … After 5 min at 5 °C, the specimens were removed … maintained … at 0 °C for 24 h … exposure to the population median SCP … repeated three times … During the fourth … allowed to continue to −30 °C.",
      "experiment_method": "Cooled in the same microtube/ethanol bath set-up to the group-specific population median SCP of −17.9 °C; cooling stopped after ~50 % of individuals froze.",
      "biological_context": {
        "organ": null,
        "tissue": "whole adult insect",
        "species": "Pyrrhocoris apterus",
        "cell_line": null,
        "dimensions": null,
        "health_status": "cold-acclimated, post-diapause",
        "developmental_stage": "adult"
      },
      "formulation_id": "11f3124f-580b-4298-92d5-e5c530f1afa8",
      "formulation_label": "Ethanol bath cooling medium"
    },
    {
      "experiment_id": "2dd7b9b8-fc60-435f-95d5-f4127ac3df77",
      "experiment_label": "Experiment 2a — cooling to population median SCP −18.2 °C (cold-acclimated Pyrrhocoris apterus)",
      "experiment_quote": "… cooled to the group specific median SCP … exposure to the population median SCP and the 24-h recovery period were repeated three times … fourth … allowed to continue to −30 °C … median SCP −18.2 °C.",
      "experiment_method": "Cooled to the population median SCP of −18.2 °C until ≈50 % froze, then stopped.",
      "biological_context": {
        "organ": null,
        "tissue": "whole adult insect",
        "species": "Pyrrhocoris apterus",
        "cell_line": null,
        "dimensions": null,
        "health_status": "cold-acclimated, post-diapause",
        "developmental_stage": "adult"
      },
      "formulation_id": "aa8467d9-9981-4f8e-9bef-067aa34dc840",
      "formulation_label": "Ethanol bath cooling medium"
    },
    {
      "experiment_id": "19451b6f-66e7-41a9-9842-e7941cbca32a",
      "experiment_label": "Experiment 2a — cooling to population median SCP −18.3 °C (cold-acclimated Pyrrhocoris apterus)",
      "experiment_quote": "… median SCPs … −18.3 °C … cooling was stopped, and the samples were warmed (warming rate 1.2 °C min⁻¹) to 5 °C … procedure repeated three times and finally to −30 °C.",
      "experiment_method": "Cooling interrupted at the population median SCP of −18.3 °C after ~half the insects froze.",
      "biological_context": {
        "organ": null,
        "tissue": "whole adult insect",
        "species": "Pyrrhocoris apterus",
        "cell_line": null,
        "dimensions": null,
        "health_status": "cold-acclimated, post-diapause",
        "developmental_stage": "adult"
      },
      "formulation_id": "eb95cb06-7195-413f-be6c-f7912ea423b0",
      "formulation_label": "Ethanol bath cooling medium"
    },
    {
      "experiment_id": "3bb6a317-5295-4f7c-8bcd-d50a0efdff68",
      "experiment_label": "Experiment 2a — cooling to population median SCP −18 °C (cold-acclimated Pyrrhocoris apterus)",
      "experiment_quote": "The population median SCPs were very low and similar for all six acclimated groups (−17.9; −18; −18; −18.2; −18.3; −19 °C …).",
      "experiment_method": "Cooled to the population median SCP of −18 °C; cooling halted when ~50 % froze.",
      "biological_context": {
        "organ": null,
        "tissue": "whole adult insect",
        "species": "Pyrrhocoris apterus",
        "cell_line": null,
        "dimensions": null,
        "health_status": "cold-acclimated, post-diapause",
        "developmental_stage": "adult"
      },
      "formulation_id": "07a42959-f6d1-4899-98f9-7bc7c1e2f422",
      "formulation_label": "Ethanol bath cooling medium"
    },
    {
      "experiment_id": "81fbd87a-6c99-41f4-9eff-eeb92e17144d",
      "experiment_label": "Experiment 2a — cooling to population median SCP −19 °C (cold-acclimated Pyrrhocoris apterus)",
      "experiment_quote": "… six acclimated groups … −19 °C … cooling to the population median SCP … warmed to 5 °C … 24 h at 0 °C … repeated cycles … final −30 °C.",
      "experiment_method": "Cooled to −19 °C (group-specific population median SCP) stopping once ~50 % froze.",
      "biological_context": {
        "organ": null,
        "tissue": "whole adult insect",
        "species": "Pyrrhocoris apterus",
        "cell_line": null,
        "dimensions": null,
        "health_status": "cold-acclimated, post-diapause",
        "developmental_stage": "adult"
      },
      "formulation_id": "0267569f-326d-496c-b2f2-42b1c799d2a3",
      "formulation_label": "Ethanol bath cooling medium"
    },
    {
      "experiment_id": "9b952937-fd35-4b88-8e20-7266ba9d787e",
      "experiment_label": "Experiment 2b — cooling to population median SCP −11.6 °C (field-collected Pyrrhocoris apterus)",
      "experiment_quote": "The median SCPs of the four unacclimated groups were … −11.6 °C … procedure identical: cooled to the population median SCP, warmed to 5 °C, 24 h at 0 °C, repeated and final −30 °C.",
      "experiment_method": "Field-collected adults cooled to the population median SCP of −11.6 °C; cooling stopped after about half the samples froze.",
      "biological_context": {
        "organ": null,
        "tissue": "whole adult insect",
        "species": "Pyrrhocoris apterus",
        "cell_line": null,
        "dimensions": null,
        "health_status": "field-collected, naturally acclimatized",
        "developmental_stage": "adult"
      },
      "formulation_id": "94973d8d-ea17-4b61-a737-c65afea6a256",
      "formulation_label": "Ethanol bath cooling medium"
    },
    {
      "experiment_id": "b107dd14-d44f-44a3-a878-1f9db0c9c379",
      "experiment_label": "Experiment 2b — cooling to population median SCP −12 °C (field-collected Pyrrhocoris apterus)",
      "experiment_quote": "… unacclimated groups … median SCP −12 °C … cooled to the population median SCP, warmed to 5 °C, recovery, repeated, final −30 °C.",
      "experiment_method": "Cooling halted at −12 °C (population median SCP) once roughly half the insects froze.",
      "biological_context": {
        "organ": null,
        "tissue": "whole adult insect",
        "species": "Pyrrhocoris apterus",
        "cell_line": null,
        "dimensions": null,
        "health_status": "field-collected, naturally acclimatized",
        "developmental_stage": "adult"
      },
      "formulation_id": "f9bbfdd5-e721-448e-b18b-e545f5c8a21b",
      "formulation_label": "Ethanol bath cooling medium"
    },
    {
      "experiment_id": "7d7a7b43-1fd3-4362-a525-0a5af9474f5e",
      "experiment_label": "Experiment 2b — cooling to population median SCP −13.5 °C (field-collected Pyrrhocoris apterus)",
      "experiment_quote": "… median SCPs … −13.5 °C … identical repeated cooling and warming regimen …",
      "experiment_method": "Cooling interrupted at −13.5 °C (group median SCP) after ~50 % freezing.",
      "biological_context": {
        "organ": null,
        "tissue": "whole adult insect",
        "species": "Pyrrhocoris apterus",
        "cell_line": null,
        "dimensions": null,
        "health_status": "field-collected, naturally acclimatized",
        "developmental_stage": "adult"
      },
      "formulation_id": "cf144629-004d-45f6-8b12-1d20dcad70f8",
      "formulation_label": "Ethanol bath cooling medium"
    },
    {
      "experiment_id": "ff9ddf0f-3613-4066-81ca-8976f8b89b47",
      "experiment_label": "Experiment 2b — cooling to population median SCP −16 °C (field-collected Pyrrhocoris apterus)",
      "experiment_quote": "… field-collected median SCP −16 °C … cooled to the population median SCP, warmed, 24 h at 0 °C, repeated, and final −30 °C plunge.",
      "experiment_method": "Samples cooled to −16 °C (population median SCP) until half of individuals froze.",
      "biological_context": {
        "organ": null,
        "tissue": "whole adult insect",
        "species": "Pyrrhocoris apterus",
        "cell_line": null,
        "dimensions": null,
        "health_status": "field-collected, naturally acclimatized",
        "developmental_stage": "adult"
      },
      "formulation_id": "0dee7035-f8a1-4c57-9b26-559d677b2792",
      "formulation_label": "Ethanol bath cooling medium"
    },
    {
      "experiment_id": "2ee63c1f-c6a9-4e85-9f56-732023dd44fe",
      "experiment_label": "Supercooling measurement — cooling at 1 °C min−1 (Osmia cornuta cocoons)",
      "experiment_quote": "The cocoons with specimens were carefully affixed with glycerol grease to a Copper-Constantan (type T) thermocouple connected to a one-channel data logger (Honeywell, Electronik 15). After that, the temperature was decreased at a cooling rate of approximately 1 C min−1, and supercooling point values were recorded at the beginning of the exothermy (release of heat) caused by the crystallization of supercooled body fluids (Lee, 1989).",
      "experiment_method": "Cocoons were affixed with glycerol grease to a Copper-Constantan (type T) thermocouple connected to a one-channel data logger; the temperature was then decreased in a cryostat at approximately 1 °C min−1 until the onset of exothermy (crystallization).",
      "biological_context": {
        "organ": null,
        "tissue": "cocoon (adult stage)",
        "species": "Osmia cornuta",
        "cell_line": null,
        "dimensions": null,
        "health_status": null,
        "developmental_stage": null
      },
      "formulation_id": "2c83e775-ff89-4639-b6bf-1d358508dc51",
      "formulation_label": "70% ethyl alcohol"
    },
    {
      "experiment_id": "9e57d8be-d6f7-4d9b-87d3-1d82290479f0",
      "experiment_label": "Supercooling measurement — cooling at 1 °C min−1 (Osmia rufa cocoons)",
      "experiment_quote": "The cocoons with specimens were carefully affixed with glycerol grease to a Copper-Constantan (type T) thermocouple connected to a one-channel data logger (Honeywell, Electronik 15). After that, the temperature was decreased at a cooling rate of approximately 1 C min−1, and supercooling point values were recorded at the beginning of the exothermy (release of heat) caused by the crystallization of supercooled body fluids (Lee, 1989).",
      "experiment_method": "Cocoons were affixed with glycerol grease to a Copper-Constantan (type T) thermocouple connected to a one-channel data logger; the temperature was then decreased in a cryostat at approximately 1 °C min−1 until the onset of exothermy (crystallization).",
      "biological_context": {
        "organ": null,
        "tissue": "cocoon (adult stage)",
        "species": "Osmia rufa",
        "cell_line": null,
        "dimensions": null,
        "health_status": null,
        "developmental_stage": null
      },
      "formulation_id": "918aed8b-5574-42a4-941a-fbd0adf4ed2e",
      "formulation_label": "70% ethyl alcohol"
    }
  ],
  "papers": [
    {
      "paper_id": "83d2881d-eca6-4967-b7e5-a8c1e4a73303",
      "paper_title": "Effects of Artificial Supercooling Followed by Slow Freezing on the Microstructure and Qualities of Pork Loin",
      "paper_doi": "10.5851/kosfa.2016.36.5.650",
      "paper_authors": "Yiseul Kim; Geun-Pyo Hong",
      "paper_published_year": 2016,
      "paper_url": "http://dx.doi.org/10.5851/kosfa.2016.36.5.650"
    },
    {
      "paper_id": "8a6cd7e0-ad22-42d8-8763-0930055b0207",
      "paper_title": "Supercooling point is an individually fixed metric of cold tolerance in Pyrrhocoris apterus",
      "paper_doi": "10.1016/j.jtherbio.2018.04.004",
      "paper_authors": "Tomáš Ditrich",
      "paper_published_year": 2018,
      "paper_url": "https://doi.org/10.1016/j.jtherbio.2018.04.004"
    },
    {
      "paper_id": "ad9af351-8f2e-4771-9b5c-c2662a8924e2",
      "paper_title": "Supercooling points and diapause termination in overwintering adults of orchard bees Osmia cornuta and O. rufa (Hymenoptera: Megachilidae)",
      "paper_doi": "10.1079/BER2006423",
      "paper_authors": "M.D. Krunic; L.Z. Stanisavljevic",
      "paper_published_year": 2006,
      "paper_url": null
    }
  ]
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  /*const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const url = `${protocol}://${host}/api/formulation/${id}`;

  console.log(url);
  const response = await fetch(url);
  const data = await response.json();
  const parsed = FormulationDetailSchema.parse(data);*/
  const parsed = FormulationDetailSchema.safeParse(dummyResponse);

  if (!parsed.success) return notFound();
  const data = parsed.data;

  return (
    <>
      <div className="mx-auto px-4 py-8 max-w-6xl">
        <div className="">
          <h1>{data.formulation_label}</h1>
          <p>{data.formulation_quote}</p>
        </div>

        <div className="">
          <div className="">
            {data.components.map(comp => (
              <div className="" key={comp.chemical_id}>
                <Link href={`/database/chemicals/${comp.chemical_id}`}>
                  <h3>{comp.chemical_name} {comp.role}</h3>
                </Link>
                <h3>{comp.concentration} {comp.display_label}</h3>
              </div>
            ))}
          </div>
        </div>

        <div className="">
          <div className="">
            {data.experiments.map(exp => (
              <div className="" key={exp.experiment_id}>
                <h3>{exp.experiment_label}</h3>
                <p>From formulation: {exp.formulation_label}</p>

                <p>{exp.experiment_quote}</p>

                <p>Method: {exp.experiment_method}</p>

                <div className="">
                  <p>tissue: {exp.biological_context?.tissue}</p>
                  <p>species: {exp.biological_context?.species}</p>
                  <p>dimensions: {exp.biological_context?.dimensions}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="">
          <h3>Source Papers {data.papers.length}</h3>
          <div className="">
            {data.papers.map(paper => (
              <div key={paper.paper_id}>
                <Link href={`/database/papers/${paper.paper_id}`}>
                  <h3>{paper.paper_title}</h3>
                </Link>
                <p>{paper.paper_authors} - {paper.paper_published_year}</p>

                <a href={`https://doi.org/${paper.paper_doi}`} target="_blank" rel="noopener noreferrer"></a>
              </div>
            ))}
          </div>
        </div>
      </div>

    <pre>
      {JSON.stringify(data, null, 2)}
    </pre>
    </>
  )
}