"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getProvinces, getCities, getCategories } from "@/lib/actions/locations";
import { getRequestById, updateRequest } from "@/lib/actions/requests";

function EditRequestContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  // We use this ref to know if the page is loading for the first time
  const isFirstLoad = useRef(true);

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

  // 1. Initial Load
  useEffect(() => {
    if (!id) return;
    
    setSaving(false);

    const loadData = async () => {
      try {
        // Load Categories
        const cats = await getCategories();
        setCategoriesList(cats);

        // Load Request Data
        const res = await getRequestById(id);
        if (res.success && res.request) {
          const r = res.request;
          setTitle(r.title);
          setCategoryId(r.categoryId);
          setQuantity(r.quantity);
          setUnit(r.unit || "تن");
          setBudget(r.budget || "");
          setDeliveryTime(r.deliveryTime || "");
          setDescription(r.description || "");
          
          // Load Provinces & Cities BEFORE setting selected province/city
          if (r.countryId) {
            const provs = await getProvinces(r.countryId);
            setProvinces(provs);
            
            const cts = await getCities(r.provinceId);
            setCities(cts);
          }
          
          // Set location state
          setSelectedProvince(r.provinceId);
          setSelectedCity(r.cityId);
        } else {
          setError("درخواست یافت نشد");
        }
      } catch (err) {
        setError("خطا در بارگذاری اطلاعات");
      } finally {
        setLoading(false);
        // Mark first load as done
        isFirstLoad.current = false;
      }
    };

    loadData();
  }, [id]);

  // 2. Handle Province Change (Only when user interacts)
  const handleProvinceChange = async (provinceId: string) => {
    setSelectedProvince(provinceId);
    setSelectedCity(""); // Clear city when province changes
    const cts = await getCities(provinceId);
    setCities(cts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (title.length < 5) return setError("عنوان درخواست باید حداقل ۵ حرف باشد");
    
    setSaving(true);

    const res = await updateRequest(id, {
      title,
      categoryId,
      quantity,
      unit,
      budget,
      deliveryTime,
      description,
      provinceId: selectedProvince,
      cityId: selectedCity,
    });

    if (res.success) {
      router.push("/panel");
      router.refresh();
    } else {
      setError(res.error || "خطا در ذخیره تغییرات");
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-muted">در حال بارگذاری...</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-8">
      <div className="mx-auto max-w-2xl px-4">
        
        <div className="bg-white rounded-3xl shadow-sm border border-border p-8">
          
          <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
            <h1 className="text-2xl font-bold text-gray-800">ویرایش درخواست خرید</h1>
            <Link href="/panel" className="text-sm font-bold text-blue-600 hover:underline">
              بازگشت
            </Link>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">عنوان درخواست</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500" />
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
                  <input type="text" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500" />
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
                <input type="text" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">زمان تحویل (اختیاری)</label>
                <input type="text" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">توضیحات فنی (اختیاری)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500 resize-none"></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-gray-200 pt-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">استان تحویل</label>
                {/* Changed onChange to handleProvinceChange */}
                <select value={selectedProvince} onChange={(e) => handleProvinceChange(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500 bg-white">
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

            <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 mt-4">
              {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EditRequestPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted">در حال بارگذاری...</div>}>
      <EditRequestContent />
    </Suspense>
  );
}