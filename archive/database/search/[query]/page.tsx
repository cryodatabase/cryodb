// app/search/[query]/page.tsx
import Link from "next/link"
import { notFound } from 'next/navigation'

import { SearchBreadcrumb } from "@/components/searchComponents/searchPage/search-breadcrumb"

import { searchResultsMetadata } from "@/lib/seo"
import { SearchResponse, SearchPageParams } from "@/types/search"
import { decodeParams } from "@/utils/decodeParams/search-page"

export async function generateMetadata({ params }: { params: Promise<SearchPageParams> }) {
  const { query } = await params
  const decodedToken = decodeParams(query);
  return searchResultsMetadata({ decodedToken, route: query});
}

export default async function SearchPage({ params }: { params: Promise<SearchPageParams> }) {
  const { query } = await params;
  const searchTerm = decodeParams(query);

  // Fetch search results
  const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const response = await fetch(`${API_URL}/api/search`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ search_query: searchTerm }),
    next: { revalidate: 3600 }, // Revalidate every hour
  })


  if (!response.ok) {
    notFound()
  }

  const data: SearchResponse = await response.json()
  const searchResults = data.response.search_results || []

  const { dym, dym_href } = data.response
  const href_value = `query=${dym_href || ""}`

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <SearchBreadcrumb searchTerm={searchTerm} />

        {/* Did You Mean */}
        {dym && dym_href && (
          <div className="mt-2">
            <p className="text-muted-foreground text-sm">
              Did you mean{" "}
              <Link href={href_value} className="text-purple-600 dark:text-purple-500 hover:underline">
                {dym}
              </Link>
              ?
            </p>
          </div>
        )}
      </div>

      {/* Search Results */}
      <section className="space-y-4">
        {searchResults.length > 0 ? (
          <div className="space-y-4">
            {searchResults.map((result, index) => (
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
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <h4 className="text-2xl font-semibold text-white">No Results Found</h4>
          </div>
        )}
      </section>
      <style>{`
      footer{
        display: none;
      }
      `}</style>
    </div>
  )
}