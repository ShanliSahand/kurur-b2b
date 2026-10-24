"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPanelData } from "@/lib/actions/panel";
import { deleteRequest } from "@/lib/actions/requests";
import { deleteProduct } from "@/lib/actions/products";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";

export default function PanelPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "active">("all");

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: "request" | "product" } | null>(null);

  const fetchData = () => {
    getPanelData().then((res) => {
      if (res.success) setData(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === "request") {
      await deleteRequest(itemToDelete.id);
    } else {
      await deleteProduct(itemToDelete.id);
    }
    
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
    fetchData(); // Refresh list
  };

  const openDeleteModal = (id: string, type: "request" | "product") => {
    setItemToDelete({ id, type });
    setIsDeleteModalOpen(true);
  };

  if (loading) return <div className="text-center py-20 text-muted">در حال بارگذاری پنل...</div>;
  if (!data) return <div className="text-center py-20 text-red-500">خطا در بارگذاری اطلاعات.</div>;

  const { user, requests, products, stats } = data;
  
  const isBuyer = user.role === "BUYER";
  const isSeller = user.role === "SELLER";
  const isBoth = user.role === "BOTH";

  const roleColor = isBuyer ? "text-emerald-600" : isSeller ? "text-red-600" : "text-blue-600";
  const borderColor = isBuyer ? "border-emerald-500" : isSeller ? "border-red-500" : "border-blue-500";
  const roleLabel = isBuyer ? "خریدار" : isSeller ? "فروشنده" : "خریدار و فروشنده";

  const fullAddress = `${user.country?.name || ""} - ${user.province?.name || ""} - ${user.city?.name || ""} - ${user.address || ""}`;

  const displayList = isSeller ? products : requests;
  
  const filteredList = activeTab === "active" 
    ? displayList.filter((item: any) => item.status === "OPEN")
    : displayList;

  const remainingDays = user.subscriptionEnd 
    ? Math.max(0, Math.ceil((new Date(user.subscriptionEnd).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))
    : 0;

  return (
    <div className="min-h-screen bg-white pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 space-y-6">
        
        <div className={`border-[1.5px] ${borderColor} bg-white`}>
          
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[280px]">
            
            <div className="md:col-span-3 border-b md:border-b-0 md:border-l-[1.5px] border-black p-4 flex flex-col items-center justify-center">
              <div className="w-32 h-40 bg-gray-100 border border-gray-300 flex items-center justify-center mb-4">
                 {user.photoUrl ? (
                   <img src={user.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-gray-400 text-sm font-semibold">بدون عکس</span>
                 )}
              </div>
            </div>

            {/* Middle Column: Info */}
            <div className="md:col-span-6 p-6 pt-8 flex flex-col justify-start gap-3">
              
              <div className="flex justify-start gap-4 items-baseline border-b border-gray-200 pb-2">
                <span className="font-bold text-black whitespace-nowrap">نام کاربر:</span>
                <span className={`font-bold text-lg ${roleColor}`}>{user.fullName || "-"}</span>
              </div>
              
              <div className="flex justify-start gap-4 items-baseline border-b border-gray-200 pb-2">
                <span className="font-bold text-black whitespace-nowrap">نقش کاربر:</span>
                <span className={`font-bold ${roleColor}`}>{roleLabel}</span>
              </div>
              
              <div className="flex justify-start gap-4 items-start border-b border-gray-200 pb-2">
                <span className="font-bold text-black whitespace-nowrap mt-1">آدرس:</span>
                <span className={`font-bold whitespace-normal leading-relaxed text-right block min-h-[3rem] ${roleColor}`} dir="rtl">
                  {fullAddress}
                </span>
              </div>
              
              <div className="flex justify-start gap-4 items-baseline border-b border-gray-200 pb-2">
                <span className="font-bold text-black whitespace-nowrap">شرکت:</span>
                <span className={`font-bold ${roleColor}`}>{user.companyName || "ثبت نشده"}</span>
              </div>

              {/* New lines added here */}
              {/* Subscription Info Line */}
              <div className="flex justify-start gap-4 items-baseline pt-1">
                <span className="font-bold text-black whitespace-nowrap">اشتراک:</span>
                <span className="font-bold text-blue-600">
                  {user.subscriptionType === "BASIC" ? "پایه" : 
                   user.subscriptionType === "SILVER" ? "نقره‌ای" : 
                   user.subscriptionType === "GOLD" ? "طلایی" : "پلاتینیوم"} 
                  {user.subscriptionType !== "BASIC" && user.subscriptionEnd && 
                    ` (انقضا: ${new Date(user.subscriptionEnd).toLocaleDateString('fa-IR')} - ${remainingDays} روز باقی‌مانده)`
                  }
                </span>
              </div>

              <div className="flex justify-start gap-4 items-baseline">
                <span className="font-bold text-black whitespace-nowrap">
                  {isBuyer ? "کــل درخـواست‌ها:" : isSeller ? "کــل آگهــی‌هـا :" : "کل موارد:"}
                </span>
                <span className="font-bold text-black">
                  {isBuyer ? stats.totalRequests : isSeller ? stats.totalProducts : stats.totalRequests + stats.totalProducts}
                </span>
              </div>

              <div className="flex justify-start gap-4 items-baseline">
                <span className="font-bold text-black whitespace-nowrap">
                  {isBuyer ? "درخواست‌های فعال:" : isSeller ? "آگهی‌های فعال:" : "موارد فعال:"}
                </span>
                <span className={`font-bold ${roleColor}`}>
                  {isBuyer ? stats.activeRequests : isSeller ? stats.activeProducts : stats.activeRequests + stats.activeProducts}
                </span>
              </div>

            </div>

            {/* Left Column: Contact Info */}
            <div className="md:col-span-3 border-t md:border-t-0 md:border-r-[1.5px] border-black p-4 flex flex-col">
              
              <div className="flex flex-col gap-4">
                <div className="flex justify-start gap-3 items-baseline border-b border-gray-200 pb-2">
                  <span className="font-bold text-black whitespace-nowrap">ایمیل:</span>
                  <span className="font-bold text-sm" dir="ltr">{user.email || "ثبت نشده"}</span>
                </div>
                <div className="flex justify-start gap-3 items-baseline border-b border-gray-200 pb-2">
                  <span className="font-bold text-black whitespace-nowrap">موبایل:</span>
                  <span className="font-bold text-sm" dir="ltr">{user.phone}</span>
                </div>
                <div className="flex justify-start gap-3 items-baseline border-b border-gray-200 pb-2">
                  <span className="font-bold text-black whitespace-nowrap">تلفن ثابت:</span>
                  <span className="font-bold text-sm" dir="ltr">{user.fixNumber || "ثبت نشده"}</span>
                </div>
                <div className="flex justify-start gap-3 items-center border-b border-gray-200 pb-2">
                  <span className="font-bold text-black whitespace-nowrap">واتساپ:</span>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="font-bold text-sm" dir="ltr">{user.whatsapp || "ثبت نشده"}</span>
                    <img src="/whatsapplogo.png" alt="WA" className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex justify-start gap-3 items-center border-b border-gray-200 pb-2">
                  <span className="font-bold text-black whitespace-nowrap">تلگرام:</span>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="font-bold text-sm" dir="ltr">{user.telegram || "ثبت نشده"}</span>
                    <img src="/Telegramlogo.png" alt="TG" className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex justify-start gap-3 items-center pb-2">
                  <span className="font-bold text-black whitespace-nowrap">وی‌چت:</span>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="font-bold text-sm" dir="ltr">{user.wechat || "ثبت نشده"}</span>
                    <img src="/wechatlogo.png" alt="WC" className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-auto pt-4">
                <Link href="/panel/edit" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 text-sm text-center rounded">ویرایش اطلاعات</Link>
                <Link href="/" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 text-sm text-center rounded">بازگشت</Link>
              </div>

            </div>
          </div>
        </div>

        <div className="border-[1.5px] border-black bg-white">
          <div className="flex border-b-[1.5px] border-black bg-gray-50">
            <div className="px-4 flex items-center justify-center cursor-pointer hover:bg-gray-100 border-l-[1.5px] border-black">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <div className="flex-1 border-l-[1.5px] border-black"></div>
            <button 
              onClick={() => setActiveTab("all")}
              className={`px-8 py-3 font-bold border-l-[1.5px] border-black ${activeTab === "all" ? "bg-white" : "hover:bg-gray-100 text-gray-500"}`}
            >
              {isBuyer ? "کل درخواست‌ها" : isSeller ? "کل آگهی‌ها" : "کل موارد"}
            </button>
            <button 
              onClick={() => setActiveTab("active")}
              className={`px-8 py-3 font-bold ${activeTab === "active" ? "bg-white" : "hover:bg-gray-100 text-gray-500"}`}
            >
              {isBuyer ? "درخواست‌های فعال" : isSeller ? "آگهی‌های فعال" : "موارد فعال"}
            </button>
          </div>

          <div className="min-h-[300px] p-4 md:p-8 flex flex-col items-center justify-center">
             {filteredList.length === 0 ? (
              <div className="text-center font-bold text-gray-800">
                <p className="mb-2">لیست خالی است</p>
                <p className="text-sm font-semibold text-muted">هنوز موردی ثبت نکرده‌اید.</p>
                {isBuyer && (
                  <Link href="/post" className="mt-4 inline-block text-emerald-600 text-sm font-bold hover:underline">
                    ثبت اولین درخواست +
                  </Link>
                )}
                {(isSeller || isBoth) && (
                  <Link href="/ad/post" className="mt-4 inline-block text-red-600 text-sm font-bold hover:underline">
                    ثبت اولین آگهی فروش +
                  </Link>
                )}
              </div>
            ) : (
              <div className="w-full space-y-4">
                 {filteredList.map((item: any) => (
                   <div key={item.id} className="border border-border rounded-xl p-4 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                     
                     <div>
                       <div className="flex items-center gap-2 mb-2">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isSeller ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                           {item.category?.name}
                         </span>
                         <span className="text-[10px] font-semibold text-muted">{new Date(item.createdAt).toLocaleDateString('fa-IR')}</span>
                       </div>
                       <h3 className="font-bold text-foreground text-sm md:text-base">{item.title}</h3>
                       <div className="flex items-center gap-3 text-xs font-semibold text-muted mt-1">
                         <span>{item.city?.name}، {item.province?.name}</span>
                         {isBuyer ? <span>مقدار: {item.quantity} {item.unit}</span> : <span>قیمت: {item.price || "توافقی"}</span>}
                       </div>
                     </div>

                     <div className="flex items-center gap-2 shrink-0">
                       <span className={`px-2 py-1 rounded-md text-xs font-bold ${item.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'}`}>
                         {item.status === 'OPEN' ? 'فعال' : 'بسته شده'}
                       </span>
                       
                       <Link href={isSeller ? `/ad/${item.id}/edit` : `/post/${item.id}/edit`} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition">
                         ویرایش
                       </Link>

                       <button 
                         onClick={() => openDeleteModal(item.id, isSeller ? "product" : "request")}
                         className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition"
                       >
                         حذف
                       </button>
                     </div>

                   </div>
                 ))}
              </div>
            )}
          </div>
        </div>

      </div>

      <ConfirmDeleteModal 
        isOpen={isDeleteModalOpen}
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        title={itemToDelete?.type === "product" ? "حذف آگهی فروش" : "حذف درخواست خرید"}
        description="آیا مطمئن هستید که می‌خواهید این مورد را حذف کنید؟ این عمل غیرقابل بازگشت است."
      />
    </div>
  );
}