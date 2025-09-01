"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  token: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ token }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [textToCopy, setTextToCopy] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTextToCopy(`${window.location.protocol}//${window.location.host}/database/${token}`);
    }
  }, [token]);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-8 w-8 sm:h-8"
      onClick={copyToClipboard}
      title="Copy Link"
    >
      {isCopied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
};

export default CopyButton;