"use client"

import React, { useState, useEffect, KeyboardEvent, useRef } from "react"
import { useRouter } from "next/navigation"
//import { AlignLeft, Brain, CornerDownRight, Filter, Search } from "lucide-react"
import { Filter, Search } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { FilterModal } from "./filter-modal"

interface SearchResultItem {
  name: string;
  hash: string;
}

export function SearchBox() {
  //const [textSearch, setTextSearch] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [errorText, setErrorText] = useState<string>("")
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [focusedIndex, setFocusedIndex] = useState<number>(-1) // Track focused result
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter();

  // Debounce logic
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("")
  useEffect(() => {
    if (searchTerm.length > 3) {
      setIsTyping(true)
    }
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setIsTyping(false)
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm])

  // Fetch API when debouncedSearchTerm changes
  useEffect(() => {
    if (debouncedSearchTerm.length > 3) {
      const fetchResults = async () => {
        setIsFetching(true)
        try {
          const response = await fetch("/api/quickSearch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ search_query: debouncedSearchTerm }),
          })
          if (!response.ok) throw new Error("Failed to fetch")
          const data = await response.json()
          setResults(data.results || [])
          console.log(data.results)
          setIsDropdownOpen(true)
        } catch (error) {
          console.error("Search API error:", error)
          setResults([])
          setIsDropdownOpen(false)
        } finally {
          setIsFetching(false)
        }
      }
      fetchResults()
    } else {
      setResults([])
      setIsDropdownOpen(false)
      setIsFetching(false)
    }
  }, [debouncedSearchTerm])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setErrorText("")
    setFocusedIndex(-1) // Reset focus when typing
  }

  const handleSearchClick = () => {
    if (!searchTerm.trim()) {
      router.push('/database');
      //setErrorText("Please enter a search term")
      return
    }

    if (searchTerm.length <= 1) {
      setErrorText("Search term must be more than 1 character")
      return
    }

    const encodedSearchTerm = encodeURIComponent(searchTerm)
    window.location.href = `/database/search/query=${encodedSearchTerm}`

    /*window.location.href = textSearch
      ? `/database/search/query=${encodedSearchTerm}`
      : `/search/vector/query=${encodedSearchTerm}`*/
  }

  /*const toggleSearch = () => {
    setTextSearch((prev) => !prev)
  }*/

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && focusedIndex === -1) {
      event.preventDefault()
      handleSearchClick()
    } else if (event.key === "ArrowDown") {
      event.preventDefault()
      setFocusedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (event.key === "Enter" && focusedIndex >= 0) {
      event.preventDefault()
      window.location.href = `/database/${results[focusedIndex].hash}`
      setIsDropdownOpen(false)
    } else if (event.key === "Escape") {
      setIsDropdownOpen(false)
      setFocusedIndex(-1)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        dropdownRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
        setFocusedIndex(-1)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="flex flex-col w-full">
      {errorText && (
        <p className="text-lg font-semibold text-purple-400 pb-2">{errorText}</p>
      )}

      <div className="relative w-full max-w-[420px] mx-auto md:mx-0">
        <label
          htmlFor="searchInput"
          className="absolute left-2 top-1/2 -translate-y-1/2 cursor-text"
        >
          <Search className="h-4 w-4 text-muted-foreground" />
        </label>
        <Input
          ref={inputRef}
          type="text"
          id="searchInput"
          placeholder="Name, Class..."
          className="w-full pr-18 pl-7"
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          value={searchTerm}
          autoComplete="off"
        />
        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className={cn(
              "absolute sm:min-w-[420px] min-w-[270px] bg-background border border-input rounded-md shadow-lg p-1 z-50",
              "max-h-60 overflow-y-auto",
              "flex flex-col",
              "animate-in fade-in-0 zoom-in-95",
              "top-full left-0 mt-1"
            )}
          >
            {(isTyping || isFetching) ? (
              Array.from({ length: 5 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-8 w-full px-2 py-1.5 mb-1 rounded-sm"
                />
              ))
            ) : results.length > 0 ? (
              results.map((result, index) => (
                <Link
                  href={`/database/${result.hash}`}
                  key={index}
                  className={cn(
                    "px-2 py-1.5 text-sm text-foreground rounded-sm w-full",
                    "hover:bg-accent hover:text-accent-foreground cursor-pointer flex justify-between",
                    focusedIndex === index && "bg-accent text-accent-foreground"
                  )}
                  role="option"
                  tabIndex={0}
                  onClick={() => {
                    setIsDropdownOpen(false)
                    setFocusedIndex(-1)
                  }}
                >
                  {result.name}
                  <span className="text-xs text-muted-foreground font-semibold hidden sm:block">
                    {result.hash}
                  </span>
                </Link>
              ))
            ) : (
              <p className="font-semibold text-sm text-center py-2 text-muted-foreground">
                No Results Found
              </p>
            )}
          </div>
        )}

        <div className="font-semibold absolute right-0 top-1/2 -translate-y-1/2 flex gap-2 items-center">
          {/*<Button
            onClick={toggleSearch}
            className="h-7 w-7 font-semibold"
            variant="ghost"
            size="icon"
            disabled
          >
            {textSearch ? <AlignLeft /> : <Brain />}
          </Button>*/}

          {/*<Button
            className="h-7 w-7 font-semibold"
            variant="ghost"
            size="icon"
            disabled
          >
            <Filter />
          </Button>*/}
          <FilterModal chemClassFilters={[]} cellTypeFilters={[]}>
            <Filter />
          </FilterModal>

          <Button
            onClick={handleSearchClick}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
          >
            {/*<CornerDownRight />*/}
            Search
            <Search />
          </Button>
        </div>
      </div>
    </div>
  )
}