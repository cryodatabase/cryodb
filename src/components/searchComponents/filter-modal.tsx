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






































/*

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
}*/











"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TriangleAlert, ArrowDownWideNarrow, FunnelX, X, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Property definitions from existing code
const PROPERTY_DEFINITIONS = {
  MOLECULAR_MASS: { label: "Molecular Mass", defaultUnit: "g/mol", units: ["g/mol", "Da", "kDa"], type: "numeric" },
  SOLUBILITY: { label: "Solubility", defaultUnit: "mg/mL", units: ["mg/mL", "g/100 mL", "% w/v"], type: "numeric" },
  VISCOSITY: { label: "Viscosity", defaultUnit: "mPa.s", units: ["mPa.s", "cP"], type: "numeric" },
  TG_PRIME: { label: "Tg'", defaultUnit: "degC", units: ["degC", "degK"], type: "numeric" },
  PARTITION_COEFFICIENT: { label: "Partition Coefficient", defaultUnit: "logP", units: ["logP"], type: "numeric" },
  DIELECTRIC_CONSTANT: { label: "Dielectric Constant", defaultUnit: "", units: [], type: "numeric" },
  THERMAL_CONDUCTIVITY: { label: "Thermal Conductivity", defaultUnit: "W/(m.K)", units: ["W/(m.K)"], type: "numeric" },
  HEAT_CAPACITY: { label: "Heat Capacity", defaultUnit: "J/(mol.K)", units: ["J/(mol.K)", "cal/(mol.K)"], type: "numeric" },
  THERMAL_EXPANSION_COEFFICIENT: { label: "Thermal Expansion Coefficient", defaultUnit: "1/K", units: ["1/K"], type: "numeric" },
  CRYSTALLIZATION_TEMPERATURE: { label: "Crystallization Temperature", defaultUnit: "degC", units: ["degC", "degK"], type: "numeric" },
  DIFFUSION_COEFFICIENT: { label: "Diffusion Coefficient", defaultUnit: "m2/s", units: ["m2/s", "cm2/s"], type: "numeric" },
  HYDROGEN_BOND_DONORS_ACCEPTORS: { label: "Hydrogen Bond Donors/Acceptors", defaultUnit: "count", units: ["count"], type: "numeric" },
  SOURCE_OF_COMPOUND: { label: "Source of Compound", defaultUnit: "text", units: ["text"], type: "text" },
  GRAS_CERTIFICATION: { label: "GRAS Certification", defaultUnit: "boolean", units: ["boolean"], type: "boolean" },
  MELTING_POINT: { label: "Melting Point", defaultUnit: "degC", units: ["degC", "degK"], type: "numeric" },
  HYDROPHOBICITY: { label: "Hydrophobicity", defaultUnit: "qualitative", units: ["qualitative"], type: "text" },
  DENSITY: { label: "Density", defaultUnit: "g/cm3", units: ["g/cm3", "kg/m3"], type: "numeric" },
  REFRACTIVE_INDEX: { label: "Refractive Index", defaultUnit: "", units: [], type: "numeric" },
  SURFACE_TENSION: { label: "Surface Tension", defaultUnit: "mN/m", units: ["mN/m", "dyn/cm"], type: "numeric" },
  PH: { label: "pH", defaultUnit: "", units: [], type: "numeric" },
  OSMOLALITY_OSMOLARITY: { label: "Osmolality/Osmolarity", defaultUnit: "Osmol/kg", units: ["Osmol/kg", "Osmol/L"], type: "numeric" },
  POLAR_SURFACE_AREA: { label: "Polar Surface Area", defaultUnit: "A2", units: ["A2"], type: "numeric" },
} as const;

type PropertyType = keyof typeof PROPERTY_DEFINITIONS;

interface FilterState {
  id: string;
  prop_type: PropertyType;
  unit: string;
  min_value?: string;
  max_value?: string;
  raw_value?: string;
}

interface FilterModalProps {
  children: React.ReactNode;
}

export function FilterModal({ children }: FilterModalProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState[]>([]);
  const [showAddFilter, setShowAddFilter] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);
  const [filterError, setFilterError] = useState("");
  const pathname = usePathname();

  const addFilter = () => {
    const newFilter: FilterState = {
      id: Math.random().toString(36).substr(2, 9),
      prop_type: "MOLECULAR_MASS",
      unit: PROPERTY_DEFINITIONS.MOLECULAR_MASS.defaultUnit,
      min_value: "",
      max_value: "",
      raw_value: "",
    };
    setFilters([...filters, newFilter]);
    setExpandedFilter(newFilter.id);
    setShowAddFilter(false);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
    if (expandedFilter === id) setExpandedFilter(null);
  };

  const updateFilter = (id: string, updates: Partial<FilterState>) => {
    setFilters(filters.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handlePropertyTypeChange = (id: string, propType: PropertyType) => {
    const propDef = PROPERTY_DEFINITIONS[propType];
    updateFilter(id, {
      prop_type: propType,
      unit: propDef.defaultUnit,
      min_value: "",
      max_value: "",
      raw_value: "",
    });
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

    const validFilters = filters
      .filter((f) => {
        const propDef = PROPERTY_DEFINITIONS[f.prop_type];
        if (propDef.type === "numeric") {
          const error = validateRange(f.min_value || "", f.max_value || "", propDef.label);
          if (error) {
            setFilterError(error);
            return false;
          }
          return f.min_value || f.max_value;
        } else if (propDef.type === "boolean" || propDef.type === "text") {
          return f.raw_value;
        }
        return false;
      })
      .map((f) => ({
        prop_type: f.prop_type,
        unit: f.unit || undefined,
        min_value: f.min_value ? parseFloat(f.min_value) : undefined,
        max_value: f.max_value ? parseFloat(f.max_value) : undefined,
        raw_value: f.raw_value || undefined,
      }));

    validFilters.forEach((filter) => {
      if (filter.min_value !== undefined && !isNaN(filter.min_value)) {
        params.append(`${filter.prop_type}Min`, filter.min_value.toString());
        hasFilters = true;
      }
      if (filter.max_value !== undefined && !isNaN(filter.max_value)) {
        params.append(`${filter.prop_type}Max`, filter.max_value.toString());
        hasFilters = true;
      }
      if (filter.raw_value !== undefined) {
        params.append(filter.prop_type, filter.raw_value);
        hasFilters = true;
      }
    });

    if (filterError) return;

    const redirectUrl = hasFilters ? `/database/filter/${params.toString()}` : "/database";
    if (hasFilters || pathname !== "/database") {
      window.location.href = redirectUrl;
    }
    setIsOpen(false);
  };

  const resetFilters = () => {
    setFilters([]);
    setExpandedFilter(null);
    setFilterError("");
    setShowAddFilter(false);
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

          <div className="space-y-4">
            {filters.map((filter) => {
              const propDef = PROPERTY_DEFINITIONS[filter.prop_type];
              const isExpanded = expandedFilter === filter.id;

              return (
                <Card key={filter.id} className="p-4 border-2">
                  <CardHeader className="px-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedFilter(isExpanded ? null : filter.id)}
                          data-testid={`button-toggle-filter-${filter.id}`}
                        >
                          {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                        </Button>
                        <span className="font-medium">{propDef.label}</span>
                        {filter.unit && <Badge variant="outline">{filter.unit}</Badge>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFilter(filter.id)}
                        data-testid={`button-remove-filter-${filter.id}`}
                      >
                        <X className="w-6 h-6" />
                      </Button>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0 px-0">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <Label>Property Type</Label>
                            <Select
                              value={filter.prop_type}
                              onValueChange={(value) => handlePropertyTypeChange(filter.id, value as PropertyType)}
                            >
                              <SelectTrigger data-testid={`select-property-${filter.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(PROPERTY_DEFINITIONS).map(([key, def]) => (
                                  <SelectItem key={key} value={key}>
                                    {def.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {propDef.units.length > 0 && propDef.type !== "boolean" && (
                            <div className="flex flex-col gap-1">
                              <Label>Unit</Label>
                              <Select
                                value={filter.unit}
                                onValueChange={(value) => updateFilter(filter.id, { unit: value })}
                              >
                                <SelectTrigger data-testid={`select-unit-${filter.id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {propDef.units.map((unit) => (
                                    <SelectItem key={unit} value={unit}>
                                      {unit}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>

                        {propDef.type === "numeric" && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                              <Label>Min Value</Label>
                              <Input
                                type="number"
                                step="any"
                                placeholder="Min"
                                value={filter.min_value || ""}
                                onChange={(e) => updateFilter(filter.id, { min_value: e.target.value })}
                                data-testid={`input-min-${filter.id}`}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <Label>Max Value</Label>
                              <Input
                                type="number"
                                step="any"
                                placeholder="Max"
                                value={filter.max_value || ""}
                                onChange={(e) => updateFilter(filter.id, { max_value: e.target.value })}
                                data-testid={`input-max-${filter.id}`}
                              />
                            </div>
                          </div>
                        )}

                        {/*propDef.type === "text" ||  // hide text prop type, only for source of compound at the moment */ }
                        {(propDef.type === "boolean") && (
                          <div className="flex flex-col gap-1">
                            <Label>Value</Label>
                            {propDef.type === "boolean" && (
                              <Select
                                value={filter.raw_value || ""}
                                onValueChange={(value) => updateFilter(filter.id, { raw_value: value })}
                              >
                                <SelectTrigger data-testid={`select-value-${filter.id}`}>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">Yes</SelectItem>
                                  <SelectItem value="false">No</SelectItem>
                                </SelectContent>
                              </Select>
                            )/* : (
                              <Input
                                type="text"
                                placeholder="Enter value"
                                value={filter.raw_value || ""}
                                onChange={(e) => updateFilter(filter.id, { raw_value: e.target.value })}
                                data-testid={`input-value-${filter.id}`}
                              />
                            )}*/}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}

            {showAddFilter && (
              <Card className="border-2 border-dashed">
                <CardContent className="py-6">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">Click to add a new property filter</p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={addFilter} data-testid="button-confirm-add-filter">
                        Add Filter
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddFilter(false)}
                        data-testid="button-cancel-add-filter"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              onClick={() => setShowAddFilter(true)}
              variant="outline"
              className="w-[170px]"
              disabled={showAddFilter}
              data-testid="button-add-filter"
            >
              Add Filter
            </Button>

            <div className="flex items-center flex-wrap gap-2 mt-2">
              <Button
                onClick={resetFilters}
                variant="destructive"
                className="w-[170px]"
                data-testid="button-reset-filters"
              >
                Reset Filters
                <FunnelX className="ml-2" />
              </Button>
              <Button onClick={applyFilters} variant="default" className="w-[170px]" data-testid="button-apply-filters">
                Apply Filters
                <ArrowDownWideNarrow className="ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}