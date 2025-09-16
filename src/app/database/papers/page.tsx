import { Paper } from "@/lib/database/schema";
import { headers } from "next/headers";
import Link from "next/link";

// todo: add pagination

async function FetchPapers(url: string): Promise<Paper[] | null> {
  try {
    const response = await fetch(`${url}/api/papers/database`);
    if (!response.ok) throw new Error("Unable to fetch database");

    const data = response.json();
    return data;

  } catch (err) {
    console.log(err);
    return null
  }
}

export default async function PapersDatabase() {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const url = `${protocol}://${host}`;

  const data = await FetchPapers(url);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-12">
        {data && data.length > 0 ? (
          data.map((result, index) => (
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
      {/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}

      <style>{`
      footer{
        display: none;
      }
      `}</style>
    </div>
  );
};