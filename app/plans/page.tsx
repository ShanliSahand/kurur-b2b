"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { upgradeSubscription, getPlans } from "@/lib/actions/subscriptions";
import { getCurrentUser } from "@/lib/actions/auth";
import UpgradeConfirmModal from "@/components/UpgradeConfirmModal";

const DURATIONS = [
  { months: 1, label: "۱ ماهه", discount: 0 },
  { months: 3, label: "۳ ماهه", discount: 0.1 },
  { months: 6, label: "۶ ماهه", discount: 0.15 },
  { months: 12, label: "۱۲ ماهه", discount: 0.2 },
];

const PLAN_LEVELS: Record<string, number> = {
  BASIC: 0,
  SILVER: 1,
  GOLD: 2,
  PLATINUM: 3
};

const PLAN_NAMES: Record<string, string> = {
  BASIC: "پایه",
  SILVER: "نقره‌ای",
  GOLD: "طلایی",
  PLATINUM: "پلاتینیوم"
};

export default function PlansPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(DURATIONS[0]);
  const [user, setUser] = useState<any>(null);
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<"SILVER" | "GOLD" | "PLATINUM" | null>(null);

  useEffect(() => {
    // Fetch user and plans in parallel
    Promise.all([
      getCurrentUser(),
      getPlans()
    ]).then(([u, plansRes]) => {
      setUser(u);
      if (plansRes.success && plansRes.plans) {
        setDbPlans(plansRes.plans);
      }
      setCheckingAuth(false);
    });
  }, []);

  const getRemainingDays = () => {
    if (!user?.subscriptionEnd) return 0;
    const end = new Date(user.subscriptionEnd);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 0;
  };

  const remainingDays = getRemainingDays();
  const currentLevel = user ? PLAN_LEVELS[user.subscriptionType] : 0;
  const hasActivePaidPlan = user?.subscriptionType !== "BASIC" && remainingDays > 0;

  const handlePlanClick = (plan: "SILVER" | "GOLD" | "PLATINUM") => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (hasActivePaidPlan) {
      setPendingPlan(plan);
      setIsModalOpen(true);
    } else {
      executePurchase(plan);
    }
  };

  const executePurchase = async (plan: "SILVER" | "GOLD" | "PLATINUM") => {
    setIsModalOpen(false);
    setLoading(plan);
    
    try {
      // Simulate payment delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const res = await upgradeSubscription(plan, selectedDuration.months);
      
      if (res.success) {
        alert("پرداخت با موفقیت انجام شد. اشتراک شما فعال شد.");
        router.push("/panel");
        router.refresh();
      } else {
        alert(res.error || "خطا در سیستم پرداخت");
      }
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("خطای شبکه یا سرور. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(null);
    }
  };

  // Helper to get base price from DB
  const getBasePrice = (type: "SILVER" | "GOLD" | "PLATINUM") => {
    const plan = dbPlans.find(p => p.type === type);
    return plan ? plan.monthlyPrice : 0;
  };

  const calculatePrice = (basePrice: number) => {
    const total = basePrice * selectedDuration.months;
    const discountAmount = total * selectedDuration.discount;
    return Math.round(total - discountAmount);
  };

  if (checkingAuth) return <div className="text-center py-20 text-muted">در حال بررسی وضعیت اشتراک...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8" dir="rtl">
      
      <div className="w-full max-w-7xl border-2 border-cyan-400 p-6 md:p-10 relative bg-white/50 backdrop-blur-sm">
        
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
          <Link href="/panel" className="border-2 border-cyan-400 text-cyan-500 font-bold px-8 py-3 rounded-md hover:bg-cyan-50 transition">
            بازگشت
          </Link>
          
          <div className="flex flex-col items-center">
            <img src="/logo.png" alt="کرور" className="h-20 w-auto object-contain" />
            {hasActivePaidPlan && (
              <p className="text-sm font-bold text-emerald-600 mt-2 bg-emerald-50 px-4 py-1 rounded-full border border-emerald-200">
                اشتراک فعلی شما: {PLAN_NAMES[user.subscriptionType]} ({remainingDays} روز باقی‌مانده)
              </p>
            )}
          </div>
          
          <div className="w-[120px] hidden md:block"></div>
        </div>

        <div className="flex flex-col items-center mb-10">
          <p className="text-sm font-bold text-gray-600 mb-3">مدت زمان اشتراک خود را انتخاب کنید:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {DURATIONS.map((dur) => (
              <button
                key={dur.months}
                onClick={() => setSelectedDuration(dur)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition border-2 ${
                  selectedDuration.months === dur.months 
                    ? "bg-cyan-50 border-cyan-400 text-cyan-700" 
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {dur.label}
                {dur.discount > 0 && <span className="mr-2 text-xs text-emerald-600">({dur.discount * 100}% تخفیف)</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-start">
          
          {/* 1. Platinum Plan */}
          <div className={`bg-white rounded-[2rem] border-2 border-gray-200 p-6 flex flex-col h-full shadow-sm relative ${currentLevel === 3 ? 'ring-2 ring-gray-800 ring-offset-2' : ''}`}>
            {currentLevel === 3 && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-3 py-1 rounded-full">اشتراک فعلی شما</span>}
            
            <div className="text-center mb-6 border-b border-gray-100 pb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">اشتراک پلاتینیوم</h2>
              <p className="text-xs font-semibold text-muted h-8">برای شرکت‌های بزرگ و بازرگانی</p>
              <div className="mt-4">
                <span className="text-lg font-bold text-foreground">{calculatePrice(getBasePrice("PLATINUM")).toLocaleString("fa-IR")}</span>
                <span className="text-xs font-medium text-muted mr-1">تومان</span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1 text-xs font-medium text-gray-600">
              <li className="flex items-start gap-2"><span className="text-emerald-500">✓</span>مشاهده تمام درخواست‌های خرید</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500">✓</span>مشاهده تمام آگهی‌های تامین‌کنندگان</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500">✓</span>دسترسی به اطلاعات تماس ۱۰۰ درخواست خرید در ماه بدون تاخیر</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500">✓</span>امکان ثبت حداکثر ۱۰۰ محصول برای فروش</li>
            </ul>

            <button 
              onClick={() => handlePlanClick("PLATINUM")}
              disabled={loading !== null || currentLevel > 3}
              className={`w-full font-bold py-3 rounded-xl transition mt-auto ${
                currentLevel === 3 
                  ? "bg-gray-800 hover:bg-black text-white" 
                  : currentLevel > 3 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-gray-900 hover:bg-black text-white"
              }`}
            >
              {loading === "PLATINUM" ? "در حال انتقال..." : currentLevel === 3 ? "تمدید اشتراک" : "خرید اشتراک"}
            </button>
          </div>

          {/* 2. Gold Plan */}
          <div className={`bg-white rounded-[2rem] border-2 border-gray-200 p-6 flex flex-col h-full shadow-lg relative mt-4 lg:mt-0 ${currentLevel === 2 ? 'ring-2 ring-amber-600 ring-offset-2' : ''}`}>
            {currentLevel === 2 ? (
               <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[10px] px-3 py-1 rounded-full">اشتراک فعلی شما</span>
            ) : (
               <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-[10px] px-3 py-1 rounded-full">پیشنهاد ویژه</span>
            )}

            <div className="text-center mb-6 border-b border-gray-100 pb-6 mt-2">
              <h2 className="text-xl font-bold text-amber-500 mb-2">اشتراک طلایی</h2>
              <p className="text-xs font-semibold text-muted h-8">برای کسب و کارهای متوسط</p>
              <div className="mt-4">
                <span className="text-lg font-bold text-foreground">{calculatePrice(getBasePrice("GOLD")).toLocaleString("fa-IR")}</span>
                <span className="text-xs font-medium text-muted mr-1">تومان</span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1 text-xs font-medium text-gray-600">
              <li className="flex items-start gap-2"><span className="text-amber-500">✓</span>مشاهده تمام درخواست‌های خرید</li>
              <li className="flex items-start gap-2"><span className="text-amber-500">✓</span>مشاهده تمام آگهی‌های تامین‌کنندگان</li>
              <li className="flex items-start gap-2"><span className="text-amber-500">✓</span>دسترسی به اطلاعات تماس ۵۰ درخواست خرید در ماه با تاخیر ۱ روزه</li>
              <li className="flex items-start gap-2"><span className="text-amber-500">✓</span>امکان ثبت حداکثر ۵۰ محصول برای فروش</li>
            </ul>

            <button 
              onClick={() => handlePlanClick("GOLD")}
              disabled={loading !== null || currentLevel > 2}
              className={`w-full font-bold py-3 rounded-xl transition mt-auto ${
                currentLevel === 2 
                  ? "bg-amber-600 hover:bg-amber-700 text-white" 
                  : currentLevel > 2 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-amber-400 hover:bg-amber-500 text-white"
              }`}
            >
              {loading === "GOLD" ? "در حال انتقال..." : currentLevel === 2 ? "تمدید اشتراک" : currentLevel > 2 ? "غیرفعال" : "خرید اشتراک"}
            </button>
          </div>

          {/* 3. Silver Plan */}
          <div className={`bg-white rounded-[2rem] border-2 border-gray-200 p-6 flex flex-col h-full shadow-sm relative ${currentLevel === 1 ? 'ring-2 ring-gray-400 ring-offset-2' : ''}`}>
            {currentLevel === 1 && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-500 text-white text-[10px] px-3 py-1 rounded-full">اشتراک فعلی شما</span>}
            
            <div className="text-center mb-6 border-b border-gray-100 pb-6">
              <h2 className="text-xl font-bold text-gray-600 mb-2">اشتراک نقره‌ای</h2>
              <p className="text-xs font-semibold text-muted h-8">برای کسب و کارهای کوچک</p>
              <div className="mt-4">
                <span className="text-lg font-bold text-foreground">{calculatePrice(getBasePrice("SILVER")).toLocaleString("fa-IR")}</span>
                <span className="text-xs font-medium text-muted mr-1">تومان</span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1 text-xs font-medium text-gray-600">
              <li className="flex items-start gap-2"><span className="text-gray-500">✓</span>مشاهده تمام درخواست‌های خرید</li>
              <li className="flex items-start gap-2"><span className="text-gray-500">✓</span>مشاهده تمام آگهی‌های تامین‌کنندگان</li>
              <li className="flex items-start gap-2"><span className="text-gray-500">✓</span>دسترسی به اطلاعات تماس ۱۰ درخواست خرید در ماه با تاخیر ۲ روزه</li>
              <li className="flex items-start gap-2"><span className="text-gray-500">✓</span>امکان ثبت حداکثر ۱۰ محصول برای فروش</li>
            </ul>

            <button 
              onClick={() => handlePlanClick("SILVER")}
              disabled={loading !== null || currentLevel > 1}
              className={`w-full font-bold py-3 rounded-xl transition mt-auto ${
                currentLevel === 1 
                  ? "bg-gray-400 hover:bg-gray-500 text-white" 
                  : currentLevel > 1 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              {loading === "SILVER" ? "در حال انتقال..." : currentLevel === 1 ? "تمدید اشتراک" : currentLevel > 1 ? "غیرفعال" : "خرید اشتراک"}
            </button>
          </div>

          {/* 4. Basic Plan */}
          <div className={`bg-white rounded-[2rem] border-2 border-gray-200 p-6 flex flex-col h-full shadow-sm relative ${currentLevel === 0 ? 'ring-2 ring-black ring-offset-2' : ''}`}>
            {currentLevel === 0 && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-3 py-1 rounded-full">اشتراک فعلی شما</span>}
            
            <div className="text-center mb-6 border-b border-gray-100 pb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">اشتراک پایه</h2>
              <p className="text-xs font-semibold text-muted h-8">برای افراد مبتدی و تست پلتفرم</p>
              <div className="mt-4">
                <span className="text-xl font-bold text-foreground">رایگان</span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1 text-xs font-medium text-gray-600">
              <li className="flex items-start gap-2"><span className="text-gray-800">✓</span>مشاهده تمام درخواست‌های خرید</li>
              <li className="flex items-start gap-2"><span className="text-gray-800">✓</span>مشاهده تمام آگهی‌های تامین‌کنندگان</li>
            </ul>

            <button disabled className="w-full bg-gray-100 text-gray-400 font-bold py-3 rounded-xl mt-auto cursor-not-allowed">
              {currentLevel === 0 ? "اشتراک فعلی شما" : "غیرفعال"}
            </button>
          </div>

        </div>
      </div>

      {pendingPlan && (
        <UpgradeConfirmModal
          isOpen={isModalOpen}
          currentPlan={PLAN_NAMES[user.subscriptionType]}
          newPlan={PLAN_NAMES[pendingPlan]}
          remainingDays={remainingDays}
          isExtension={PLAN_LEVELS[pendingPlan] === currentLevel}
          onConfirm={() => executePurchase(pendingPlan)}
          onCancel={() => {
            setIsModalOpen(false);
            setPendingPlan(null);
          }}
        />
      )}
    </div>
  );
}