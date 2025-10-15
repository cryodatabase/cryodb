import { headers } from "next/headers";
import { decodeFiltersFromURI } from "./helper";
import { notFound } from "next/navigation";
import Link from "next/link";

interface FilterResponse {
  id: string;
  inchikey: string | null;
  preferred_name: string;
  role: string;
}

export default async function FilterPage({ params }: { params: Promise<{ filters: string; }> }) {
  const { filters } = await params;
  const decoded = decodeFiltersFromURI(filters);

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const url = `${protocol}://${host}`;
  const response = await fetch(`${url}/api/chemicals/filter`, {
    method: "POST",
    body: JSON.stringify(decoded),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data: FilterResponse[] = await response.json();
  if (!data) return notFound();

  return(
    <>
      {data?.length > 0 ? (
        data.map((result, index) => (
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
          </Link>
        ))
      ) : (
        <div className="noResults">
          <h4>No Results Found</h4>
        </div>
      )}

      <style>{`
        footer{
          display: none;
        }
      `}</style>
    </>
  )
}