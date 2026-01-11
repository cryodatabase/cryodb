"use client"
import { usePathname } from "next/navigation";
import { Copy, Link } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

interface CopyButtonProps {
    content: string;
    label?: string;
    iconType?: "copyIcon" | "urlIcon";
}

export function CopyButton({
    content,
    label,
    iconType = "copyIcon"
}: CopyButtonProps) {

    async function copyValue() {
        try {
           await navigator.clipboard.writeText(content);
        } catch (err) {
          console.error("Failed to copy:", err);
        }
    }

    return (
        <Button onClick={copyValue} variant={"outline"}>
            {iconType === "copyIcon" ? <Copy /> : <Link />}
            {label}
        </Button>
    )
};

export function useCurrentUrl() {
  const pathname = usePathname();
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    const { protocol, host } = window.location;
    setUrl(`${protocol}//${host}${pathname}`);
  }, [pathname]);

  return url;
}

export function CopyURLButton() {
    const url = useCurrentUrl();
    
    return (
        <CopyButton content={url} />
    )
}