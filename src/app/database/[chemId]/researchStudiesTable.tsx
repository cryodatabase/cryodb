"use client"
import { Button } from "@/components/ui/button"
import { ChemicalPapersAndExperiments } from "@/lib/database/schema"
import { BookMarked, BookX, ExternalLink } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";

export function ResearchStudiesTable({ papersAndExperiments }: { papersAndExperiments: ChemicalPapersAndExperiments[] }) {
  const [page, setPage] = useState(0);

  const limit = 10;
  const currentPage = page + 1;
  const totalPages = Math.ceil(papersAndExperiments.length / limit);

  const lowerBound = page * limit;
  const upperBound = lowerBound + limit;
  const shownPapersAndExperiments = papersAndExperiments.slice(lowerBound, upperBound)

  const handlePageChange = (pageNum: number) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    const newPage = pageNum - 1;
    setPage(newPage);
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
        <BookMarked />
        Research Studies
        {papersAndExperiments.length > 0 && ` (${papersAndExperiments.length})`}
      </h3>

      <div className="flex flex-col gap-2">
      {papersAndExperiments.length >= 1 ? 
        shownPapersAndExperiments.map(paper => {
          return (
            <div 
              className="border border-color p-4 rounded-xl"
              key={`${paper.paper_id}-${paper.paper_link}`}
            >
              <h4 className="text-lg font-semibold mb-1.5">{paper.paper_title}</h4>
              <div className="flex items-center flex-wrap gap-2">
                <Button variant={"outline"} asChild>
                  <a href={`/database/papers/${paper.paper_id}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink height={18} width={18} />
                    View Paper Data
                  </a>
                </Button>

                {paper.paper_doi && 
                  <Button variant={"outline"} asChild>
                    <a href={`https://doi.org/${paper.paper_doi}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink height={18} width={18} />
                      View Original Paper
                    </a>
                  </Button>
                }
              </div>
            </div>
          )
        })
        : (
        <div className="min-h-24 flex flex-col items-center justify-center gap-2">
          <BookX className="stroke-(--muted-foreground)" />
          <p className="text-muted-foreground text-center">
            No research studies found
          </p>
        </div>
      )}
      </div>

      <div className="flex flex-col gap-2 mt-4">
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
  )
}