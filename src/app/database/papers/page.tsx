import { Paper } from "@/lib/database/schema";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import PaperPaginationComponent from "./paginationComponent";


interface FetchDatabaseParams {
  pageInt: number;
  limitInt: number;
  url: string;
}

interface DatabaseResponse {
  data: Paper[];
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }
}

export const revalidate = 1800;

async function FetchPapers({ pageInt, limitInt, url }: FetchDatabaseParams): Promise<DatabaseResponse | null> {
  try {
    const response = await fetch(`${url}/api/papers/database?page=${pageInt}&limit=${limitInt}`);
    if (!response.ok) throw new Error("Unable to fetch database");

    const data = response.json();
    return data;

  } catch (err) {
    console.log(err);
    return null
  }
}


export default async function PapersDatabase({ searchParams }: { searchParams: Promise<{ page?: string; limit?: string}>}) {
  const { page, limit } = await searchParams;
  const pageInt = parseInt(page || "1", 10);
  const limitInt = parseInt(limit || "36", 10);

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const url = `${protocol}://${host}`;

  const responseData = await FetchPapers({ pageInt, limitInt, url });
  const data = responseData?.data

  if (!responseData) return notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-12">
        {data && data.length > 0 ? (
          data
          .filter(result => result.title && result.title.trim() !== "")
          .map((result, index) => (
            <Link key={index} className="group" href={`/database/papers/${result.id}`}>
              <h2 className="text-xl font-semibold line-clamp-1 group-hover:underline">
                {result.title}
              </h2>
              <div className="flex flex-col gap-2 text-muted-foreground">
                <div className="flex gap-24 justify-between align-center text-xs">
                  <p className="line-clamp-1 hidden lg:block">
                    {result.authors_flat}
                  </p>
                  <p className="line-clamp-1 min-w-fit">
                    {result.id}
                  </p>
                </div>
                <p className="text-sm line-clamp-2">
                  {result.abstract}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <h1>No Results Found</h1>
        )}
      </div>

      <PaperPaginationComponent data={responseData.pagination} limit={limitInt} />
      <style>{`
      footer{
        display: none;
      }
      `}</style>
    </div>
  );
};