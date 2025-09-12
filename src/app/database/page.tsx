import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import PaginationComponent from "./paginationComponent";

interface DatabaseObject {
  id: string;
  inchikey: string;
  preferred_name: string;
  role: string;
  synonyms: string[];
}

interface DatabaseResponse {
  data: DatabaseObject[];
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }
}

interface FetchDatabaseParams {
  pageInt: number;
  limitInt: number;
  url: string;
}

async function fetchDatabase({ pageInt, limitInt, url }: FetchDatabaseParams): Promise<DatabaseResponse | null> {
  try {
    const response = await fetch(`${url}/api/chemicals/database?page=${pageInt}&limit=${limitInt}`);
    if (!response.ok) return null;
    
    const data = response.json();
    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export default async function DatabasePage({ searchParams }: { searchParams: Promise<{ page?: string; limit?: string}>}) {
  const { page, limit } = await searchParams;
  const pageInt = parseInt(page || "1", 10);
  const limitInt = parseInt(limit || "36", 10);

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const url = `${protocol}://${host}`;

  const data = await fetchDatabase({ pageInt, limitInt, url });
  if (!data) return notFound();

  return(
    <div className="mx-auto px-4 py-8 max-w-6xl min-h-[calc(100vh-128px)] flex flex-col justify-between">
      <div className="searchResults">
        {data?.data.length > 0 ? (
          data.data.map((result, index) => (
            <Link
              key={index}
              href={`/database/${encodeURIComponent(result.preferred_name.toLowerCase())}`}
              className="group flex flex-col py-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold group-hover:underline">{result.preferred_name}</h2>
                <p className="text-background bg-primary px-1 py-0.5 rounded-full text-sm font-semibold line-clamp-3 leading-[1.3]">{result.role}</p>
              </div>
              {result.inchikey && (
                <div className="w-full text-xs text-muted-foreground">
                {result.inchikey}
                </div>
              )}
              {result.synonyms.length > 0 && (
                <div className="flex gap-1.5 mt-1.5 text-muted-foreground">
                  <span className="font-semibold">
                    Also known as:
                  </span>
                  {result.synonyms.map((synonym, index) => (
                    <div key={index}>
                      {synonym}{index !== result.synonyms.length - 1 && (",")}
                    </div>
                  ))}
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

      <PaginationComponent data={data.pagination} limit={limitInt} />

      <style>{`
      footer{
        display: none;
      }
      `}</style>
    </div>
  );
}