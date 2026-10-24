"use client";

import { useState, useEffect } from "react";
import { getAdminTransactions } from "@/lib/actions/admin-transactions";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const PLAN_NAMES: Record<string, string> = {
  SILVER: "نقره‌ای",
  GOLD: "طلایی",
  PLATINUM: "پلاتینیوم"
};

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);

  useEffect(() => {
    getAdminTransactions().then((res) => {
      if (res.success && res.transactions) setTransactions(res.transactions);
      setLoading(false);
    });
  }, []);

  const filteredTransactions = transactions.filter(t => {
    const matchesText = 
      (t.user?.fullName && t.user.fullName.includes(searchTerm)) ||
      (t.user?.companyName && t.user.companyName.includes(searchTerm)) ||
      (t.user?.phone && t.user.phone.includes(searchTerm)) ||
      (t.referenceId && t.referenceId.includes(searchTerm));
      
    const txDate = new Date(t.createdAt);
    txDate.setHours(0, 0, 0, 0);
    
    let from = 0;
    if (fromDate) {
      const f = fromDate.toDate();
      f.setHours(0, 0, 0, 0);
      from = f.getTime();
    }

    let to = Infinity;
    if (toDate) {
      const t2 = toDate.toDate();
      t2.setHours(23, 59, 59, 999);
      to = t2.getTime();
    }
    
    const matchesDate = txDate.getTime() >= from && txDate.getTime() <= to;
    return matchesText && matchesDate;
  });

  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">تراکنش‌های مالی</h1>
        <p className="text-sm text-gray-500">تاریخچه خرید اشتراک‌ها توسط کاربران</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 mb-1">جستجو</label>
          <input
            type="text"
            placeholder="نام کاربر، شرکت، یا کد رهگیری..."
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

      {/* Revenue Summary */}
      <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex justify-between items-center">
        <span className="font-bold text-emerald-800">مجموع درآمد (در بازه انتخابی):</span>
        <span className="font-bold text-2xl text-emerald-600">{totalRevenue.toLocaleString("fa-IR")} تومان</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">در حال بارگذاری...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">تراکنشی یافت نشد.</div>
        ) : (
          <table className="w-full text-right min-w-[900px]">
            <thead className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600">
              <tr>
                <th className="px-4 py-4 font-bold">کاربر</th>
                <th className="px-4 py-4 font-bold">نوع پلن</th>
                <th className="px-4 py-4 font-bold text-center">مدت</th>
                <th className="px-4 py-4 font-bold text-center">مبلغ (تومان)</th>
                <th className="px-4 py-4 font-bold">کد رهگیری</th>
                <th className="px-4 py-4 font-bold">تاریخ و زمان</th>
                <th className="px-4 py-4 font-bold text-center">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4">
                    <p className="text-sm font-bold text-gray-800">{tx.user?.fullName || "بدون نام"}</p>
                    <p className="text-xs text-gray-500">{tx.user?.companyName || "بدون شرکت"}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs px-2 py-1 rounded font-bold ${
                      tx.planType === "SILVER" ? "bg-gray-100 text-gray-700" :
                      tx.planType === "GOLD" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-800 text-white"
                    }`}>
                      {PLAN_NAMES[tx.planType] || tx.planType}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-gray-600">{tx.months} ماه</td>
                  <td className="px-4 py-4 text-center text-sm font-bold text-emerald-600">
                    {tx.amount.toLocaleString("fa-IR")}
                  </td>
                  <td className="px-4 py-4 text-xs font-mono text-gray-500" dir="ltr">{tx.referenceId}</td>
                  <td className="px-4 py-4">
                    <p className="text-xs font-semibold text-gray-700">{new Date(tx.createdAt).toLocaleDateString('fa-IR')}</p>
                    <p className="text-[10px] text-gray-400" dir="ltr">{new Date(tx.createdAt).toLocaleTimeString('fa-IR')}</p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">
                      موفق
                    </span>
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