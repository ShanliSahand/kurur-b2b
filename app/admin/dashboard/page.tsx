"use client";

import { useEffect, useState } from "react";
import { getAdminStats } from "@/lib/actions/admin-stats";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats().then((res) => {
      if (res.success) setData(res.stats);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">در حال بارگذاری آمار...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">خطا در دریافت اطلاعات</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">داشبورد مدیریت</h1>
        <span className="text-sm text-gray-500">آخرین بروزرسانی: همین الان</span>
      </div>

      {/* Top Row: 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Users */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
          <span className="text-sm font-bold text-blue-600">کل کاربران</span>
          <div className="flex items-end justify-between mt-3">
            <span className="text-2xl font-bold text-gray-900">{data.users.total}</span>
          </div>
          <span className="text-[10px] text-gray-400 mt-2">
            ({data.users.buyers} خریدار / {data.users.sellers} فروشنده / {data.users.both} هر دو)
          </span>
        </div>

        {/* 2. Active Subscriptions */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
          <span className="text-sm font-bold text-blue-600">اشتراک‌های فعال</span>
          <div className="flex flex-col gap-1 mt-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">نقره‌ای:</span>
              <span className="font-bold">{data.subscriptions.silver}</span>
            </div>
            <div className="flex justify-between items-center text-amber-600">
              <span>طلایی:</span>
              <span className="font-bold">{data.subscriptions.gold}</span>
            </div>
            <div className="flex justify-between items-center text-gray-900">
              <span>پلاتینیوم:</span>
              <span className="font-bold">{data.subscriptions.platinum}</span>
            </div>
          </div>
        </div>

        {/* 3. Requests */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
          <span className="text-sm font-bold text-blue-600">درخواست‌های خرید</span>
          <div className="flex items-end justify-between mt-3">
            <span className="text-2xl font-bold text-gray-900">{data.requests.total}</span>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
              {data.requests.active} فعال
            </span>
          </div>
        </div>

        {/* 4. Ads */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
          <span className="text-sm font-bold text-blue-600">آگهی‌های فروش</span>
          <div className="flex items-end justify-between mt-3">
            <span className="text-2xl font-bold text-gray-900">{data.products.total}</span>
            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
              {data.products.active} فعال
            </span>
          </div>
        </div>

      </div>

      {/* Bottom Row: 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Users */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 col-span-1">
          <h2 className="text-lg font-bold text-blue-600 mb-4">آخرین کاربران</h2>
          <div className="space-y-3">
            {data.recentUsers.length === 0 ? (
              <p className="text-sm text-gray-400">کاربری یافت نشد.</p>
            ) : (
              data.recentUsers.map((u: any) => (
                <div key={u.id} className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{u.fullName || "بدون نام"}</p>
                    <p className="text-xs text-gray-500" dir="ltr">{u.phone}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded font-bold ${
                    u.role === 'BUYER' ? 'bg-emerald-100 text-emerald-700' : 
                    u.role === 'SELLER' ? 'bg-red-100 text-red-700' : 
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {u.role === 'BUYER' ? "خریدار" : u.role === 'SELLER' ? "فروشنده" : "هر دو"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 col-span-1">
          <h2 className="text-lg font-bold text-blue-600 mb-4">جدیدترین درخواست‌های خرید</h2>
          <div className="space-y-3">
            {data.recentRequests.length === 0 ? (
              <p className="text-sm text-gray-400">درخواستی یافت نشد.</p>
            ) : (
              data.recentRequests.map((r: any) => (
                <div key={r.id} className="border-b border-gray-50 pb-2">
                  <p className="text-sm font-bold text-gray-800 truncate">{r.title}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-600 font-semibold">
                      {r.buyer.companyName || r.buyer.fullName}
                    </span>
                    <span className="text-[10px] text-gray-400">{r.city?.name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Ads */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 col-span-1">
          <h2 className="text-lg font-bold text-blue-600 mb-4">جدیدترین آگهی‌های فروش</h2>
          <div className="space-y-3">
            {data.recentProducts.length === 0 ? (
              <p className="text-sm text-gray-400">آگهی یافت نشد.</p>
            ) : (
              data.recentProducts.map((p: any) => (
                <div key={p.id} className="border-b border-gray-50 pb-2">
                  <p className="text-sm font-bold text-gray-800 truncate">{p.title}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-600 font-semibold">
                      {p.seller.companyName || p.seller.fullName}
                    </span>
                    <span className="text-[10px] text-gray-400">{p.city?.name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}