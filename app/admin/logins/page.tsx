"use client";

import { useState, useEffect } from "react";
import { getAdminLogins } from "@/lib/actions/admin-logins";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export default function AdminLoginsPage() {
  const [logins, setLogins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);

  useEffect(() => {
    getAdminLogins().then((res) => {
      if (res.success && res.logins) setLogins(res.logins);
      setLoading(false);
    });
  }, []);

  const filteredLogins = logins.filter(l => {
    const matchesText = 
      (l.user?.fullName && l.user.fullName.includes(searchTerm)) ||
      (l.user?.companyName && l.user.companyName.includes(searchTerm)) ||
      (l.user?.phone && l.user.phone.includes(searchTerm));
      
    const loginDate = new Date(l.loginAt);
    loginDate.setHours(0, 0, 0, 0);
    
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
    
    const matchesDate = loginDate.getTime() >= from && loginDate.getTime() <= to;
    return matchesText && matchesDate;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">تاریخچه ورود کاربران</h1>
        <p className="text-sm text-gray-500">مشاهده زمان و دستگاه‌های ورود به پلتفرم</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 mb-1">جستجو</label>
          <input
            type="text"
            placeholder="نام کاربر، شرکت، یا شماره موبایل..."
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
        ) : filteredLogins.length === 0 ? (
          <div className="p-8 text-center text-gray-500">تاریخچه‌ای یافت نشد.</div>
        ) : (
          <table className="w-full text-right min-w-[900px]">
            <thead className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600">
              <tr>
                <th className="px-4 py-4 font-bold">کاربر</th>
                <th className="px-4 py-4 font-bold">نقش</th>
                <th className="px-4 py-4 font-bold">شماره تماس</th>
                <th className="px-4 py-4 font-bold">تاریخ ورود</th>
                <th className="px-4 py-4 font-bold">ساعت ورود</th>
                <th className="px-4 py-4 font-bold">دستگاه / IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogins.map((login) => (
                <tr key={login.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4">
                    <p className="text-sm font-bold text-gray-800">{login.user?.fullName || "بدون نام"}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">{login.user?.companyName || "بدون شرکت"}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-[10px] px-2 py-1 rounded font-bold ${
                      login.user?.role === 'BUYER' ? 'bg-emerald-100 text-emerald-700' : 
                      login.user?.role === 'SELLER' ? 'bg-red-100 text-red-700' : 
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {login.user?.role === 'BUYER' ? "خریدار" : login.user?.role === 'SELLER' ? "فروشنده" : "هر دو"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-600" dir="ltr">{login.user?.phone}</td>
                  <td className="px-4 py-4 text-xs font-semibold text-gray-700">{new Date(login.loginAt).toLocaleDateString('fa-IR')}</td>
                  <td className="px-4 py-4 text-xs text-gray-600">{new Date(login.loginAt).toLocaleTimeString('fa-IR')}</td>
                  <td className="px-4 py-4 text-[10px] text-gray-400">
                    <p>{login.userAgent || "نامشخص"}</p>
                    <p dir="ltr">{login.ipAddress || "-"}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}