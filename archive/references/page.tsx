import Link from "next/link";
import { Metadata } from "next";
import { ReferenceIndexBreadcrumb } from "../refIndexComponents/refIndex-breadcrumb";
import { referenceIndexMetadata } from "@/lib/seo";
import PaginationComponent from "../refIndexComponents/pagination-component";
import SearchComponent from "../refIndexComponents/search-component"; // Import the new component

export const metadata: Metadata = referenceIndexMetadata;

// Interfaces (unchanged)
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

// Main Component
export default async function ReferenceIndex({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string; search?: string }>;
}) {
  const pageParams = await searchParams;
  const page = parseInt(pageParams.page || "1", 10);
  const limit = parseInt(pageParams.limit || "36", 10);
  const search = pageParams.search || "";

  // Validate pagination parameters
  if (page < 1 || limit < 1) {
    return <div className="container text-red-600">Invalid page or limit</div>;
  }

  try {
    // Construct the API URL with search parameter
    const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/references`);
    url.searchParams.set("page", page.toString());
    url.searchParams.set("limit", limit.toString());
    if (search) {
      url.searchParams.set("search", search);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch references");
    }

    const data: IReferencesResponse = await response.json();

    return (
      <div className="mx-auto px-4 py-8 max-w-6xl min-h-[calc(100vh-128px)] flex flex-col justify-between">
        <div>
          <ReferenceIndexBreadcrumb />

          {/* Add SearchComponent here */}
          <SearchComponent />

          <div className="searchResults">
            {data.references.length > 0 ? (
              data.references.map((reference, index) => (
                <div key={index} className="py-4 border-b border-input">
                  <div className="flex justify-between items-center">
                    {reference.url ? (
                      <a
                        href={reference.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-xl hover:underline"
                      >
                        {reference.organisation ? reference.organisation : "View Source"}
                      </a>
                    ) : (
                      <span className="font-semibold text-xl">
                        {reference.organisation ? reference.organisation : "View Source"}
                      </span>
                    )}
                    
                    {reference.url && (
                      <a
                        href={reference.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-sm opacity-[0.8] hover:opacity-[1] hover:underline hidden sm:flex max-w-[300px]"
                      >
                        <span className="truncate overflow-hidden whitespace-nowrap w-full">
                          {reference.url}
                        </span>
                        <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16"><path fillRule="evenodd" clipRule="evenodd" d="M6.75011 4H6.00011V5.5H6.75011H9.43945L5.46978 9.46967L4.93945 10L6.00011 11.0607L6.53044 10.5303L10.499 6.56182V9.25V10H11.999V9.25V5C11.999 4.44772 11.5512 4 10.999 4H6.75011Z" fill="currentColor"></path></svg>
                      </a>
                    )}
                  </div>

                  <h2 className="text-md text-muted-foreground font-semibold">
                    {reference.reference || "Untitled Reference"}
                  </h2>
                  {reference.article.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Related Articles:</p>
                      <ul className="mt-1 space-y-1 flex flex-wrap gap-4">
                        {reference.article.map((article, idx) => (
                          <li key={idx}>
                            <Link
                              href={`/database/${article.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 flex hover:underline"
                            >
                              {article.name}
                              <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16"><path fillRule="evenodd" clipRule="evenodd" d="M6.75011 4H6.00011V5.5H6.75011H9.43945L5.46978 9.46967L4.93945 10L6.00011 11.0607L6.53044 10.5303L10.499 6.56182V9.25V10H11.999V9.25V5C11.999 4.44772 11.5512 4 10.999 4H6.75011Z" fill="currentColor"></path></svg>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="noResults">
                <h4 className="text-lg font-semibold">
                  {search
                    ? `No References Found for "${search}"`
                    : "No References Found"}
                </h4>
              </div>
            )}
          </div>
        </div>

        <div>
          <PaginationComponent initialData={data} limit={limit} />
        </div>

        <style>{`
          footer {
            display: none;
          }
        `}</style>
      </div>
    );
  } catch (error) {
    console.error("Error fetching references:", error);
    return (
      <div className="mx-auto px-4 py-8 max-w-6xl">
        <ReferenceIndexBreadcrumb />
        <div>
          An error occurred while loading the references.
        </div>
      </div>
    );
  }
}