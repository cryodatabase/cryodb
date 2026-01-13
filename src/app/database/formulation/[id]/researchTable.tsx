"use client"

import { BookMarked } from "lucide-react";
import { FormulationExperiment } from "./page";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function ResearchTable({ experiments }: { experiments: FormulationExperiment[] }) {
  const [page, setPage] = useState(0);

  const pageLimit = 6;
  const totalPages = Math.ceil(experiments.length / pageLimit);
  const lowerBound = page * pageLimit;
  const upperBound = lowerBound + pageLimit
  const currentExperiments = experiments.slice(lowerBound, upperBound);
  const currentPage = page + 1;

  const handlePageChange = (newPage: number) => {
    const toSetPage = newPage - 1;
    if (toSetPage === page || newPage < 0 || newPage > totalPages) return;

    setPage(toSetPage);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - 2);
    // let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="border border-color rounded-2xl p-4">
      <h3 className="flex items-center gap-2 text-xl font-semibold border-b pb-2 mb-3">
        <BookMarked />
        Research Studies ({experiments.length})
      </h3>
      <div className="flex flex-col gap-4">
        {currentExperiments.map(exp => (
          <div className="border rounded-lg p-4" key={exp.experiment_id}>
            <h3 className="font-semibold text-lg">{exp.experiment_label}</h3>
            
            {exp.formulation_label && (
              <p className="text-muted-foreground">
                <span className="font-semibold">From formulation:</span>{" "}
                {exp.formulation_label}
              </p>
            )}
            
            <div className="my-3">
              {exp.experiment_quote ? (
                <p className="text-muted-foreground italic">{exp.experiment_quote}</p>
              ) : (
                <p className="text-muted-foreground italic">No Experiment Quote Provided</p>
              )}
            </div>

            {exp.experiment_method && (
              <p className="my-3">
                <span className="font-semibold">Method:{" "}</span>
                {exp.experiment_method}
              </p>
            )}

            {exp.biological_context && (
              <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                {Object.entries(exp.biological_context).map(([key, value], index) => {
                  if (!value) return null;

                  return (
                    <Badge variant="outline" className="text-sm" key={`${key}-${index}`}>
                      <span className="capitalize">{key.replace("_", " ")}:</span> {value}
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>
        ))}

        <div className="flex flex-col gap-2 mt-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {getPageNumbers().map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => handlePageChange(pageNum)}
                    isActive={currentPage === pageNum}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <PaginationItem>
                  <span className="px-3.5 py-2">...</span>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <p className="text-sm text-muted-foreground text-center">
            Page {currentPage} out of {totalPages}
          </p>
        </div>
      </div>
    </div>
  )
}