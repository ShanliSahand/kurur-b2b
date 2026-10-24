"use client";

import { useState, useRef, useEffect } from "react";
import { IRAN_PROVINCES, PROVINCES_LIST } from "../lib/iranData";

interface LocationSelectorProps {
  onLocationChange: (locations: string[]) => void;
}

export default function LocationSelector({ onLocationChange }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCity = (city: string) => {
    const newLocations = selectedLocations.includes(city)
      ? selectedLocations.filter(c => c !== city)
      : [...selectedLocations, city];
      
    setSelectedLocations(newLocations);
    if (onLocationChange) onLocationChange(newLocations);
  };

  const toggleProvince = (province: string) => {
    const cities = IRAN_PROVINCES[province];
    const allSelected = cities.every(c => selectedLocations.includes(c));
    let newLocations = [];
    
    if (allSelected) {
      // If all cities in province are selected, remove them
      newLocations = selectedLocations.filter(c => !cities.includes(c));
    } else {
      // Otherwise, add all cities from this province
      newLocations = [...new Set([...selectedLocations, ...cities])];
    }
    
    setSelectedLocations(newLocations);
    if (onLocationChange) onLocationChange(newLocations);
  };

  const handleClearAll = () => {
    setSelectedLocations([]);
    setSelectedProvince(null);
    if (onLocationChange) onLocationChange([]);
  };

  const getDisplayText = () => {
    if (selectedLocations.length === 0) return "کل ایران";
    if (selectedLocations.length === 1) return selectedLocations[0];
    return `${selectedLocations.length} موقعیت انتخاب شده`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-brand-600 transition whitespace-nowrap"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span>{getDisplayText()}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[500px] bg-white border border-border rounded-xl shadow-2xl z-[100] flex flex-col">
          
          <div className="flex h-[320px]">
            {/* Right Column: Provinces */}
            <div className="w-1/2 border-l border-border overflow-y-auto custom-scrollbar bg-gray-50">
              <button
                onClick={() => setSelectedProvince(null)}
                className={`w-full text-right px-4 py-2.5 text-sm transition ${
                  selectedProvince === null ? "bg-brand-50 text-brand-700 font-bold" : "hover:bg-gray-100 text-foreground"
                }`}
              >
                کل ایران
              </button>
              
              {PROVINCES_LIST.map((province) => {
                const cities = IRAN_PROVINCES[province];
                const allSelected = cities.every(c => selectedLocations.includes(c));
                const someSelected = cities.some(c => selectedLocations.includes(c)) && !allSelected;

                return (
                  <div
                    key={province}
                    className={`flex items-center justify-between px-4 py-2 text-sm transition cursor-pointer ${
                      selectedProvince === province ? "bg-white text-brand-700 font-bold border-r-2 border-brand-500" : "hover:bg-gray-100 text-foreground border-r-2 border-transparent"
                    }`}
                    onClick={() => setSelectedProvince(province)}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={el => {
                          if (el) el.indeterminate = someSelected;
                        }}
                        onChange={(e) => {
                          e.stopPropagation(); // Prevent triggering the div's onClick
                          toggleProvince(province);
                        }}
                        className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                      />
                      <span>{province}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Left Column: Cities */}
            <div className="w-1/2 overflow-y-auto custom-scrollbar p-2">
              {selectedProvince ? (
                IRAN_PROVINCES[selectedProvince].map((city) => (
                  <label
                    key={city}
                    className="flex items-center gap-2 w-full text-right px-3 py-2 text-sm rounded-lg hover:bg-brand-50 text-foreground cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedLocations.includes(city)}
                      onChange={() => toggleCity(city)}
                      className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                    />
                    {city}
                  </label>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted text-center px-4">
                  برای مشاهده شهرها، یک استان را انتخاب کنید
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-border p-2 flex justify-between bg-gray-50 rounded-b-xl">
             <button
               onClick={handleClearAll}
               className="text-xs text-red-500 hover:text-red-700 px-2 py-1"
             >
               پاک کردن همه
             </button>
             
             <button
               onClick={() => setIsOpen(false)}
               className="text-xs bg-brand-500 text-white px-4 py-1.5 rounded-md hover:bg-brand-600 transition"
             >
               ثبت و بستن
             </button>
          </div>

        </div>
      )}
    </div>
  );
}