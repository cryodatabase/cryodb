// /app/filters/[filters]/page.tsx
import Link from "next/link"
import { Metadata } from "next"
import { notFound } from "next/navigation"

import FilterPopup from "@/components/databasePage/filterComponent/filter-page-popup"
import { FilterBreadcrumb } from "@/components/databasePage/filterComponent/filters/filter-breadcrumb"

import { filtersMetadata } from "@/lib/seo"
import { ApiResponse, FilterPageProps } from "../../../../archive/types/filters"
import { getFiltersFromParams } from "@/utils/decodeParams/filter-page"

export const metadata: Metadata = filtersMetadata;

export default async function FilterPage({ params }: { params: Promise<FilterPageProps> }) {
  const pageParams = await params;
  const filters = getFiltersFromParams(pageParams);

  // Fetch data from API
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/filter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filters,
    }),
    next: { revalidate: 3600 }, // Revalidate every hour
  });

  const data: ApiResponse = await response.json();
  const searchResults = data.results;

  if (!response.ok) notFound();

  // Map filters to FilterPopup params format
  const filterPopupParams = {
    selectedClasses: filters.selectedClasses || [],
    foundOnGRASList:
      filters.GRAS !== undefined ? filters.GRAS === "true" : undefined,
    cellType: filters.cellType || "",
    molecularWeightMin: filters.weightRangeMin || "",
    molecularWeightMax: filters.weightRangeMax || "",
    successRateMin: filters.successRateMin || "",
    successRateMax: filters.successRateMax || "",
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <FilterBreadcrumb />

      <FilterPopup
        chemClassFilters={data.classes}
        cellTypeFilters={data.uniqueCellTypes}
        params={filterPopupParams}
      />

      <div className="searchResults mt-6">
        {searchResults.length > 0 ? (
          searchResults.map((result, index) => (
            <Link
              key={index}
              href={`/database/${result.hash}`}
              className="group flex flex-col sm:flex-row gap-4 py-4"
            >
              <div className="flex-1">
                <h2 className="text-xl font-semibold group-hover:underline">
                  {result.name}
                  {filters.selectedClasses && result.class && (
                    <span className="text-base font-normal"> - {result.class}</span>
                  )}
                </h2>
                <p className="text-muted-foreground line-clamp-3 leading-[1.3]">
                  {result.overview}
                </p>
                {filters.weightRangeMin &&
                  filters.weightRangeMax &&
                  result.molecular_weight && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium">Molecular Weight:</h4>
                      <p className="text-sm text-muted-foreground">{result.molecular_weight}</p>
                    </div>
                  )}
                {filters.cellType &&
                  result.sorted_cell_info &&
                  result.sorted_cell_info.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium">Cell Type Info:</h4>
                      {result.sorted_cell_info.map((info, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground">
                          {info.cellType} - Success Rate: {info.successRate}%
                        </p>
                      ))}
                    </div>
                  )}
              </div>
              {result.structure_image && (
                <div className="w-full max-h-[100px] sm:w-40 flex-shrink-0 items-center flex dark:bg-white rounded-md dark:border-none border border-input">
                  <img
                    className="w-full h-auto max-h-[100px] object-cover rounded-md"
                    alt="Structural Diagram"
                    src={result.structure_image}
                  />
                </div>
              )}
            </Link>
          ))
        ) : (
          <div className="noResults text-center py-8">
            <h4 className="text-lg font-medium text-muted-foreground">No Results Found</h4>
          </div>
        )}
      </div>
      <style>{`
        footer {
          display: none;
        }
      `}</style>
    </div>
  );
}