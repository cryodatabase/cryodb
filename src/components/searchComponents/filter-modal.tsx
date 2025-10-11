/*
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
}*/



"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TriangleAlert, ArrowDownWideNarrow, FunnelX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterModalProps {
  children: React.ReactNode;
}

const filterProperties = [
  { name: "MOLECULAR_MASS", label: "Molecular Mass (g/mol)", type: "range" },
  { name: "SOLUBILITY", label: "Solubility (mg/L)", type: "range" },
  { name: "VISCOSITY", label: "Viscosity (mPa·s)", type: "range" },
  { name: "TG_PRIME", label: "Tg Prime (°C)", type: "range" },
  { name: "PARTITION_COEFFICIENT", label: "Partition Coefficient (logP)", type: "range" },
  { name: "DIELECTRIC_CONSTANT", label: "Dielectric Constant", type: "range" },
  { name: "THERMAL_CONDUCTIVITY", label: "Thermal Conductivity (W/m·K)", type: "range" },
  { name: "HEAT_CAPACITY", label: "Heat Capacity (J/g·K)", type: "range" },
  { name: "THERMAL_EXPANSION_COEFFICIENT", label: "Thermal Expansion Coefficient (1/K)", type: "range" },
  { name: "CRYSTALLIZATION_TEMPERATURE", label: "Crystallization Temperature (°C)", type: "range" },
  { name: "DIFFUSION_COEFFICIENT", label: "Diffusion Coefficient (m²/s)", type: "range" },
  { name: "HYDROGEN_BOND_DONORS_ACCEPTORS", label: "Hydrogen Bond Donors/Acceptors", type: "range" },
  { name: "MELTING_POINT", label: "Melting Point (°C)", type: "range" },
  { name: "HYDROPHOBICITY", label: "Hydrophobicity", type: "range" },
  { name: "DENSITY", label: "Density (g/cm³)", type: "range" },
  { name: "REFRACTIVE_INDEX", label: "Refractive Index", type: "range" },
  { name: "SURFACE_TENSION", label: "Surface Tension (mN/m)", type: "range" },
  { name: "PH", label: "pH", type: "range" },
  { name: "OSMOLALITY_OSMOLARITY", label: "Osmolality/Osmolarity (mOsm/kg)", type: "range" },
  { name: "POLAR_SURFACE_AREA", label: "Polar Surface Area (Å²)", type: "range" },
];

export function FilterModal({ children }: FilterModalProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<Record<string, { min?: string; max?: string; value?: string | boolean }>>({});
  const [filterError, setFilterError] = useState("");
  const pathname = usePathname();

  const handleFilterChange = (name: string, field: "min" | "max" | "value", value: string | boolean) => {
    setFilters((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        [field]: value,
      },
    }));
  };

  const validateRange = (min: string, max: string, property: string) => {
    const minFloat = parseFloat(min);
    const maxFloat = parseFloat(max);
    if (min && max && (isNaN(minFloat) || isNaN(maxFloat))) {
      return `Invalid values for ${property}. Please ensure both are valid numbers.`;
    }
    return "";
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    let hasFilters = false;

    filterProperties.forEach(({ name, type }) => {
      const filter = filters[name];
      if (!filter) return;

      if (type === "range" && (filter.min || filter.max)) {
        const error = validateRange(filter.min || "", filter.max || "", name);
        if (error) {
          setFilterError(error);
          return;
        }
        const minFloat = filter.min ? parseFloat(filter.min as string) : undefined;
        const maxFloat = filter.max ? parseFloat(filter.max as string) : undefined;
        if (minFloat !== undefined && !isNaN(minFloat)) {
          params.append(`${name}Min`, minFloat.toString());
          hasFilters = true;
        }
        if (maxFloat !== undefined && !isNaN(maxFloat)) {
          params.append(`${name}Max`, maxFloat.toString());
          hasFilters = true;
        }
      }
    });

    if (filterError) return;

    const redirectUrl = hasFilters ? `/filter/${params.toString()}` : "/database";
    if (hasFilters || pathname !== "/database") {
      window.location.href = redirectUrl;
    }
  };

  const resetFilters = () => {
    setFilters({});
    setFilterError("");
    setIsOpen(false);
  };

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-8 w-8 sm:h-8 sm:w-auto" title="Apply filters">
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-6 max-h-[80vh] overflow-y-auto">
        <motion.div
          className="flex flex-col gap-4"
          initial="hidden"
          animate="visible"
          variants={popupVariants}
          transition={{ duration: 0.1 }}
        >
          <DialogTitle>Apply Search Filters</DialogTitle>
          {filterError && (
            <div>
              <p className="flex gap-1 items-center text-red-500">
                <TriangleAlert height={18} />
                {filterError}
              </p>
              <div className="border-t border-gray-200 opacity-50 mx-4 mt-3" />
            </div>
          )}

          {filterProperties.map(({ name, label, type }) => (
            <div key={name} className="flex flex-col gap-2">
              <Label className="font-semibold">{label}</Label>
              {type === "range" && (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters[name]?.min || ""}
                    onChange={(e) => handleFilterChange(name, "min", e.target.value)}
                    className="w-full"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters[name]?.max || ""}
                    onChange={(e) => handleFilterChange(name, "max", e.target.value)}
                    className="w-full"
                  />
                </div>
              )}
              {type === "boolean" && (
                <Select
                  value={filters[name]?.value?.toString() || ""}
                  onValueChange={(value) => handleFilterChange(name, "value", value === "true")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <div className="border-t border-gray-200 opacity-50 mx-4 mt-2" />
            </div>
          ))}

          <div className="flex items-center flex-wrap gap-2 mt-2">
            <Button onClick={applyFilters} variant="outline" className="w-[170px]">
              Apply Filters
              <ArrowDownWideNarrow className="ml-2" />
            </Button>
            <Button onClick={resetFilters} variant="secondary" className="w-[170px]">
              Reset Filters
              <FunnelX className="ml-2" />
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}