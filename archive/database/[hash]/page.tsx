import { notFound } from "next/navigation"
import Image from "next/image"
import { CheckCheck, Upload, MoveUpRight, ExternalLink } from 'lucide-react'

import CitePopup from "@/components/articleComponents/cite-button"
import CopyButton from "@/components/articleComponents/copy-button"
import ReportError from "@/components/articleComponents/report-button"
import { SearchBreadcrumb } from "@/components/articleComponents/article-breadcrumb"

import { articleResultMetadata, notFoundMetadata } from "@/lib/seo"
import { ArticleData, ArticlePageParams } from "@/types/article"

async function getArticleData(hash: string): Promise<ArticleData | null> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const res = await fetch(`${API_URL}/api/article/${hash}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: {params: Promise<ArticlePageParams>}) {
  const pageParams = await params;
  const data = await getArticleData(pageParams.hash);

  if (!data) {
    return notFoundMetadata;
  } else {
    const { entry } = data;
    return articleResultMetadata({ 
      entryName: entry.name, 
      hash: entry.hash,
      overview: entry.overview,
      image: entry.structure_image
    });
  }
}

export default async function ArticlePage({ params }: {params: Promise<ArticlePageParams>}) {
  const pageParams = await params;
  const data = await getArticleData(pageParams.hash);

  if (!data) return notFound();

  const { entry } = data;

  return (
    <div className="pt-4">
      {/* Breadcrumb */}
      <SearchBreadcrumb agentName={entry.name} />

      {/* Content Box */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] max-w-[1800px] pt-2 mx-auto">
        {/* Main Content */}
        <div className="flex flex-col mb-8">
          <h1 className="flex items-center gap-1 flex-wrap text-3xl font-semibold">
            {entry.name}
            {entry.chemical_formula_html && (
              <span className="flex items-center gap-1 max-md:hidden">
                - <span dangerouslySetInnerHTML={{ __html: entry.chemical_formula_html }} />
              </span>
            )}
          </h1>

          {/* Author and Actions */}
          <div className="flex justify-between items-center pt-1 max-md:flex-col max-md:items-start max-md:gap-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Upload height={14} width={14} />
              <h5 className="text-sm font-medium">
                Written by
                <span className="pl-[2px]">
                  {entry.written_by && entry.written_by.length > 0
                    ? entry.written_by.join(', ')
                    : "Cryorepository Foundation"}
                </span>
              </h5>
              <h6 className="flex items-center gap-1 px-1 py-[1px] text-purple-500 border border-[#6638b0] rounded-2xl bg-gradient-to-r from-[#6638b0] to-[#9848a3] text-transparent bg-clip-text text-xs">
                <CheckCheck stroke="#6638b0" height={16} width={16} />
                <span className="max-md:hidden">Verified</span>
              </h6>
            </div>
            <div className="flex items-center gap-2.5">
              <CitePopup citationsData={{name: entry.name, date_written: entry.date_written, written_by: entry.written_by, hash: entry.hash}} />
              <ReportError hash={entry.hash} name={entry.name} />
              <CopyButton token={entry.hash} />
            </div>
          </div>

          {/* Main Content */}
          <div
            className="prose max-w-none mt-4
            [&_ul]:ml-5 [&_ol]:ml-5
            [&_ul]:mt-1 [&_ol]:mt-1
            [&_li]:font-semibold
            [&_h2]:pt-[8px] [&_h2]:pb-[6px]
            [&_h3]:pt-[8px] [&_h3]:pb-[6px]
            [&_h4]:pt-[8px] [&_h4]:pb-[6px]" //[&_ul]:ml-5 [&_ol]:ml-5 [&_ul]:mt-1 [&_ol]:mt-1
            dangerouslySetInnerHTML={{ __html: entry.html_text }}
          />

          {/* References */}
          {entry.references.length > 0 &&
            entry.references.some(ref => ref.reference && ref.reference.trim() !== '') && (
              <div className="my-3">
                <h3 className="text-lg font-semibold">References</h3>
                <div className="flex flex-col gap-3 mb-4">
                  {entry.references
                    .filter(ref => ref.reference && ref.reference.trim() !== '')
                    .map((reference, index) => (
                      <div key={index} className="flex flex-col">
                        <span className="text-sm text-muted-foreground">
                          <a
                            href={reference.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {reference.organisation}
                          </a>{' '}
                          - {reference.reference}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
        </div>

        {/* Sidebar */}
        <div className="mt-4 lg:mt-0 lg:pl-5">
          {/* Info Table */}
          <div className="p-4 border border-border rounded-lg max-w-[930px] lg:max-w-[320px]">
            <h4 className="pb-2 text-lg font-semibold">Information</h4>
            <h6 className="text-xs font-semibold">CAS number: {entry.cas_number}</h6>
            <div className="w-full">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="text-muted-foreground font-semibold py-0.5">Class</td>
                    <td className="text-right py-0.5">{entry.class}</td>
                  </tr>
                  <tr>
                    <td className="text-muted-foreground font-semibold py-0.5">Chemical Formula</td>
                    <td
                      className="text-right py-0.5"
                      dangerouslySetInnerHTML={{ __html: entry.chemical_formula_html }}
                    />
                  </tr>
                  <tr>
                    <td className="text-muted-foreground font-semibold py-0.5">Molecular Weight</td>
                    <td className="text-right py-0.5">{entry.molecular_weight}</td>
                  </tr>
                  {entry.optimal_conc && (
                    <tr>
                      <td className="text-muted-foreground font-semibold py-0.5">Optimal Conc</td>
                      <td className="text-right py-0.5">{entry.optimal_conc}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Synonyms */}
          {entry.synonyms.length > 0 && entry.synonyms.some(syn => syn.trim() !== '') && (
            <div className="my-3 p-4 border border-border rounded-lg max-w-[930px] lg:max-w-[320px]">
              <h3 className="text-lg font-semibold">Synonyms</h3>
              <h6 className="text-sm text-muted-foreground">Also Known As</h6>
              <div className="flex flex-wrap gap-2 mt-2">
                {entry.synonyms.map((synonym, index) => (
                  <p
                    key={index}
                    className="px-2 py-1 border border-border text-muted-foreground rounded-2xl"
                  >
                    {synonym}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* GRAS Info */}
          {entry.gras_info?.found !== undefined && (
            <div className="flex items-center justify-between my-3 p-4 border border-border rounded-lg max-w-[930px] lg:max-w-[320px]">
              <div>
                <h6 className="text-xs">{entry.name}</h6>
                <h3 className="text-xl font-semibold">
                  {entry.gras_info.found ? 'Is on FDAs GRAS list' : 'Is not on FDAs GRAS list'}
                </h3>
              </div>
              {entry.gras_info.reference_url && (
                <a
                  href={entry.gras_info.reference_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink />
                </a>
              )}
            </div>
          )}

          {/* Cell Info */}
          {entry.cell_info.length > 0 &&
            entry.cell_info.some(cell => cell.cellType && cell.cellType.trim() !== '') && (
              <div className="my-3 p-4 border border-border rounded-lg max-w-[930px] lg:max-w-[320px]">
                <p className="font-semibold">Tested On</p>
                <h6 className="text-sm text-muted-foreground">Cell Type - Success Rate</h6>
                <div className="flex flex-col gap-1 mt-2.5">
                  {entry.cell_info.map((cell, index) => (
                    <p key={index} className="flex justify-between items-center">
                      <span>{cell.cellType}</span>
                      {cell.referenceURL && cell.referenceURL.trim() !== '' ? (
                        <a
                          href={cell.referenceURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-muted-foreground hover:underline"
                        >
                          <span>{cell.successRate && `(${cell.successRate}%)`}</span>
                          <MoveUpRight height={18} />
                        </a>
                      ) : (
                        <span className="flex items-center gap-0.5 text-muted-foreground">
                          {cell.successRate && `(${cell.successRate}%)`}
                        </span>
                      )}
                    </p>
                  ))}
                </div>
              </div>
            )}

          {/* Structure Image */}
          {entry.structure_image && (
            <div className="my-3 p-4 border border-border rounded-lg max-w-[930px] lg:max-w-[320px] bg-transparent">
              <img
                className="w-full max-w-[400px] rounded-lg dark:bg-white"
                alt="structural diagram"
                src={entry.structure_image}
              />
            </div>
          )}

          {/* Safety Document */}
          {entry.safety_document_sheet && (
            <div className="flex items-center justify-between my-3 p-4 border border-border rounded-lg max-w-[930px] lg:max-w-[320px]">
              <div>
                <h6 className="text-sm">Safety Document Sheet</h6>
                <h3 className="text-base">{entry.name} SDS</h3>
              </div>
              <a
                href={entry.safety_document_sheet}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl text-muted-foreground"
              >
                <MoveUpRight />
              </a>
            </div>
          )}

          {/* Powered By */}
          <div className="flex items-center justify-between my-3 p-4 border border-border rounded-lg max-w-[930px] lg:max-w-[320px]">
            <div>
              <h5 className="text-sm">Powered By</h5>
              <h1 className="text-2xl font-bold">CryoDAO</h1>
            </div>
            <Image
              className="h-11 w-11 invert-0 dark:invert"
              alt="CryoDao Logo"
              src="/assets/cryodao.svg"
              height={44}
              width={44}
            />
          </div>
        </div>
      </div>
    </div>
  );
}