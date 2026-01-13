"use client"
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useChemicalFormulations } from "@/hooks/useChemicalFormulations";
import { ExternalLink, FlaskConical, FlaskConicalOff } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { FormulationPaginatedResult } from "./type";
import { Skeleton } from "@/components/ui/skeleton";

export function FormulationsTable({ chemicalId }: { chemicalId: string }) {
  const [currentData, setCurrentData] = useState<FormulationPaginatedResult | null>(null);
  const [page, setPage] = useState(1);

  const limit = 16;
  const totalPages = Math.ceil((currentData?.total ?? 0) / limit);

  const { data, isLoading, isError, error } = useChemicalFormulations(chemicalId, page, limit);

  useEffect(() => {
    console.log(data, isError, error);
    if (!data) return;
    setCurrentData(data);
  }, [data, isLoading]);

  const handlePageChange = (pageNum: number) => {
    setPage(pageNum);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, page - 2);

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
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold text-2xl flex items-center gap-1 border-b pb-2 mb-3">
        <FlaskConical />
        Formulations
        {currentData && currentData?.total > 0 && ` (${currentData.total})`}
      </h3>

      {isLoading ? (
        <div className="grid grid-cols-[1fr_1fr] gap-2">
          <Skeleton className="h-[130px] w-full" />
          <Skeleton className="h-[130px] w-full" />
          <Skeleton className="h-[130px] w-full" />
          <Skeleton className="h-[130px] w-full" />
          <Skeleton className="h-[130px] w-full" />
          <Skeleton className="h-[130px] w-full" />
        </div>
      ) : currentData?.total && currentData.total > 0 ? (
        <div className="grid grid-cols-[1fr_1fr] gap-2">
          {currentData.formulations.map(form => (
            <Link key={form.formulation_id} href={`/database/formulation/${form.formulation_id}`}>
              <div 
                className="border border-color py-3 px-4 rounded-2xl h-full flex justify-center flex-col"
              >
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{form.formulation_label}</h4>
                  <ExternalLink className="w-4 h-4 shrink-0" />
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

      <div className="flex flex-col gap-2 mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(page - 1)}
                className={page === 1 || isLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {getPageNumbers().map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => handlePageChange(pageNum)}
                  isActive={page === pageNum}
                  className={isLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            ))}

            {totalPages > 5 && page < totalPages - 2 && (
              <PaginationItem>
                <span className="px-3.5 py-2">...</span>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(page + 1)}
                className={page === totalPages || isLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <p className="text-sm text-muted-foreground text-center">
          Page {page} out of {totalPages}
        </p>
      </div>
    </div>
  )
}