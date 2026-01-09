import { headers } from "next/headers";
import { decodeFiltersFromURI, getFilterLabel, getFilterRange, PropertyType } from "./helper";
import { Badge } from "@/components/ui/badge";
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
      <div className="mx-auto px-4 py-8 max-w-6xl min-h-[calc(100vh-128px)] flex flex-col justify-between">
        <div className="flex gap-4 border border-color rounded-2xl p-4 mb-4">
          {decoded.map((filter, index) => (
            <div 
              className="bg-input/30 py-2 px-4 rounded-xl"
              key={`${filter.prop_type}-${index}`}
            >
              <div className="flex gap-4 items-center">
                <h3 className="font-semibold">
                  {getFilterLabel(filter.prop_type as PropertyType)}
                </h3>
                <Badge variant={"outline"}>
                  {filter.unit}
                </Badge>
              </div>

              <div className="flex gap-4 items-center">
                {getFilterRange({ min_value: filter.min_value, max_value: filter.max_value, raw_value: filter.raw_value })}
                {" "}
                {filter.unit !== "boolean" && filter.unit}
              </div>
            </div>
          ))}
        </div>

        {data?.length > 0 ? (
          data.map((result, index) => (
            <Link
              key={index}
              href={`/database/${encodeURIComponent(result.id)}`}
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
      </div>

      <style>{`
        footer{
          display: none;
        }
      `}</style>
    </>
  )
}