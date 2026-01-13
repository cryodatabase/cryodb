"use client"
import { useState } from "react";
import Link from "next/link";
import { ExternalLink, ScrollText } from "lucide-react";
import { FormulationPaper } from "./page";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function SourcePapersTable({ papers }: { papers: FormulationPaper[] }) {
  const [page, setPage] = useState(0);

  const pageLimit = 10;
  const totalPages = Math.ceil(papers.length / pageLimit);
  const lowerBound = page * pageLimit;
  const upperBound = lowerBound + pageLimit
  const currentPapers = papers.slice(lowerBound, upperBound);
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
        <ScrollText />
        Source Papers ({papers.length})
      </h3>
      <div className="flex flex-col gap-3">
        {currentPapers.map(paper => (
          <div className="border border-color rounded-lg p-4" key={paper.paper_id}>
            <div className="flex justify-between items-center text-muted-foreground">
              <p>{paper.paper_authors}</p>
              <p>{paper.paper_published_year}</p>
            </div>

            <div className="mt-2 mb-4 font-semibold text-lg hover:underline">
              <Link href={`/database/papers/${paper.paper_id}`}>
                <h3>{paper.paper_title}</h3>
              </Link>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant={"outline"} asChild>
                <a href={`/database/papers/${paper.paper_id}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink height={18} width={18} />
                  View Paper Data
                </a>
              </Button>

              <Button variant={"outline"} asChild>
                <a href={`https://doi.org/${paper.paper_doi}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink height={18} width={18} />
                  View Original Paper
                </a>
              </Button>
            </div>
          </div>
        ))}
      </div>
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
  )
}