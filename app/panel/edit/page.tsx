"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserProfile } from "@/lib/actions/panel";
import { updateProfile } from "@/lib/actions/auth";
import { getProvinces, getCities } from "@/lib/actions/locations";

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // We start with empty strings for messages to prevent caching
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [fixNumber, setFixNumber] = useState("");
  const [address, setAddress] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [wechat, setWechat] = useState("");
  const [telegram, setTelegram] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  // Location State
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [countryId, setCountryId] = useState("");

  // 1. Clear messages immediately on mount (prevents the old success message from showing)
  useEffect(() => {
    setSuccess("");
    setError("");
  }, []);

  // 2. Fetch current profile data
  useEffect(() => {
    getUserProfile().then((res) => {
      if (res.success && res.user) {
        const u = res.user;
        setFullName(u.fullName || "");
        setCompanyName(u.companyName || "");
        setEmail(u.email || "");
        setFixNumber(u.fixNumber || "");
        setAddress(u.address || "");
        setWhatsapp(u.whatsapp || "");
        setWechat(u.wechat || "");
        setTelegram(u.telegram || "");
        setPhotoUrl(u.photoUrl || "");
        
        if (u.countryId) {
          setCountryId(u.countryId);
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
        setError("خطا در دریافت اطلاعات");
      }
      setLoading(false);
    });
  }, []);

  // 3. Update cities when province changes
  useEffect(() => {
    if (selectedProvince) {
      getCities(selectedProvince).then((data) => {
        setCities(data);
        if (!loading) setSelectedCity(""); 
      });
    }
  }, [selectedProvince]);

  // 4. Handle Photo Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setPhotoUrl(data.url);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  // 5. Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (fullName.trim().length < 3) return setError("نام و نام خانوادگی باید حداقل ۳ حرف باشد");
    if (!selectedProvince || !selectedCity) return setError("لطفاً استان و شهر خود را انتخاب کنید");

    setSaving(true);

    const res = await updateProfile({
      fullName,
      companyName: companyName || undefined,
      email: email || undefined,
      fixNumber: fixNumber || undefined,
      address: address || undefined,
      whatsapp: whatsapp || undefined,
      wechat: wechat || undefined,
      telegram: telegram || undefined,
      photoUrl: photoUrl || undefined,
      countryId: countryId,
      provinceId: selectedProvince,
      cityId: selectedCity,
    });

    if (res.success) {
      setSuccess("اطلاعات با موفقیت ذخیره شد.");
      // Optional: router.refresh() to update any header info if needed
      router.refresh(); 
    } else {
      setError(res.error || "خطایی رخ داد");
    }
    setSaving(false);
  };

  if (loading) return <div className="text-center py-20 text-muted">در حال بارگذاری اطلاعات...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-8">
      <div className="mx-auto max-w-3xl px-4">
        
        <div className="bg-white rounded-3xl shadow-sm border border-border p-8">
          
          <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
            <h1 className="text-2xl font-bold text-gray-800">ویرایش اطلاعات کاربری</h1>
            <Link href="/panel" className="text-sm font-bold text-blue-600 hover:underline">
              بازگشت به پنل
            </Link>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center">{error}</div>}
          {success && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg mb-6 text-center">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Photo Upload */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full border border-border bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="px-5 py-2.5 border border-border rounded-xl text-sm font-bold hover:bg-gray-50 transition">
                {uploading ? "در حال آپلود..." : "تغییر عکس پروفایل"}
              </button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">نام و نام خانوادگی</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">نام شرکت</label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ایمیل</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">تلفن ثابت</label>
                <input type="tel" value={fixNumber} onChange={(e) => setFixNumber(e.target.value)} dir="ltr" className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">آدرس دقیق پستی</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500" />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">استان</label>
                <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500 bg-white">
                  <option value="">انتخاب استان...</option>
                  {provinces.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">شهر</label>
                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedProvince} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500 bg-white disabled:opacity-50">
                  <option value="">انتخاب شهر...</option>
                  {cities.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* Socials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">واتساپ</label>
                <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} dir="ltr" className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">تلگرام</label>
                <input type="text" value={telegram} onChange={(e) => setTelegram(e.target.value)} dir="ltr" className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">وی‌چت</label>
                <input type="text" value={wechat} onChange={(e) => setWechat(e.target.value)} dir="ltr" className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <button type="submit" disabled={saving || uploading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 mt-4">
              {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}