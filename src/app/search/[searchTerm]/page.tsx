import { SearchBreadcrumb } from "@/components/searchComponents/searchPage/search-breadcrumb";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

interface SearchEntry {
  id: string;
  inchikey: string;
  preferred_name: string;
  role: string;
  synonyms: string[];
}

interface SearchResponse {
  success: boolean;
  data: SearchEntry[];
  count: number;
  autoComplete: {
    did_you_mean: string;
    did_you_mean_href: string;
  };
}

async function fetchSearchResults(encodedSearchTerm: string, url: string): Promise<SearchResponse | null> {
  try {
    const response = await fetch(`${url}/api/chemicals/search?query=${encodedSearchTerm}`);
    if (!response.ok) return null;

    const data = response.json();
    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export default async function SearchPage({ params }: { params: Promise<{ searchTerm: string }>}) {
  const { searchTerm } = await params;
  if (!searchTerm) return notFound();

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const url = `${protocol}://${host}`;

  const data = await fetchSearchResults(searchTerm, url);
  if (!data) return notFound();

  console.log(data);
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <SearchBreadcrumb searchTerm={searchTerm} />

        {/* Did You Mean */}
        {data.autoComplete.did_you_mean && data.autoComplete.did_you_mean_href && (
          <div className="mt-2">
            <p className="text-muted-foreground text-sm">
              Did you mean{" "}
              <Link href={data.autoComplete.did_you_mean_href} className="text-purple-600 dark:text-purple-500 hover:underline">
                {data.autoComplete.did_you_mean}
              </Link>
              ?
            </p>
          </div>
        )}
      </div>

      {/* Search Results */}
      <section className="space-y-4">
        {data.data.length > 0 ? (
          <div className="space-y-4">
            {data.data.map((result, index) => (
              <Link
                key={index}
                href={`/database/${encodeURIComponent(result.preferred_name.toLowerCase())}`}
                className="group flex flex-col sm:flex-row gap-4 py-4"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold group-hover:underline">{result.preferred_name}</h2>
                    <p className="text-background bg-primary px-1 py-0.5 rounded-full text-sm font-semibold line-clamp-3 leading-[1.3]">{result.role}</p>
                  </div>
                  <p className="text-muted-foreground line-clamp-3 leading-[1.3]">
                    <span className="font-semibold">
                      Also Known As:{" "}
                    </span>
                    {result.synonyms.map((synonym, index) => (
                      <span key={index}>
                        {synonym}
                        {index != result.synonyms.length -1 && ", "}
                      </span>
                    ))}
                  </p>
                </div>
                {/*{result.synonyms && (
                  <div className="w-full sm:w-40 flex-shrink-0 items-center flex dark:bg-white rounded-md dark:border-none border border-input">
                    <img
                      className="w-full h-auto max-h-[100px] object-cover rounded-md"
                      alt="Structural Diagram"
                      src={result.structure_image}
                    />
                  </div>
                )}*/}
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
  );
}