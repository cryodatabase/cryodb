"use client"

import { useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface IReference {
  reference: string | null;
  url: string | null;
  organisation: string | null;
  article: { name: string; hash: string }[];
}

interface IReferencesResponse {
  references: IReference[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

interface ReferencesClientProps {
  initialData: IReferencesResponse;
  limit: number;
}

const PaginationComponent: React.FC<ReferencesClientProps> = ({ initialData, limit }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { totalPages, currentPage, totalItems } = initialData;

  // Get the current search query
  const searchQuery = searchParams.get("search") || "";

  const handlePageChange = (newPage: number) => {
    // Create URL with page, limit, and preserve search query if it exists
    const params = new URLSearchParams();
    params.set("page", newPage.toString());
    params.set("limit", limit.toString());
    if (searchQuery) {
      params.set("search", searchQuery);
    }
    router.push(`/references?${params.toString()}`);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - 2);
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
    <>
      {totalPages > 1 && (
        <Pagination className="mt-6">
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
      )}

      <div className="text-center text-sm mt-2">
        Page {currentPage} of {totalPages} ({totalItems} references)
      </div>
    </>
  );
};

export default PaginationComponent;