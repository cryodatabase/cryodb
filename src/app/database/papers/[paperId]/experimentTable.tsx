'use client';

import { ExperimentFormulation } from "./page";

// Interface for grouped experiment data (for table rows)
interface GroupedExperiment {
  experiment_label: string;
  cooling_method: string | null;
  rewarming_method: string | null;
  species: string | null;
  organ: string | null;
  tissue: string | null;
  formulation_label: string | null;
  formulation_quote: string | null;
  components: {
    chemical_preferred_name: string | null;
    component_role: string | null;
    amount: string | null;
    unit: string | null;
  }[];
}


export default function ExperimentTable({ experiments }: { experiments: ExperimentFormulation[] }) {
  // Group experiments by experiment_id to handle multiple components per experiment
  const groupedExperiments = experiments.reduce((acc: Record<string, GroupedExperiment>, curr: ExperimentFormulation) => {
    const { experiment_id, experiment_label, cooling_method, rewarming_method, biological_context, formulation_label, formulation_quote, component_role, chemical_preferred_name, amount, unit } = curr;
    if (!acc[experiment_id]) {
      acc[experiment_id] = {
        experiment_label,
        cooling_method,
        rewarming_method,
        species: biological_context.species,
        organ: biological_context.organ,
        tissue: biological_context.tissue,
        formulation_label,
        formulation_quote,
        components: [],
      };
    }
    acc[experiment_id].components.push({
      chemical_preferred_name,
      component_role,
      amount,
      unit,
    });
    return acc;
  }, {});

  // Convert grouped experiments to array for rendering
  const experimentRows: GroupedExperiment[] = Object.values(groupedExperiments);

  return (
    <div className="overflow-x-auto min-w-[1650px] shadow-md rounded-2xl my-6">
      <table className="min-w-full border border-color">
        <thead className="">
          <tr className='divide-x divide-y divide-border-color bg-input'>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Experiment Label
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Cooling Method</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Rewarming Method</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Species</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Organ</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tissue</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Formulation</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b border-color">Components</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-color">
          {experimentRows.map((row, index) => (
            <tr key={index} className={`${index % 2 === 0 ? '' : 'bg-input/30'} divide-x divide-border-color hover:bg-input/45`}>
              <td className="px-6 py-4 text-sm">{row.experiment_label}</td>
              <td className="px-6 py-4 text-sm">{row.cooling_method}</td>
              <td className="px-6 py-4 text-sm">{row.rewarming_method}</td>
              <td className="px-6 py-4 text-sm">{row.species ?? 'N/A'}</td>
              <td className="px-6 py-4 text-sm">{row.organ ?? 'N/A'}</td>
              <td className="px-6 py-4 text-sm">{row.tissue ?? 'N/A'}</td>
              <td className="px-6 py-4 text-sm max-w-[550px]">
                {row.formulation_label}
                <span className="text-muted-foreground text-xs line-clamp-3">
                  {row.formulation_quote}
                </span>
              </td>
              <td className="px-6 py-4 text-sm min-w-[300px]">
                <div className="space-y-1">
                  {row.components.map((component, idx) => (
                    <div key={idx} className="text-xs">
                      <span className="font-medium">
                        {component.chemical_preferred_name} 
                        {component.component_role && (` (${component.component_role}):`)}
                      </span>
                      <span className="ml-1 font-semibold text-blue-700 dark:text-blue-300">
                        {component.amount} {component.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}