"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { completeRegistration } from "@/lib/actions/auth";
import { getCountries, getProvinces, getCities } from "@/lib/actions/locations";

export default function RegisterPage() {
  const router = useRouter();
  
  // Basic Info
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"BUYER" | "SELLER" | "BOTH">("BUYER");

  // Contact Info
  const [fixNumber, setFixNumber] = useState("");
  const [address, setAddress] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [wechat, setWechat] = useState("");
  const [telegram, setTelegram] = useState("");
  
  // Photo Upload State
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Location State
  const [countries, setCountries] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch initial countries
  useEffect(() => {
    getCountries().then((data) => {
      setCountries(data);
      if (data.length > 0) {
        const iran = data.find((c: any) => c.name === "ایران");
        setSelectedCountry(iran ? iran.id : data[0].id);
      }
    });
  }, []);

  // Fetch provinces when country changes
  useEffect(() => {
    if (selectedCountry) {
      getProvinces(selectedCountry).then((data) => {
        setProvinces(data);
        setSelectedProvince("");
        setCities([]);
        setSelectedCity("");
      });
    }
  }, [selectedCountry]);

  // Fetch cities when province changes
  useEffect(() => {
    if (selectedProvince) {
      getCities(selectedProvince).then((data) => {
        setCities(data);
        setSelectedCity("");
      });
    }
  }, [selectedProvince]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (fullName.trim().length < 3) return setError("نام و نام خانوادگی باید حداقل ۳ حرف باشد");
    if ((role === "SELLER" || role === "BOTH") && companyName.trim().length < 3) {
      return setError("نام شرکت برای فروشندگان و کسانی که هر دو نقش را دارند الزامی است");
    }
    if (!selectedProvince || !selectedCity) return setError("لطفاً استان و شهر خود را انتخاب کنید");

    setLoading(true);

    const res = await completeRegistration({
      fullName,
      companyName: companyName || undefined,
      role,
      email: email || undefined,
      countryId: selectedCountry,
      provinceId: selectedProvince,
      cityId: selectedCity,
      fixNumber: fixNumber || undefined,
      address: address || undefined,
      whatsapp: whatsapp || undefined,
      wechat: wechat || undefined,
      telegram: telegram || undefined,
      photoUrl: photoUrl || undefined,
    });

    if (res.success) {
      router.push("/panel");
      router.refresh();
    } else {
      setError(res.error || "خطایی رخ داد");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-border p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">تکمیل ثبت‌نام</h1>
          <p className="text-sm text-muted">لطفاً اطلاعات خود را تکمیل کنید تا حساب شما فعال شود.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">نقش شما در پلتفرم</label>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setRole("BUYER")} className={`py-2.5 rounded-xl border text-sm font-bold transition ${role === "BUYER" ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-border text-muted hover:bg-gray-50"}`}>خریدار</button>
              <button type="button" onClick={() => setRole("SELLER")} className={`py-2.5 rounded-xl border text-sm font-bold transition ${role === "SELLER" ? "bg-red-50 border-red-500 text-red-700" : "bg-white border-border text-muted hover:bg-gray-50"}`}>فروشنده</button>
              <button type="button" onClick={() => setRole("BOTH")} className={`py-2.5 rounded-xl border text-sm font-bold transition ${role === "BOTH" ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-white border-border text-muted hover:bg-gray-50"}`}>هر دو</button>
            </div>
          </div>

          {/* Profile Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">عکس پروفایل (اختیاری)</label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full border border-border bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-gray-50 transition"
              >
                {uploading ? "در حال آپلود..." : "انتخاب عکس از دستگاه"}
              </button>
            </div>
          </div>

          {/* Full Name & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">نام و نام خانوادگی</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="مثلاً علی رضایی" className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                 نام شرکت {role === "BUYER" && <span className="text-muted text-xs font-normal">(اختیاری)</span>}
              </label>
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="مثلاً شرکت فولاد ایران" className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          {/* Email & Fixed Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">ایمیل (اختیاری)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="info@example.com" className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">تلفن ثابت (اختیاری)</label>
              <input type="tel" value={fixNumber} onChange={(e) => setFixNumber(e.target.value)} placeholder="مثلاً 02133445566" className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500" dir="ltr" />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">آدرس (اختیاری)</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="آدرس دقیق پستی" className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500" />
          </div>

          {/* Location: Province, City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">استان</label>
              <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500 bg-white">
                <option value="">انتخاب استان...</option>
                {provinces.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">شهر</label>
              <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedProvince} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500 bg-white disabled:opacity-50">
                <option value="">انتخاب شهر...</option>
                {cities.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Social IDs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">واتساپ (اختیاری)</label>
              <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="شماره واتساپ" className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">تلگرام (اختیاری)</label>
              <input type="text" value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="@username" className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">وی‌چت (اختیاری)</label>
              <input type="text" value={wechat} onChange={(e) => setWechat(e.target.value)} placeholder="WeChat ID" className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500" dir="ltr" />
            </div>
          </div>

          <button type="submit" disabled={loading || uploading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 mt-6">
            {loading ? "در حال ذخیره..." : "ذخیره و ورود به پنل"}
          </button>
        </form>
      </div>
    </div>
  );
}