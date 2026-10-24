"use client";

import { useState, useEffect } from "react";
import { getAdminPlans, updatePlanPrice } from "@/lib/actions/admin-plans";

const PLAN_NAMES: Record<string, string> = {
  SILVER: "نقره‌ای",
  GOLD: "طلایی",
  PLATINUM: "پلاتینیوم"
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const fetchPlans = () => {
    getAdminPlans().then((res) => {
      if (res.success && res.plans) setPlans(res.plans);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const startEditing = (plan: any) => {
    setEditingId(plan.id);
    setEditPrice(plan.monthlyPrice.toString());
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditPrice("");
  };

  const handleSave = async (id: string) => {
    const priceNum = parseInt(editPrice.replace(/,/g, ''), 10);
    
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("لطفاً یک قیمت معتبر وارد کنید");
      return;
    }

    setSaving(true);
    const res = await updatePlanPrice(id, priceNum);
    
    if (res.success) {
      setEditingId(null);
      fetchPlans();
    } else {
      alert(res.error);
    }
    setSaving(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">مدیریت پلن‌های اشتراک</h1>
        <p className="text-sm text-gray-500">
          قیمت ماهانه هر پلن را تعیین کنید. تغییرات بلافاصله در صفحه اشتراک کاربران اعمال می‌شود.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">در حال بارگذاری...</div>
        ) : (
          <table className="w-full text-right">
            <thead className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600">
              <tr>
                <th className="px-6 py-4 font-bold">نوع پلن</th>
                <th className="px-6 py-4 font-bold">قیمت ماهانه (تومان)</th>
                <th className="px-6 py-4 font-bold text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-6 font-bold text-gray-800 text-lg">
                    {PLAN_NAMES[plan.type] || plan.type}
                  </td>
                  
                  <td className="px-6 py-6">
                    {editingId === plan.id ? (
                      <input
                        type="text"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-full max-w-[200px] px-4 py-2 border border-blue-500 rounded-lg focus:outline-none text-left font-bold text-blue-600"
                        dir="ltr"
                        autoFocus
                      />
                    ) : (
                      <span className="font-bold text-gray-700" dir="ltr">
                        {plan.monthlyPrice.toLocaleString("fa-IR")}
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-6 text-center">
                    {editingId === plan.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleSave(plan.id)}
                          disabled={saving}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition"
                        >
                          {saving ? "..." : "ذخیره"}
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={saving}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1.5 rounded-lg text-xs font-bold transition"
                        >
                          انصراف
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(plan)}
                        className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-lg text-xs font-bold transition"
                      >
                        ویرایش قیمت
                      </button>
                    )}
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