import { headers } from "next/headers";
import { Paper } from "@/lib/database/schema";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";

// todo: add experiment and other tables

async function fetchPaper(paperId: string, url: string): Promise<Paper | null>  {
  try{
    const response = await fetch(`${url}/api/papers/${paperId}`);
    if (!response.ok) throw new Error("API Handler Error");

    const data = await response.json();
    return data.paper;

  } catch (err) {
    console.log(err);
    return null;
  }
}

export default async function PaperPage({ params }: { params: Promise<{paperId: string}> }) {
  const { paperId } = await params;
  console.log(paperId);

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const url = `${protocol}://${host}`;

  const data = await fetchPaper(paperId, url);
  if (!data) return notFound();

  return(
    <div className="min-h-[calc(100vh-428px)]">
      <h1 className="text-2xl font-semibold mt-24">{data.title}</h1>
      <div className="flex justify-between align-center my-2">
        <div className="text-muted-foreground">
          <p>
            {data.journal && (
              <>
                <span className="font-semibold">
                  {data.journal}
                </span>
                {" - "}
              </>
            )}
            {data.doi ? data.doi : data.id}
          </p>
          <p className="font-semibold">{data.authors_flat}</p>
        </div>

        {data.paper_url && (
          <Button variant={"outline"} size={"icon"} asChild>
            <a
              href={data.paper_url}
              target="_blank" rel="noopener noreferrer"
            >
              <Link />
            </a>
          </Button>
        )}
      </div>

      <div className="leading-[16px] text-sm">
        {data.abstract}
      </div>
    </div>
  )
}