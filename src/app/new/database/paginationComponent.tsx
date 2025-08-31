"use client";

import { useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationProp {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

//const PaginationComponent: React.FC<DatabaseClientProps> = ({ initialData, page, limit }) => {
export default function PaginationComponent({ data, limit }: { data: PaginationProp; limit: number }) {
  const router = useRouter();
  const currentPage = data.currentPage;

  const handlePageChange = (newPage: number) => {
    router.push(`/new/database?page=${newPage}&limit=${limit}`);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - 2);
    // let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    const endPage = Math.min(data.totalPages, startPage + maxPagesToShow - 1);

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
      {data.totalPages > 1 && (
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

            {data.totalPages > 5 && currentPage < data.totalPages - 2 && (
              <PaginationItem>
                <span className="px-3.5 py-2">...</span>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                className={currentPage === data.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <div className="text-center text-sm mt-2">
        Page {currentPage} of {data.totalPages} ({data.totalItems} entries)
      </div>
    </>
  );
};