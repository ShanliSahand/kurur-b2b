"use client";

import { useState, useEffect } from "react";
import { getAdminRequests, deleteAdminRequest, toggleRequestStatus } from "@/lib/actions/admin-requests";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);

  const fetchRequests = () => {
    getAdminRequests().then((res) => {
      if (res.success && res.requests) setRequests(res.requests);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const confirmDelete = async () => {
    if (!requestToDelete) return;
    
    const res = await deleteAdminRequest(requestToDelete);
    
    if (res.success) {
      fetchRequests();
    } else {
      alert(res.error);
    }
    
    setIsDeleteModalOpen(false);
    setRequestToDelete(null);
  };

  const handleToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "OPEN" ? "CLOSED" : "OPEN";
    const res = await toggleRequestStatus(id, newStatus as "OPEN" | "CLOSED");
    if (res.success) fetchRequests();
    else alert(res.error);
  };

  // Filter requests
  const filteredRequests = requests.filter(r => {
    const matchesText = 
      (r.title && r.title.includes(searchTerm)) ||
      (r.buyer?.fullName && r.buyer.fullName.includes(searchTerm)) ||
      (r.buyer?.companyName && r.buyer.companyName.includes(searchTerm));
      
    const reqDate = new Date(r.createdAt);
    reqDate.setHours(0, 0, 0, 0);
    
    let from = 0;
    if (fromDate) {
      const f = fromDate.toDate();
      f.setHours(0, 0, 0, 0);
      from = f.getTime();
    }

    let to = Infinity;
    if (toDate) {
      const t = toDate.toDate();
      t.setHours(23, 59, 59, 999);
      to = t.getTime();
    }
    
    const matchesDate = reqDate.getTime() >= from && reqDate.getTime() <= to;
    return matchesText && matchesDate;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">مدیریت درخواست‌های خرید</h1>
        <p className="text-sm text-gray-500">مشاهده و مدیریت تمام درخواست‌های ثبت شده</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 mb-1">جستجوی کلمه</label>
          <input
            type="text"
            placeholder="عنوان، نام خریدار یا شرکت..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">از تاریخ</label>
          <DatePicker
            value={fromDate}
            onChange={setFromDate}
            calendar={persian}
            locale={persian_fa}
            inputClass="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 text-sm text-center"
            placeholder="انتخاب تاریخ"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">تا تاریخ</label>
          <DatePicker
            value={toDate}
            onChange={setToDate}
            calendar={persian}
            locale={persian_fa}
            inputClass="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 text-sm text-center"
            placeholder="انتخاب تاریخ"
          />
        </div>
        <button 
          onClick={() => { setSearchTerm(""); setFromDate(null); setToDate(null); }}
          className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition"
        >
          پاک کردن
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">در حال بارگذاری...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">درخواستی یافت نشد.</div>
        ) : (
          <table className="w-full text-right min-w-[900px]">
            <thead className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600">
              <tr>
                <th className="px-4 py-4 font-bold">عنوان درخواست</th>
                <th className="px-4 py-4 font-bold">تاریخ و زمان ثبت</th>
                <th className="px-4 py-4 font-bold">دسته‌بندی</th>
                <th className="px-4 py-4 font-bold">خریدار</th>
                <th className="px-4 py-4 font-bold text-center">مقدار</th>
                <th className="px-4 py-4 font-bold">شهر</th>
                <th className="px-4 py-4 font-bold text-center">وضعیت</th>
                <th className="px-4 py-4 font-bold text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4">
                    <p className="font-bold text-gray-800 text-sm max-w-[200px] truncate">{req.title}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs font-semibold text-gray-700">{new Date(req.createdAt).toLocaleDateString('fa-IR')}</p>
                    <p className="text-[10px] text-gray-400" dir="ltr">{new Date(req.createdAt).toLocaleTimeString('fa-IR')}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{req.category?.name}</span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-bold text-gray-700">{req.buyer?.fullName || "بدون نام"}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[120px]">{req.buyer?.companyName || "بدون شرکت"}</p>
                  </td>
                  <td className="px-4 py-4 text-center text-sm font-bold text-gray-600">
                    {req.quantity} {req.unit}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{req.city?.name}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`text-[10px] px-2 py-1 rounded font-bold ${
                      req.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {req.status === 'OPEN' ? "فعال" : "بسته شده"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleToggle(req.id, req.status)}
                        className={`text-[10px] px-3 py-1.5 rounded-lg font-bold transition ${
                          req.status === 'OPEN' 
                            ? "bg-amber-50 text-amber-600 hover:bg-amber-100" 
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        }`}
                      >
                        {req.status === 'OPEN' ? "بستن" : "فعال کردن"}
                      </button>

                      <button
                        onClick={() => {
                          setRequestToDelete(req.id);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setRequestToDelete(null);
        }}
        title="حذف درخواست خرید"
        description="آیا مطمئن هستید که می‌خواهید این درخواست را حذف کنید؟ این عمل غیرقابل بازگشت است."
      />

    </div>
  );
}