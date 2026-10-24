"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getProvinces, getCities, getCategories } from "@/lib/actions/locations";
import { getProductById, updateProduct } from "@/lib/actions/products";

function EditAdContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [dataSheetUrl, setDataSheetUrl] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);

  // List State
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  
  // Location State
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    if (!id) return;
    
    setSaving(false);

    const loadData = async () => {
      try {
        // Load Categories
        const cats = await getCategories();
        setCategoriesList(cats);

        // Load Product Data
        const res = await getProductById(id);
        if (res.success && res.product) {
          const p = res.product;
          setTitle(p.title);
          setCategoryId(p.categoryId);
          setPrice(p.price || "");
          setMinOrder(p.minOrder || "");
          setDataSheetUrl(p.dataSheetUrl || "");
          setDescription(p.description || "");
          setImages(p.images || []);
          
          // Load Provinces & Cities
          if (p.countryId) {
            const provs = await getProvinces(p.countryId);
            setProvinces(provs);
            
            const cts = await getCities(p.provinceId);
            setCities(cts);
          }
          
          setSelectedProvince(p.provinceId);
          setSelectedCity(p.cityId);
        } else {
          setError("آگهی یافت نشد");
        }
      } catch (err) {
        setError("خطا در بارگذاری اطلاعات");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleProvinceChange = async (provinceId: string) => {
    setSelectedProvince(provinceId);
    setSelectedCity(""); 
    const cts = await getCities(provinceId);
    setCities(cts);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "pdf") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      
      if (data.url) {
        if (type === "image") {
          setImages([...images, data.url]);
        } else {
          setDataSheetUrl(data.url);
        }
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    setImages(images.filter(img => img !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (title.length < 5) return setError("عنوان آگهی باید حداقل ۵ حرف باشد");
    
    setSaving(true);

    const res = await updateProduct(id, {
      title,
      categoryId,
      price: price || undefined,
      minOrder: minOrder || undefined,
      dataSheetUrl: dataSheetUrl || undefined,
      description: description || undefined,
      provinceId: selectedProvince,
      cityId: selectedCity,
      images,
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
            <h1 className="text-2xl font-bold text-gray-800">ویرایش آگهی فروش</h1>
            <Link href="/panel" className="text-sm font-bold text-red-500 hover:underline">
              بازگشت
            </Link>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">عنوان آگهی</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-red-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">دسته‌بندی</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-red-500 bg-white">
                  {categoriesList.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">قیمت (اختیاری)</label>
                <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-red-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">حداقل سفارش (اختیاری)</label>
              <input type="text" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-red-500" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">توضیحات (اختیاری)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-red-500 resize-none"></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Images */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">تصاویر محصول (اختیاری)</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {images.map((imgUrl, index) => (
                    <div key={index} className="relative w-20 h-20 rounded-lg border border-border overflow-hidden">
                      <img src={imgUrl} alt="Product" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(imgUrl)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✖</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-red-400 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span className="text-[10px] mt-1">{uploading ? "..." : "افزودن"}</span>
                  </button>
                </div>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => handleFileUpload(e, "image")} />
              </div>

              {/* Data Sheet */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">کاتالوگ / دیتاشیت (اختیاری)</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => pdfInputRef.current?.click()} disabled={uploading} className="px-4 py-2 border border-border rounded-xl text-sm font-bold hover:bg-gray-50 transition">
                    {uploading ? "در حال آپلود..." : "انتخاب فایل"}
                  </button>
                  {dataSheetUrl && (
                    <span className="text-sm text-emerald-600 font-bold flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      فایل ثبت شد
                    </span>
                  )}
                </div>
                <input type="file" accept=".pdf,image/*" className="hidden" ref={pdfInputRef} onChange={(e) => handleFileUpload(e, "pdf")} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-gray-200 pt-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">استان</label>
                <select value={selectedProvince} onChange={(e) => handleProvinceChange(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-red-500 bg-white">
                  <option value="">انتخاب استان...</option>
                  {provinces.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">شهر</label>
                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedProvince} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-red-500 bg-white disabled:opacity-50">
                  <option value="">انتخاب شهر...</option>
                  {cities.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" disabled={saving || uploading} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 mt-4 shadow-lg shadow-red-500/20">
              {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EditAdPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted">در حال بارگذاری...</div>}>
      <EditAdContent />
    </Suspense>
  );
}