"use client"
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FlaskConical, FlaskConicalOff } from "lucide-react";
import Link from "next/link";


export function FormulationsTable({ chemicalId }: { chemicalId: string }) {
    return (
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-2xl flex items-center gap-1 border-b pb-2 mb-3">
            <FlaskConical />
            Formulations
            {data.formulations.total > 0 && ` (${data.formulations.total})`}
          </h3>

          {data.formulations.total > 0 ? (
            <div className="grid grid-cols-[1fr_1fr] gap-2">
              {data.formulations.formulations.map(form => (
                <Link key={form.formulation_id} href={`/database/formulation/${form.formulation_id}`}>
                  <div 
                    className="border border-color py-2 px-4 rounded-2xl"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{form.formulation_label}</h4>
                      <ExternalLink height={16} width={16}/>
                    </div>
                    <p className="text-sm line-clamp-1 text-muted-foreground">From: {form.paper_title}</p>
                    <div className="flex items-center flex-wrap gap-2 mt-2">
                      <Badge>
                        {form.paper_count} Papers
                      </Badge>
                      <Badge variant={"outline"}>
                        {form.component_count} Components
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="min-h-24 flex flex-col items-center justify-center gap-2">
              <FlaskConicalOff className="stroke-[var(--muted-foreground)]" />
              <p className="text-muted-foreground text-center">
                No well-researched formulations found (showing only formulations with 2+ papers)
              </p>
            </div>
          )}
        </div>
    )
}