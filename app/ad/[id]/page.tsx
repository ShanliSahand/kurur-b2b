"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getProductById } from "@/lib/actions/products";

function ProductDetailContent() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State to track which image is currently shown in the large view
  const [mainImage, setMainImage] = useState<string>("");

  useEffect(() => {
    if (id) {
      getProductById(id).then((res) => {
        if (res.success && res.product) {
          setData(res);
          // Set the first image as the default main image
          if (res.product.images && res.product.images.length > 0) {
            setMainImage(res.product.images[0]);
          }
        }
        setLoading(false);
      });    }
  }, [id]);

  if (loading) return <div className="text-center py-20 text-muted">در حال بارگذاری...</div>;
  if (!data || !data.product) return <div className="text-center py-20 text-red-500">آگهی یافت نشد.</div>;

  const { product } = data;
  const seller = product.seller;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-8">
      <div className="mx-auto max-w-5xl px-4">
        
        <Link href="/search?tab=ads" className="inline-block mb-6 text-sm text-muted hover:text-red-500 transition flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          بازگشت به لیست آگهی‌ها
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
          
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Images Section */}
            <div className="p-6 md:p-8 bg-gray-50 flex flex-col gap-4">
              
              {/* Main Image */}
              {mainImage ? (
                <div className="w-full aspect-square rounded-2xl overflow-hidden border border-border bg-white">
                  <img src={mainImage} alt={product.title} className="w-full h-full object-cover transition-opacity duration-300" />
                </div>
              ) : (
                <div className="w-full aspect-square rounded-2xl border border-border bg-white flex items-center justify-center text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </div>
              )}
              
              {/* Thumbnails (Clickable) */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {product.images.map((img: string, idx: number) => (
                    <button 
                      key={idx} 
                      onClick={() => setMainImage(img)}
                      className={`w-20 h-20 rounded-lg border-2 overflow-hidden shrink-0 transition ${
                        mainImage === img ? "border-red-500" : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="p-6 md:p-8 flex flex-col">
              
              <div className="mb-6">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 mb-3">
                  {product.category?.name}
                </span>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{product.title}</h1>
                <p className="text-sm text-muted flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  {product.city?.name}، {product.province?.name}
                </p>
              </div>

              <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                {product.price && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted text-sm">قیمت:</span>
                    <span className="font-bold text-red-600">{product.price}</span>
                  </div>
                )}
                {product.minOrder && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted text-sm">حداقل سفارش:</span>
                    <span className="font-bold text-foreground">{product.minOrder}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-muted text-sm">تاریخ ثبت:</span>
                  <span className="font-bold text-foreground">{new Date(product.createdAt).toLocaleDateString('fa-IR')}</span>
                </div>
              </div>

              {product.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-foreground mb-2">توضیحات:</h3>
                  <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">{product.description}</p>
                </div>
              )}

              {product.dataSheetUrl && (
                <a href={product.dataSheetUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 font-bold hover:underline mb-6 bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  دانلود کاتالوگ / دیتاشیت
                </a>
              )}

              <div className="mt-auto pt-6 border-t border-border">
                <h3 className="text-sm font-bold text-foreground mb-3">اطلاعات فروشنده</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden border border-border">
                    {seller.photoUrl ? (
                      <img src={seller.photoUrl} alt={seller.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="m-auto mt-3 text-gray-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{seller.companyName || seller.fullName}</p>
                    {seller.companyName && (
                      <p className="text-xs text-muted mt-0.5">{seller.fullName}</p>
                    )}
                    <p className="text-xs text-muted mt-1">{seller.province?.name}، {seller.city?.name}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a href={`tel:${seller.phone}`} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    تماس تلفنی
                  </a>
                  {seller.whatsapp && (
                    <a href={`https://wa.me/${seller.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2">
                      <img src="/whatsapplogo.png" alt="WA" className="w-4 h-4" />
                      واتساپ
                    </a>
                  )}
                  {seller.telegram && (
                    <a href={`https://t.me/${seller.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2">
                      <img src="/Telegramlogo.png" alt="TG" className="w-4 h-4" />
                      تلگرام
                    </a>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted">در حال بارگذاری...</div>}>
      <ProductDetailContent />
    </Suspense>
  );
}