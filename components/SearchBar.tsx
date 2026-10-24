"use client";

import { useState } from "react";
import LocationSelector from "./LocationSelector";
import { useRouter } from "next/navigation";

type TabType = "requests" | "ads" | "suppliers";

interface SearchBarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  initialQuery?: string;
  onLocationChange?: (locations: string[]) => void;
}

export default function SearchBar({ activeTab, setActiveTab, initialQuery = "", onLocationChange }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSearch = () => {
    // Navigate to the search page even if the query is empty
    router.push(`/search?q=${encodeURIComponent(query)}&tab=${activeTab}`);
  };

  return (
    <section className="px-4 py-4">
      <div className="mx-auto max-w-5xl">
        
        {/* The Main Search Container */}
        <div className="bg-white rounded-full border border-border shadow-lg p-1.5 flex items-center justify-between">
          
          {/* Right Side (Start in RTL): Dropdown & Location */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 border-l border-border pl-2 sm:pl-4">
            
            {/* Tabs Dropdown */}
            <div className="relative flex items-center">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as TabType)}
                className="appearance-none bg-transparent pl-6 pr-2 py-2 text-sm font-bold text-foreground cursor-pointer focus:outline-none"
              >
                <option value="requests">درخواست‌های خرید</option>
                <option value="ads">آگهی‌های فروش</option>
                <option value="suppliers">لیست تامین‌کنندگان</option>
              </select>
              {/* Custom Arrow on the Left (RTL end) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-0 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            <div className="w-px h-6 bg-border hidden sm:block"></div>

            {/* Location Selector */}
            <div className="hidden sm:block">
              <LocationSelector onLocationChange={onLocationChange || (() => {})} />
            </div>

          </div>

          {/* Middle: Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="جستجو... مثلاً ورق آهن، روغن سویا"
            className="flex-1 min-w-0 px-4 py-2 text-sm bg-transparent focus:outline-none placeholder:text-muted"
          />

          {/* Left Side (End in RTL): Smart Mode, Mic, Search Button */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Smart Mode */}
            <button
              type="button"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-xs font-bold">جستجوی هوشمند</span>
            </button>

            {/* Mic */}
            <button
              type="button"
              className="p-2 text-muted hover:text-brand-600 transition"
              aria-label="جستجوی صوتی"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </button>

            {/* Search Button */}
            <button
              type="button"
              onClick={handleSearch}
              className="shrink-0 w-10 h-10 rounded-full bg-brand-500 hover:bg-brand-600 text-white transition flex items-center justify-center ml-1"
              aria-label="جستجو"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

          </div>
        </div>
      </div>
    </section>
  );
}