"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input"; // Assuming you have a UI library like shadcn/ui
import { Button } from "@/components/ui/button";

export default function SearchComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  // Update searchQuery state when searchParams change
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
      params.set("page", "1"); // Reset to first page on new search
    } else {
      params.delete("search");
    }
    router.push(`/references?${params.toString()}`);
  };

  const handleClear = () => {
    setSearchQuery("");
    const params = new URLSearchParams(searchParams);
    params.delete("search");
    params.set("page", "1"); // Reset to first page
    router.push(`/references?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      <Input
        type="text"
        placeholder="Search references..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyPress}
        className="max-w-md"
      />
      <Button onClick={handleSearch}>Search</Button>
      {searchQuery && (
        <Button variant="outline" onClick={handleClear}>
          Clear
        </Button>
      )}
    </div>
  );
}