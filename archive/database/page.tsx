import Link from "next/link"
import { Metadata } from "next"

import PaginationComponent from "@/components/databasePage/pagination-component"
// import { DatabaseBreadcrumb } from "@/components/databasePage/database-breadcrumb"
import { FilterPopup } from "@/components/databasePage/filterComponent/filter-popup"

import { databaseIndexMetadata } from "@/lib/seo"
import { IndexResponse } from "@/types/database"

export const metadata: Metadata = databaseIndexMetadata;

export default async function IndexPage({ searchParams }: { searchParams: Promise<{ page?: string; limit?: string }> }) {
  const pageParams = await searchParams;
  const page = parseInt(pageParams.page || "1", 10);
  const limit = parseInt(pageParams.limit || "36", 10);

  // Validate pagination parameters
  if (page < 1 || limit < 1) {
    return <div className="container text-red-600">Invalid page or limit</div>;
  }

  // Fetch data server-side
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/article/index?page=${page}&limit=${limit}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Ensure dynamic SSR
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data: IndexResponse = await response.json();

    return (
      <div className="mx-auto px-4 py-8 max-w-6xl min-h-[calc(100vh-128px)] flex flex-col justify-between">
        <div>
        {/*<DatabaseBreadcrumb />*/}

        <FilterPopup chemClassFilters={data.chemClassFilters} cellTypeFilters={data.cellTypeFilters} />

        <div className="searchResults">
          {data.entries.length > 0 ? (
            data.entries.map((result, index) => (
              <Link
                key={index}
                href={`/database/${result.hash}`}
                className="group flex flex-col sm:flex-row gap-4 py-4"
              >
                <div className="flex-1">
                  <h2 className="text-xl font-semibold group-hover:underline">{result.name}</h2>
                  <p className="text-muted-foreground line-clamp-3 leading-[1.3]">{result.overview}</p>
                </div>
                {result.structure_image && (
                  <div className="w-full sm:w-40 flex-shrink-0 items-center flex dark:bg-white rounded-md dark:border-none border border-input">
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
            <div className="noResults">
              <h4>No Results Found</h4>
            </div>
          )}
        </div>
        </div>

        <div>
        <PaginationComponent
          initialData={data}
          //page={page}
          limit={limit}
        />
        </div>

        <style>{`
        footer{
          display: none;
        }
        `}</style>
      </div>
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return <div className="container text-red-600">An error occurred while loading the database.</div>;
  }
}