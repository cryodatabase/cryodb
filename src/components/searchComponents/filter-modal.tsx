/*"use client"

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

export default CitePopup;*/

"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"
import { TriangleAlert, ArrowDownWideNarrow, FunnelX } from "lucide-react"
import { ChemClass } from "@/components/databasePage/filterComponent/filters/chemical-class-filter"
import { GrasList } from "@/components/databasePage/filterComponent/filters/fda-gras-filter"
import { MolecularWeight } from "@/components/databasePage/filterComponent/filters/molecular-weight-filter"
import { CellComponent } from "@/components/databasePage/filterComponent/filters/tested-cell-filter"

interface FilterModal {
  children: React.ReactNode;
  chemClassFilters: string[];
  cellTypeFilters: string[];
}

export function FilterModal({children, chemClassFilters, cellTypeFilters}: FilterModal) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [chemicalClasses, setChemicalClasses] = useState<string[]>([]);

  const [foundOnGRASList, setFoundOnGRASList] = useState<boolean | undefined>();

  const [molecularWeightMin, setMolecularWeightMin] = useState<number | string>("");
  const [molecularWeightMax, setMolecularWeightMax] = useState<number | string>("");

  const [cellType, setCellType] = useState<string>("");
  const [successRateMin, setSuccessRateMin] = useState<number | string>("");
  const [successRateMax, setSuccessRateMax] = useState<number | string>("");

  const [reset, setReset] = useState(false);
  const [filterError, setFilterError] = useState("");
  const pathname = usePathname();

  const applyFilters = () => {
    const params = new URLSearchParams();
    let hasFilters = false; // Flag to check if any filter is applied
  
    // Add chemical classes
    if (chemicalClasses.length > 0) {
      params.append('selectedClasses', chemicalClasses.join(','));
      hasFilters = true;
    }
  
    // Add foundOnGRASList
    if (foundOnGRASList === true || foundOnGRASList === false) {
      params.append('GRAS', foundOnGRASList ? 'true' : 'false');
      hasFilters = true;
    }
  
    // Add cell type
    if (cellType) {
      params.append('cellType', cellType);
      hasFilters = true;
    }
  
    // Validate and add molecularWeightMin and molecularWeightMax
    if (molecularWeightMin && molecularWeightMax) {
      const minFloat = parseFloat(molecularWeightMin as string);
      const maxFloat = parseFloat(molecularWeightMax as string);
  
      if (!isNaN(minFloat) && !isNaN(maxFloat)) {
        const weightMin = Math.min(minFloat, maxFloat);
        const weightMax = Math.max(minFloat, maxFloat);
        params.append('weightRangeMin', weightMin.toString());
        params.append('weightRangeMax', weightMax.toString());
        hasFilters = true;
      } else {
        setFilterError("Invalid molecular weight values. Please ensure both are valid numbers.");
        return; // Stop further processing if error occurs
      }
    }
  
    // Validate and add successRateMin and successRateMax only if cellType is specified
    if (cellType && (successRateMin || successRateMax)) {
      if (successRateMin && successRateMax) {
        const successMinFloat = parseFloat(successRateMin as string);
        const successMaxFloat = parseFloat(successRateMax as string);
  
        if (
          !isNaN(successMinFloat) &&
          !isNaN(successMaxFloat) &&
          successMinFloat >= 0 &&
          successMinFloat <= 100 &&
          successMaxFloat >= 0 &&
          successMaxFloat <= 100
        ) {
          const successMin = Math.min(successMinFloat, successMaxFloat);
          const successMax = Math.max(successMinFloat, successMaxFloat);
          params.append('successRateMin', successMin.toString());
          params.append('successRateMax', successMax.toString());
          hasFilters = true;
        } else {
          setFilterError("Invalid success rate values. Please ensure both are valid percentages between 0 and 100.");
          return; // Stop further processing if error occurs
        }
      } else if (successRateMin) {
        const successMinFloat = parseFloat(successRateMin as string);
  
        if (!isNaN(successMinFloat) && successMinFloat >= 0 && successMinFloat <= 100) {
          params.append('successRateMin', successMinFloat.toString());
          hasFilters = true;
        } else {
          setFilterError("Invalid success rate minimum. Please ensure it is a valid percentage between 0 and 100.");
          return; // Stop further processing if error occurs
        }
      } else if (successRateMax) {
        const successMaxFloat = parseFloat(successRateMax as string);
  
        if (!isNaN(successMaxFloat) && successMaxFloat >= 0 && successMaxFloat <= 100) {
          params.append('successRateMax', successMaxFloat.toString());
          hasFilters = true;
        } else {
          setFilterError("Invalid success rate maximum. Please ensure it is a valid percentage between 0 and 100.");
          return; // Stop further processing if error occurs
        }
      }
    }
  
    // Redirect based on filters
    if (hasFilters){
      // const redirectUrl = hasFilters ? `/filters/${params.toString()}` : '/database';
      const redirectUrl = `/filter/${params.toString()}`;
      window.location.href = redirectUrl;
    } else if (pathname !== '/database') {
      window.location.href = '/database'
    } else {
      return;
    }
  };

  const resetFilters = () => {
    setChemicalClasses([]);
    setFoundOnGRASList(undefined);
    setMolecularWeightMin("");
    setMolecularWeightMax("");
    setCellType("");
    setSuccessRateMin("");
    setSuccessRateMax("");
    setReset(true);
    setIsOpen(false);
  };

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 h-8 w-8 sm:h-8 sm:w-auto"
          title="Cite this resource"
        >
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-6">
        <motion.div
          className="flex flex-col gap-4"
          initial="hidden"
          animate="visible"
          variants={popupVariants}
          transition={{ duration: 0.1 }}
        >
          <DialogTitle>
            Apply Search Filters
          </DialogTitle>
          {filterError && (
            <div>
              <p className="flex gap-1 items-center">
                <TriangleAlert height={18} />
                {filterError}
              </p>
              <div className="border-t border-color opacity-[0.4] mx-4 mt-3" />
            </div>
          )}
          <ChemClass 
            chemClassFilters={chemClassFilters} 
            chemicalClasses={chemicalClasses} 
            setChemicalClasses={setChemicalClasses}
            reset={reset} 
            setReset={setReset}
          />

          <div className="border-t border-color opacity-[0.4] mx-4" />

          <GrasList 
            foundOnGRASList={foundOnGRASList} 
            setFoundOnGRASList={setFoundOnGRASList} 
          />

          <div className="border-t border-color opacity-[0.4] mx-4" />

          <MolecularWeight 
            molecularWeightMin={molecularWeightMin} 
            setMolecularWeightMin={setMolecularWeightMin} 
            molecularWeightMax={molecularWeightMax} 
            setMolecularWeightMax={setMolecularWeightMax} 
          />

          <div className="border-t border-color opacity-[0.4] mx-4" />

          <CellComponent 
            cellTypeFilters={cellTypeFilters} 
            cellType={cellType} 
            setCellType={setCellType} 
            successRateMin={successRateMin} 
            setSuccessRateMin={setSuccessRateMin} 
            successRateMax={successRateMax} 
            setSuccessRateMax={setSuccessRateMax} 
          />

          <div className="flex items-center flex-wrap gap-2 mt-2">
            <Button onClick={applyFilters} variant="outline" className="w-[170px]">
              Apply Filters
              <ArrowDownWideNarrow />
            </Button>

            <Button onClick={resetFilters} variant="secondary" className="w-[170px]">
              Reset Filters
              <FunnelX />
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}