"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import CategorySidebar from "@/components/CategorySidebar";
import MainTabs from "@/components/MainTabs";
import SubscriptionRequiredModal from "@/components/SubscriptionRequiredModal";
import { getRequests, getSuppliers, getProducts } from "@/lib/actions/requests";
import { unlockContact } from "@/lib/actions/unlock";

export type TabType = "requests" | "ads" | "suppliers";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const tabParam = (searchParams.get("tab") as TabType) || "requests";

  const [activeTab, setActiveTab] = useState<TabType>(tabParam);
  const [activeLocations, setActiveLocations] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  
  const [requestsList, setRequestsList] = useState<any[]>([]);
  const [suppliersList, setSuppliersList] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Unlock State
  const [unlockedContacts, setUnlockedContacts] = useState<Record<string, any>>({});
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  const theme = {
    requests: {
      text: "text-emerald-600",
      bgLight: "bg-emerald-50",
      border: "border-emerald-200",
      button: "bg-emerald-500 hover:bg-emerald-600",
      chipBg: "bg-emerald-100",
      chipText: "text-emerald-800",
      bannerTitle: "نیازت را ثبت کن",
      bannerDesc: "فروشنده‌ها پیشنهاد می‌فرستند؛ بدون گشتن در آگهی‌های پراکنده.",
      bannerBtn: "ثبت درخواست خرید",
    },
    ads: {
      text: "text-red-500",
      bgLight: "bg-red-50",
      border: "border-red-200",
      button: "bg-red-500 hover:bg-red-600",
      chipBg: "bg-red-100",
      chipText: "text-red-800",
      bannerTitle: "آگهی‌ات را ثبت کن",
      bannerDesc: "خریداران در حال جستجو هستند؛ با یک آگهی کامل پیدایت می‌کنند.",
      bannerBtn: "ثبت آگهی فروش",
    },
    suppliers: {
      text: "text-blue-600",
      bgLight: "bg-blue-50",
      border: "border-blue-200",
      button: "bg-blue-600 hover:bg-blue-700",
      chipBg: "bg-blue-100",
      chipText: "text-blue-800",
      bannerTitle: "پروفایل شرکت خود را بسازید",
      bannerDesc: "محصولات و اطلاعات تماس خود را به خریداران نشان دهید.",
      bannerBtn: "ثبت نام تامین‌کننده",
    },
  }[activeTab];

  useEffect(() => {
    setLoading(true);

    if (activeTab === "requests") {
      getRequests({ query, categoryIds: selectedCategoryIds, cityNames: activeLocations }).then((res) => {
        if (res.success && res.requests) setRequestsList(res.requests);
        else setRequestsList([]);
        setLoading(false);
      });
    } else if (activeTab === "suppliers") {
      getSuppliers({ query, cityNames: activeLocations }).then((res) => {
        if (res.success && res.suppliers) setSuppliersList(res.suppliers);
        else setSuppliersList([]);
        setLoading(false);
      });
    } else if (activeTab === "ads") {
      getProducts({ query, categoryIds: selectedCategoryIds, cityNames: activeLocations }).then((res) => {
        if (res.success && res.products) setProductsList(res.products);
        else setProductsList([]);
        setLoading(false);
      });
    }
  }, [query, selectedCategoryIds, activeLocations, activeTab]);

  const handleUnlock = async (requestId: string) => {
    setUnlockingId(requestId);
    const res = await unlockContact(requestId);
    
    if (res.success && res.contact) {
      setUnlockedContacts(prev => ({ ...prev, [requestId]: res.contact }));
    } else {
      if (res.needsCredits) {
        setIsSubModalOpen(true);
      } else {
        alert(res.error);
      }
    }
    setUnlockingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      
      <div className="bg-white border-b border-border pt-4 pb-6 space-y-4">
        <div className="mx-auto max-w-5xl px-4">
          <MainTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <SearchBar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          initialQuery={query} 
          onLocationChange={setActiveLocations} 
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 flex flex-col-reverse lg:flex-row gap-6 items-start">
        
        <main className="flex-1 w-full space-y-4">
          
          <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 border border-border rounded-full text-sm font-medium hover:bg-gray-100 transition">
                  <span>فوریت</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 border border-border rounded-full text-sm font-medium hover:bg-gray-100 transition">
                  <span>محدوده بودجه</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 border border-border rounded-full text-sm font-medium hover:bg-gray-100 transition">
                  <span>تاریخ درخواست</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 border border-border rounded-full text-sm font-medium hover:bg-gray-100 transition">
                  <span>نوع تامین‌کننده</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
              </div>
              <button 
                onClick={() => {
                  setActiveLocations([]);
                  setSelectedCategoryIds([]);
                }} 
                className="text-sm text-muted hover:text-red-500 transition font-medium"
              >
                پاک کردن همه
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border">
              <span className="text-xs text-muted ml-1">فیلترهای فعال:</span>
              
              {query && (
                <span className={`flex items-center gap-1.5 px-3 py-1 ${theme.chipBg} ${theme.chipText} text-xs rounded-full border ${theme.border}`}>
                  جستجو: {query}
                </span>
              )}

              {selectedCategoryIds.map((catId) => (
                <span key={catId} className={`flex items-center gap-1.5 px-3 py-1 ${theme.chipBg} ${theme.chipText} text-xs rounded-full border ${theme.border}`}>
                  فیلتر دسته‌بندی
                  <button 
                    onClick={() => setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== catId))}
                    className="hover:text-red-500"
                  >
                    ✖
                  </button>
                </span>
              ))}

              {activeLocations.length > 0 ? (
                activeLocations.map((loc) => (
                  <span key={loc} className={`flex items-center gap-1.5 px-3 py-1 ${theme.chipBg} ${theme.chipText} text-xs rounded-full border ${theme.border}`}>
                    {loc}
                    <button 
                      className="hover:text-red-500"
                      onClick={() => setActiveLocations(activeLocations.filter(l => l !== loc))}
                    >
                      ✖
                    </button>
                  </span>
                ))
              ) : (
                <span className={`flex items-center gap-1.5 px-3 py-1 ${theme.chipBg} ${theme.chipText} text-xs rounded-full border ${theme.border}`}>
                  کل ایران
                </span>
              )}
            </div>
          </div>

          <div className={`rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border ${theme.border} ${theme.bgLight}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme.text} bg-white shadow-sm`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div>
                <h3 className={`text-sm font-bold ${theme.text} mb-1`}>{theme.bannerTitle}</h3>
                <p className="text-xs text-muted">{theme.bannerDesc}</p>
              </div>
            </div>
            <button className={`shrink-0 text-white text-sm font-medium px-5 py-2.5 rounded-full transition ${theme.button}`}>
              {theme.bannerBtn}
            </button>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-medium text-foreground">ترتیب نمایش</span>
            <div className="relative">
              <select className="appearance-none bg-white border border-border rounded-lg pl-8 pr-4 py-2 text-sm font-medium focus:outline-none focus:border-brand-500 cursor-pointer">
                <option>جدیدترین</option>
                <option>ارزان‌ترین</option>
                <option>گران‌ترین</option>
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <div className="space-y-4 mt-2">
            {loading ? (
              <div className="text-center py-10 text-muted">در حال بارگذاری...</div>
            ) : activeTab === "requests" ? (
              
              requestsList.length === 0 ? (
                <EmptyState theme={theme} query={query} message="در حال حاضر درخواستی با این فیلترها ثبت نشده است." />
              ) : (
                requestsList.map((req: any) => (
                  <div key={req.id} className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${theme.chipBg} ${theme.chipText}`}>
                            {req.category?.name}
                          </span>
                          <span className="text-xs text-muted">
                            {new Date(req.createdAt).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-1">{req.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted mt-2">
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            {req.city?.name}، {req.province?.name}
                          </span>
                          <span>مقدار: {req.quantity} {req.unit}</span>
                        </div>
                      </div>
                      
                      <div className="shrink-0 flex flex-col items-end gap-2">
                        
                        {unlockedContacts[req.id] ? (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-900 min-w-[200px]" dir="rtl">
                            <div className="font-bold border-b border-emerald-200 pb-1 mb-1">
                              {unlockedContacts[req.id].companyName || unlockedContacts[req.id].fullName}
                            </div>
                            {unlockedContacts[req.id].companyName && (
                              <div className="text-xs mb-2">{unlockedContacts[req.id].fullName}</div>
                            )}
                            <div className="flex items-center gap-1 mb-1" dir="ltr">
                              <span className="text-emerald-600">📞</span> {unlockedContacts[req.id].phone}
                            </div>
                            {unlockedContacts[req.id].fixNumber && (
                              <div className="flex items-center gap-1 mb-1" dir="ltr">
                                <span className="text-emerald-600">☎️</span> {unlockedContacts[req.id].fixNumber}
                              </div>
                            )}
                            {unlockedContacts[req.id].email && (
                              <div className="flex items-center gap-1 mb-1 text-xs" dir="ltr">
                                <span className="text-emerald-600">✉️</span> {unlockedContacts[req.id].email}
                              </div>
                            )}
                            {unlockedContacts[req.id].whatsapp && (
                              <div className="flex items-center gap-1 mb-1 text-xs" dir="ltr">
                                <img src="/whatsapplogo.png" alt="WA" className="w-3 h-3" />
                                {unlockedContacts[req.id].whatsapp}
                              </div>
                            )}
                            {unlockedContacts[req.id].telegram && (
                              <div className="flex items-center gap-1 mb-1 text-xs" dir="ltr">
                                <img src="/Telegramlogo.png" alt="TG" className="w-3 h-3" />
                                {unlockedContacts[req.id].telegram}
                              </div>
                            )}
                            {unlockedContacts[req.id].wechat && (
                              <div className="flex items-center gap-1 text-xs" dir="ltr">
                                <img src="/wechatlogo.png" alt="WC" className="w-3 h-3" />
                                {unlockedContacts[req.id].wechat}
                              </div>
                            )}
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleUnlock(req.id)}
                            disabled={unlockingId === req.id}
                            className="bg-blue-50 text-blue-600 font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-100 transition disabled:opacity-50"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              {unlockingId === req.id ? (
                                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                              ) : (
                                <>
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </>
                              )}
                            </svg>
                            {unlockingId === req.id ? "در حال باز کردن..." : "اطلاعات تماس خریدار"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )

            ) : activeTab === "suppliers" ? (

              suppliersList.length === 0 ? (
                <EmptyState theme={theme} query={query} message="در حال حاضر تامین‌کننده‌ای با این فیلترها ثبت نشده است." />
              ) : (
                suppliersList.map((supplier: any) => (
                  <div key={supplier.id} className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row gap-5">
                    
                    <div className="flex-1 flex gap-4">
                      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-border">
                        {supplier.photoUrl ? (
                          <img src={supplier.photoUrl} alt={supplier.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-1">{supplier.companyName || supplier.fullName}</h3>
                        {supplier.companyName && (
                          <p className="text-sm text-muted mb-2">{supplier.fullName}</p>
                        )}
                        <p className="text-sm text-muted mb-3">{supplier.province?.name}، {supplier.city?.name}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                          <span dir="ltr" className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            {supplier.phone}
                          </span>
                          {supplier.whatsapp && (
                            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                              <img src="/whatsapplogo.png" alt="WA" className="w-3 h-3" />
                              <span dir="ltr">{supplier.whatsapp}</span>
                            </span>
                          )}
                          {supplier.telegram && (
                            <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              <img src="/Telegramlogo.png" alt="TG" className="w-3 h-3" />
                              <span dir="ltr">{supplier.telegram}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-72 border-t md:border-t-0 md:border-r border-border pt-4 md:pt-0 md:pr-5">
                      <h4 className="text-xs font-bold text-muted mb-3">محصولات اخیر:</h4>
                      {supplier.products.length === 0 ? (
                        <p className="text-xs text-gray-400">هنوز محصولی ثبت نکرده است.</p>
                      ) : (
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                          {supplier.products.map((prod: any) => (
                            <div key={prod.id} className="w-20 shrink-0">
                              <div className="w-20 h-20 rounded-lg bg-gray-100 border border-border overflow-hidden mb-1">
                                {prod.images && prod.images.length > 0 ? (
                                  <img src={prod.images[0]} alt={prod.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                  </div>
                                )}
                              </div>
                              <p className="text-[10px] text-foreground truncate leading-tight">{prod.title}</p>
                              <p className="text-[10px] text-red-500 font-bold">{prod.price || "توافقی"}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                ))
              )

            ) : activeTab === "ads" ? (

              productsList.length === 0 ? (
                <EmptyState theme={theme} query={query} message="در حال حاضر آگهی فروشی با این فیلترها ثبت نشده است." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productsList.map((prod: any) => (
                    <div key={prod.id} className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
                      <div className="h-40 bg-gray-100 relative">
                        {prod.images && prod.images.length > 0 ? (
                          <img src={prod.images[0]} alt={prod.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${theme.chipBg} ${theme.chipText}`}>
                            {prod.category?.name}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-base font-bold text-foreground mb-2 line-clamp-2">{prod.title}</h3>
                        
                        <div className="space-y-1 mb-4 flex-1">
                          {prod.price && (
                            <p className="text-sm text-red-500 font-bold">قیمت: {prod.price}</p>
                          )}
                          {prod.minOrder && (
                            <p className="text-xs text-muted">حداقل سفارش: {prod.minOrder}</p>
                          )}
                          <p className="text-xs text-muted flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            {prod.city?.name}، {prod.province?.name}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-border flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden">
                              {prod.seller?.photoUrl ? (
                                <img src={prod.seller.photoUrl} alt="Seller" className="w-full h-full object-cover" />
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="m-auto mt-1 text-gray-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                              )}
                            </div>
                            <span className="text-xs text-muted truncate max-w-[100px]">{prod.seller?.companyName || prod.seller?.fullName}</span>
                          </div>
                          
                          <Link href={`/ad/${prod.id}`} className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition">
                            مشاهده
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )

            ) : null}
          </div>
        </main>

        <CategorySidebar 
          theme={theme} 
          activeTab={activeTab} 
          selectedCategoryIds={selectedCategoryIds} 
          onCategorySelect={setSelectedCategoryIds} 
        />
        
      </div>

      <SubscriptionRequiredModal 
        isOpen={isSubModalOpen} 
        onClose={() => setIsSubModalOpen(false)} 
      />
    </div>
  );
}

function EmptyState({ theme, query, message }: { theme: any, query: string, message: string }) {
  return (
    <div className="bg-white border border-border rounded-2xl min-h-[400px] flex flex-col items-center justify-center p-8 text-center shadow-sm">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-muted">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">موردی یافت نشد</h2>
      <p className="text-muted text-sm max-w-md">
        {query ? `نتیجه‌ای برای "${query}" پیدا نشد.` : message}
      </p>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted">در حال بارگذاری...</div>}>
      <SearchContent />
    </Suspense>
  );
}