"use client";

import { useState, useEffect } from "react";
import { getCategories } from "@/lib/actions/locations";

interface CategorySidebarProps {
  theme: any;
  activeTab: string;
  selectedCategoryIds: string[];
  onCategorySelect: (ids: string[]) => void;
}

export default function CategorySidebar({ theme, activeTab, selectedCategoryIds, onCategorySelect }: CategorySidebarProps) {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    getCategories().then((data) => {
      setCategories(data);
    });
  }, []);

  const toggleCategory = (id: string) => {
    if (selectedCategoryIds.includes(id)) {
      onCategorySelect(selectedCategoryIds.filter(c => c !== id));
    } else {
      onCategorySelect([...selectedCategoryIds, id]);
    }
  };

  const handleClearAll = () => {
    onCategorySelect([]);
  };

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="bg-white border border-border rounded-2xl p-4 sticky top-24">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground">دسته‌بندی</h3>
          {selectedCategoryIds.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="text-xs text-red-500 hover:text-red-700"
            >
              پاک کردن
            </button>
          )}
        </div>
        
        <div className="space-y-1">
          <button 
            onClick={handleClearAll}
            className={`w-full text-right flex justify-between items-center px-2 py-2 text-sm transition ${selectedCategoryIds.length === 0 ? "text-foreground font-bold" : "text-muted hover:text-foreground"}`}
          >
            <span>همه دسته‌ها</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>

          <div className="mt-2 space-y-1">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className={`flex items-center gap-2 w-full text-right px-3 py-2 text-sm rounded-md transition cursor-pointer ${
                  selectedCategoryIds.includes(cat.id) 
                    ? `${theme.bgLight} ${theme.text} font-bold` 
                    : "text-muted hover:bg-gray-100"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  className={`w-4 h-4 rounded border-gray-300 focus:ring-0 ${
                    activeTab === 'requests' ? 'text-emerald-600' : activeTab === 'ads' ? 'text-red-600' : 'text-blue-600'
                  }`}
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}