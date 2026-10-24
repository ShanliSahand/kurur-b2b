"use client";

export type TabType = "requests" | "ads" | "suppliers";

interface MainTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function MainTabs({ activeTab, setActiveTab }: MainTabsProps) {
  const tabs = [
    {
      id: "suppliers" as TabType,
      label: "تامین کنندگان",
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="28" 
          height="28" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={activeTab === "suppliers" ? "text-blue-600" : "text-green-600"}
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
        </svg>
      ),
    },
    {
      id: "ads" as TabType,
      label: "آگهی های فروش",
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="28" 
          height="28" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={activeTab === "ads" ? "text-red-500" : "text-green-600"}
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      ),
    },
    {
      id: "requests" as TabType,
      label: "درخواستهای خرید",
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="28" 
          height="28" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={activeTab === "requests" ? "text-emerald-500" : "text-green-600"}
        >
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M9 14l2 2 4-4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 justify-end">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        // Determine active colors based on the tab ID
        let activeClasses = "border-border bg-white hover:bg-gray-50";
        let activeTextClasses = "text-gray-500";

        if (isActive) {
          if (tab.id === "requests") {
            activeClasses = "border-emerald-300 bg-emerald-50 shadow-sm";
            activeTextClasses = "text-emerald-600";
          } else if (tab.id === "ads") {
            activeClasses = "border-red-300 bg-red-50 shadow-sm";
            activeTextClasses = "text-red-600";
          } else if (tab.id === "suppliers") {
            activeClasses = "border-blue-300 bg-blue-50 shadow-sm";
            activeTextClasses = "text-blue-600";
          }
        }

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-300 ${activeClasses}`}
          >
            <span className="shrink-0">{tab.icon}</span>
            <span className={`text-sm font-bold whitespace-nowrap ${activeTextClasses}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}