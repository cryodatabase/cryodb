import { headers } from "next/headers";
import { CryopreservationComponent, Paper } from "@/lib/database/schema";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";
import ExperimentTable from "./experimentTable";
import { ExperimentBreadcrumb } from "./experimentBreadcrumb";

// todo: add experiment and other tables

interface PaperResponse {
  paper: Paper;
  experiments_formulations_data: CryopreservationComponent[];
}

export const revalidate = 1800;

async function fetchPaper(paperId: string, url: string): Promise<PaperResponse | null>  {
  try{
    const response = await fetch(`${url}/api/papers/${paperId}`);
    if (!response.ok) throw new Error("API Handler Error");

    const data = await response.json();
    //return data.paper;
    return data;

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

  const responseData = await fetchPaper(paperId, url);
  if (!responseData) return notFound();

  const data = responseData.paper;

  return(
    <div className="min-h-[calc(100vh-428px)] pt-4">
      <div className="mb-2">
        <ExperimentBreadcrumb paperTitle={data.title} />
      </div>
      <h1 className="text-2xl font-semibold">{data.title}</h1>
      <div className="flex justify-between align-center my-2">
        <div className="text-muted-foreground">
          <p>
            {data.published_year && (
              <span className="font-semibold">
                {data.published_year}{", "}
              </span>
            )}
            {data.journal && (
              <>
                <span className="font-semibold">
                  {data.journal}
                </span>
                {" - "}
              </>
            )}

            {data.doi ? (
              <a
                href={`https://doi.org/${data.doi}`}
                target="_blank" rel="noopener noreferrer"
                className="hover:underline"
              >
                {data.doi}
              </a>
            ) : data.id}
          </p>
          <p className="font-semibold">{data.authors_flat}</p>
        </div>

        {data.paper_url && (
          <Button variant={"outline"} size={"icon"} asChild>
            <a
              href={/^https?:\/\//i.test(data.paper_url) ? data.paper_url : `https://${data.paper_url}`}
              target="_blank" rel="noopener noreferrer"
            >
              <Link />
            </a>
          </Button>
        )}
      </div>

      <div className="text-sm">
        {data.abstract}
      </div>

      <div className="w-full overflow-x-scroll">
        <ExperimentTable experiments={responseData.experiments_formulations_data} />
      </div>

      {/*<pre>
        {JSON.stringify(responseData, null, 2)}
      </pre>*/}
    </div>
  )
}