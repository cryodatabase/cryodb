"use client"

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, FileText } from "lucide-react";


interface Source {
  doi: string | null;
  quote: string | null;
  paper_id: string | null;
  experiment_quote: string | null;
}

interface ReferencesProp {
  references: { [paper_id: string]: Source }
}
export default function ReferencePopup(references: ReferencesProp) {
  const [isOpen, setIsOpen] = useState(false);

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

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Button to toggle the dialog */}
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 h-8 w-8 border border-color sm:h-8 sm:w-auto"
          title="Cite this resource"
        >
          <FileText className="h-4 w-4" />
          <span className="hidden sm:block">View References</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[600px] overflow-y-scroll p-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={popupVariants}
          transition={{ duration: 0.1 }}
        >
          <DialogHeader>
            <div className="flex items-center justify-between mb-4">
              <DialogTitle>References</DialogTitle>
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
          {Object.keys(references.references).length > 0
            ? Object.keys(references.references).map((paper_id, index) => (
                <div key={paper_id} className={`mb-2 pb-2 ${index === Object.keys(references.references).length - 1 ? "" : "border-b border-color"}`}>
                  {references.references[paper_id].quote && (
                    <p className="text-md line-clamp-3">
                      &quot;{references.references[paper_id].quote}&quot;
                    </p>
                  )}
                  {paper_id ? (
                    <a
                      href={`/database/papers/${paper_id}` || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 text-sm dark:text-purple-500 hover:underline"
                    >
                      {paper_id || references.references[paper_id].doi}
                    </a>
                  ) : (
                    <p className="text-purple-600 text-sm dark:text-purple-500 hover:underline">
                      {paper_id || references.references[paper_id].doi}
                    </p>
                  )}
                  

                </div>
              ))
            : 'No References Found'}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};