import type { Metadata } from "next"
import { notFoundMetadata } from "@/lib/seo";

export const metadata: Metadata = notFoundMetadata;

export default function NotFound() {
  return (
    <>
      <div className="top"></div>
      <div className="flex items-center justify-center gap-3 w-screen h-[calc(100vh-128px)] max-w-full">
        <h1 className="font-semibold text-4xl">404</h1>
        <div className="border-l w-[1px] h-[38px] border-black dark:border-white" />
        <h2 className="font-semibold text-2xl">Page Not Found</h2>
      </div>
      <style>{`
        footer{
          display: none;
        }
      `}</style>
    </>
  );
}