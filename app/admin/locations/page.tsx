"use client";

import { useState, useEffect } from "react";
import { 
  getAdminLocations, 
  addCountry, updateCountry, deleteCountry,
  addProvince, updateProvince, deleteProvince,
  addCity, updateCity, deleteCity 
} from "@/lib/actions/admin-locations";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";

export default function AdminLocationsPage() {
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection State
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedProvince, setSelectedProvince] = useState<any>(null);

  // Form States (Create)
  const [newCountryName, setNewCountryName] = useState("");
  const [newProvinceName, setNewProvinceName] = useState("");
  const [newCityName, setNewCityName] = useState("");

  // Edit States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "country" | "province" | "city", id: string } | null>(null);

  const fetchLocations = () => {
    getAdminLocations().then((res) => {
      if (res.success && res.countries) {
        setCountries(res.countries);
        
        if (res.countries.length > 0) {
          if (!selectedCountry) {
            setSelectedCountry(res.countries[0]);
          } else {
            const updatedCountry = res.countries.find((c: any) => c.id === selectedCountry.id);
            if (updatedCountry) {
              setSelectedCountry(updatedCountry);
              if (selectedProvince) {
                const updatedProv = updatedCountry.provinces.find((p: any) => p.id === selectedProvince.id);
                setSelectedProvince(updatedProv || null);
              }
            }
          }
        }
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = countries.find(c => c.id === e.target.value);
    setSelectedCountry(country);
    setSelectedProvince(null);
    setEditingId(null);
  };

  const handleAddCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountryName.trim()) return;
    const res = await addCountry(newCountryName);
    if (res.success) { setNewCountryName(""); fetchLocations(); }
    else alert(res.error);
  };

  const handleAddProvince = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvinceName.trim() || !selectedCountry) return;
    const res = await addProvince(selectedCountry.id, newProvinceName);
    if (res.success) { setNewProvinceName(""); fetchLocations(); }
    else alert(res.error);
  };

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim() || !selectedProvince) return;
    const res = await addCity(selectedProvince.id, newCityName);
    if (res.success) { setNewCityName(""); fetchLocations(); }
    else alert(res.error);
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleSaveEdit = async (type: "country" | "province" | "city") => {
    if (!editName.trim()) return;
    
    let res;
    if (type === "country") res = await updateCountry(editingId!, editName);
    else if (type === "province") res = await updateProvince(editingId!, editName);
    else res = await updateCity(editingId!, editName);

    if (res.success) {
      setEditingId(null);
      fetchLocations();
    } else {
      alert(res.error);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    let res;
    if (deleteTarget.type === "country") res = await deleteCountry(deleteTarget.id);
    else if (deleteTarget.type === "province") res = await deleteProvince(deleteTarget.id);
    else res = await deleteCity(deleteTarget.id);

    if (res.success) {
      fetchLocations();
      if (deleteTarget.type === "country") setSelectedCountry(null);
      if (deleteTarget.type === "province") setSelectedProvince(null);
    } else {
      alert(res.error);
    }
    
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">در حال بارگذاری...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">مدیریت موقعیت‌های جغرافیایی</h1>
        <p className="text-sm text-gray-500">مدیریت کامل کشورها، استان‌ها و شهرها</p>
      </div>

      {/* Country Selector & Add/Edit Form */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4">
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-sm font-bold text-gray-600">کشور فعال:</span>
          <select
            value={selectedCountry?.id || ""}
            onChange={handleCountryChange}
            className="flex-1 md:w-48 px-4 py-2 rounded-lg bg-gray-50 text-sm font-bold text-gray-800 focus:outline-none border border-gray-200"
          >
            {countries.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          
          {/* Edit Country Button */}
          {selectedCountry && (
            <button
              onClick={() => startEdit(selectedCountry.id, selectedCountry.name)}
              className="p-2 text-blue-500 hover:text-blue-700 bg-blue-50 rounded-lg transition"
              title="ویرایش نام کشور"
            >
              ✎
            </button>
          )}
        </div>
        
        <div className="w-px h-8 bg-gray-200 hidden md:block"></div>

        {/* Add / Edit Input */}
        {editingId === selectedCountry?.id ? (
          <div className="flex-1 flex gap-2 w-full">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-blue-400 text-sm focus:outline-none"
              autoFocus
            />
            <button onClick={() => handleSaveEdit("country")} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition">ذخیره</button>
            <button onClick={() => setEditingId(null)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-300 transition">لغو</button>
          </div>
        ) : (
          <form onSubmit={handleAddCountry} className="flex-1 flex gap-2 w-full">
            <input
              type="text"
              value={newCountryName}
              onChange={(e) => setNewCountryName(e.target.value)}
              placeholder="نام کشور جدید..."
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition">
              افزودن کشور
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Provinces */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-800 mb-3">استان‌های {selectedCountry?.name}</h2>
            <form onSubmit={handleAddProvince} className="flex gap-2">
              <input
                type="text"
                value={newProvinceName}
                onChange={(e) => setNewProvinceName(e.target.value)}
                placeholder="نام استان جدید..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
              />
              <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition">
                افزودن
              </button>
            </form>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {selectedCountry?.provinces.length === 0 ? (
              <div className="text-center text-gray-400 py-8 text-sm">استانی ثبت نشده است.</div>
            ) : (
              selectedCountry?.provinces.map((prov: any) => (
                <div 
                  key={prov.id}
                  onClick={() => { setSelectedProvince(prov); setEditingId(null); }}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition ${
                    selectedProvince?.id === prov.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  {editingId === prov.id ? (
                    <div className="flex items-center gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="text" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-2 py-1 border border-blue-400 rounded text-sm"
                        autoFocus
                      />
                      <button onClick={() => handleSaveEdit("province")} className="text-emerald-600 text-xs font-bold">ذخیره</button>
                      <button onClick={() => setEditingId(null)} className="text-gray-400 text-xs">لغو</button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-semibold text-gray-700">{prov.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{prov._count.cities} شهر</span>
                        <button onClick={(e) => { e.stopPropagation(); startEdit(prov.id, prov.name); }} className="text-blue-400 hover:text-blue-600 text-xs px-1">✎</button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: "province", id: prov.id }); setIsDeleteModalOpen(true); }} className="text-red-400 hover:text-red-600 text-xs px-1">✖</button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2 & 3: Cities */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
          {selectedProvince ? (
            <>
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-bold text-gray-800 mb-3">شهرهای استان {selectedProvince.name}</h2>
                <form onSubmit={handleAddCity} className="flex gap-2">
                  <input
                    type="text"
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    placeholder="نام شهر جدید..."
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
                  />
                  <button type="submit" className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition">
                    افزودن
                  </button>
                </form>
              </div>
              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 gap-2 content-start">
                {selectedProvince.cities.map((city: any) => (
                  <div key={city.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    {editingId === city.id ? (
                      <div className="flex items-center gap-1 w-full">
                        <input 
                          type="text" 
                          value={editName} 
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 w-full px-1 py-0.5 border border-blue-400 rounded text-sm"
                          autoFocus
                        />
                        <button onClick={() => handleSaveEdit("city")} className="text-emerald-600 text-[10px] font-bold">ذخیره</button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm text-gray-700">{city.name}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => startEdit(city.id, city.name)} className="text-blue-400 hover:text-blue-600 text-xs">✎</button>
                          <button onClick={() => { setDeleteTarget({ type: "city", id: city.id }); setIsDeleteModalOpen(true); }} className="text-red-400 hover:text-red-600 text-xs">✖</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {selectedProvince.cities.length === 0 && (
                  <div className="col-span-3 text-center text-gray-400 py-8">شهری برای این استان ثبت نشده است.</div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4 opacity-50"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <p>برای مدیریت شهرها، یک استان را از سمت راست انتخاب کنید.</p>
            </div>
          )}
        </div>

      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        title={
          deleteTarget?.type === "country" ? "حذف کشور" : 
          deleteTarget?.type === "province" ? "حذف استان" : "حذف شهر"
        }
        description="آیا مطمئن هستید؟ اگر این موقعیت دارای کاربر یا زیرمجموعه باشد، حذف نخواهد شد."
      />

    </div>
  );
}