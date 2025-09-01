"use client"

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, X, BookOpen } from "lucide-react";

interface CitationFormats {
  ama: string;
  apa: string;
  mla: string;
  harvard: string;
}

interface CitationData {
  name: string;
  date_written: string;
  written_by: string[];
  hash: string;
}

interface CitePopupProps {
  citationsData: CitationData;
}

// Function to create citations in different formats
function createCitation(data: CitationData): CitationFormats {
  const { name, date_written, written_by, hash } = data;
  const authors = written_by.length > 0 ? written_by.join(", ") : "Cryorepository Foundation";

  const date = new Date(date_written);
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currentDate = new Date().toISOString().split("T")[0];

  // APA style
  const apaCitation = `${authors} (${formattedDate}). ${name}. Cryorepository. https://cryorepository.com/database/${hash}`;

  // AMA style
  const amaCitation = `${authors}. ${name}. Cryorepository. Published ${formattedDate}. Accessed ${currentDate}. https://cryorepository.com/database/${hash}`;

  // MLA style
  const mlaCitation = `${authors}. "${name}." Cryorepository, ${formattedDate}, https://cryorepository.com/database/${hash}.`;

  // Harvard style
  const harvardCitation = `${authors} (${formattedDate}) '${name}', Cryorepository. Available at: https://cryorepository.com/database/${hash} (Accessed: ${currentDate})`;

  return {
    apa: apaCitation,
    ama: amaCitation,
    mla: mlaCitation,
    harvard: harvardCitation,
  };
}

const CitePopup: React.FC<CitePopupProps> = ({ citationsData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [format, setFormat] = useState<keyof CitationFormats>("ama");

  // Generate citations using the createCitation function
  const citations = createCitation(citationsData);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const copyToClipboard = () => {
    const currentCitation = citations[format];
    navigator.clipboard
      .writeText(currentCitation)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  };

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Button to toggle the dialog */}
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 h-8 w-8 sm:h-8 sm:w-auto"
          title="Cite this resource"
        >
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:block">Cite</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={popupVariants}
          transition={{ duration: 0.1 }}
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Cite</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>
          <div className="mt-4">
            <div className="border border-color rounded-md p-4 min-h-[110px] break-words">
              <p className="break-all sm:break-keep">{citations[format]}</p>
            </div>
            <div className="flex items-center justify-between mt-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Format:</span>
                <Select value={format} onValueChange={(value) => setFormat(value as keyof CitationFormats)}>
                  <SelectTrigger className="w-[120px] cursor-pointer">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="cursor-pointer hover:bg-input/50" value="ama">AMA</SelectItem>
                    <SelectItem className="cursor-pointer hover:bg-input/50" value="apa">APA</SelectItem>
                    <SelectItem className="cursor-pointer hover:bg-input/50" value="mla">MLA</SelectItem>
                    <SelectItem className="cursor-pointer hover:bg-input/50" value="harvard">Harvard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={copyToClipboard} className="flex items-center gap-2" variant="outline">
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default CitePopup;