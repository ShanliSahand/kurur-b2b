"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createRequest } from "@/lib/actions/requests";
import { getProvinces, getCities, getCategories } from "@/lib/actions/locations";
import { getUserProfile } from "@/lib/actions/panel";

export default function PostRequestPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("تن");
  const [budget, setBudget] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [description, setDescription] = useState("");

  // List State
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  
  // Location State
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // 1. Load everything on mount
  useEffect(() => {
    // Fetch Categories
    getCategories().then((cats) => {
      setCategoriesList(cats);
      if (cats.length > 0) setCategoryId(cats[0].id);
    });

    // Fetch User Profile & Locations
    getUserProfile().then((res) => {
      if (res.success && res.user) {
        const u = res.user;
        if (u.countryId) {
          getProvinces(u.countryId).then((provs) => {
            setProvinces(provs);
            if (u.provinceId) {
              setSelectedProvince(u.provinceId);
              getCities(u.provinceId).then((cts) => {
                setCities(cts);
                if (u.cityId) setSelectedCity(u.cityId);
              });
            }
          });
        }
      } else {
        setError("لطفاً ابتدا وارد شوید");
      }
      setLoading(false);
    });
  }, []);

  // 2. Update cities when province changes
  useEffect(() => {
    if (selectedProvince) {
      getCities(selectedProvince).then((data) => {
        setCities(data);
      });
    }
  }, [selectedProvince]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (title.length < 5) return setError("عنوان درخواست باید حداقل ۵ حرف باشد");
    if (!categoryId) return setError("دسته‌بندی را انتخاب کنید");
    if (!quantity) return setError("مقدار درخواست را وارد کنید");
    if (!selectedProvince || !selectedCity) return setError("استان و شهر را انتخاب کنید");

    setSaving(true);

    const res = await createRequest({
      title,
      categoryId,
      quantity,
      unit,
      budget: budget || undefined,
      deliveryTime: deliveryTime || undefined,
      description: description || undefined,
      provinceId: selectedProvince,
      cityId: selectedCity,
    });

    if (res.success) {
      router.push("/panel");
      router.refresh();
    } else {
      setError(res.error || "خطایی رخ داد");
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-muted">در حال بارگذاری...</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-8">
      <div className="mx-auto max-w-2xl px-4">
        
        <div className="bg-white rounded-3xl shadow-sm border border-border p-8">
          
          <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
            <h1 className="text-2xl font-bold text-gray-800">ثبت درخواست خرید جدید</h1>
            <Link href="/panel" className="text-sm font-bold text-blue-600 hover:underline">
              بازگشت
            </Link>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">عنوان درخواست</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً خرید ۵۰ تن میلگرد سایز ۱۶" className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">دسته‌بندی</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500 bg-white">
                  {categoriesList.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">مقدار</label>
                  <input type="text" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="مثلاً 50" className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">واحد</label>
                  <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500 bg-white">
                    <option value="تن">تن</option>
                    <option value="کیلوگرم">کیلوگرم</option>
                    <option value="عدد">عدد</option>
                    <option value="متر">متر</option>
                    <option value="لیتر">لیتر</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">بودجه تقریبی (اختیاری)</label>
                <input type="text" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="مثلاً تا ۴۵ میلیون تومان" className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">زمان تحویل (اختیاری)</label>
                <input type="text" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} placeholder="مثلاً فوری یا ۲ هفته" className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">توضیحات فنی (اختیاری)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="جزئیات بیشتر درباره نیاز خود بنویسید..." rows={3} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500 resize-none"></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-gray-200 pt-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">استان تحویل</label>
                <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500 bg-white">
                  <option value="">انتخاب استان...</option>
                  {provinces.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">شهر تحویل</label>
                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedProvince} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500 bg-white disabled:opacity-50">
                  <option value="">انتخاب شهر...</option>
                  {cities.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 mt-4 shadow-lg shadow-emerald-500/20">
              {saving ? "در حال ثبت..." : "ثبت درخواست"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}