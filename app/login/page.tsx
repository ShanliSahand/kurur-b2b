"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendOtp, verifyOtp, getCurrentUser, logout } from "@/lib/actions/auth";
import ConfirmModal from "@/components/ConfirmModal";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [user, setUser] = useState<{ fullName: string | null } | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  
  // State for Logout Modal
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    // Reset form state when the page loads
    setStep(1);
    setPhone("");
    setOtp("");
    setError("");
    setLoading(false);

    getCurrentUser().then((u) => {
      setUser(u);
      setCheckingSession(false);
    });
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 1. Check for exactly 11 digits and starting with 09
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setError("شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد (مثلاً 09123456789)");
      return;
    }

    setLoading(true);
    
    try {
      // Call the Server Action to save OTP in DB and send SMS
      const res = await sendOtp(phone);
      
      if (res.success) {
        setStep(2);
        // Note: Check the VS Code terminal to see the generated OTP!
      } else {
        setError(res.error || "خطایی رخ داد");
      }
    } catch (err) {
      console.error(err);
      setError("خطای شبکه. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 2. Check for exactly 4 digits
    const otpRegex = /^\d{4}$/;
    if (!otpRegex.test(otp)) {
      setError("کد تایید باید دقیقاً ۴ رقم باشد");
      return;
    }

    setLoading(true);
    
    try {
      // Call the Server Action to verify OTP and set session cookie
      const res = await verifyOtp(phone, otp);
      
      if (res.success && res.redirectTo) {
        // If successful, redirect to /register (if new) or /panel (if existing)
        router.push(res.redirectTo);
        router.refresh(); // Refresh to update the Header
      } else {
        setError(res.error || "کد نامعتبر است");
      }
    } catch (err) {
      console.error(err);
      setError("خطای شبکه. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

  if (checkingSession) {
    return <div className="text-center py-20 text-muted">در حال بررسی...</div>;
  }

  // If user is already logged in, show this screen
  if (user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold mb-2">شما قبلاً وارد شده‌اید</h1>
        <p className="text-muted mb-6">کاربر گرامی {user.fullName || "کاربر"}، شما در حال حاضر به حساب خود متصل هستید.</p>
        <button 
          onClick={() => setIsLogoutModalOpen(true)}
          className="bg-red-500 text-white px-6 py-2 rounded-xl hover:bg-red-600 transition"
        >
          خروج از حساب
        </button>

        <ConfirmModal
          isOpen={isLogoutModalOpen}
          title="خروج از حساب"
          description="آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟"
          confirmText="بله، خارج شو"
          cancelText="انصراف"
          onConfirm={handleLogout}
          onCancel={() => setIsLogoutModalOpen(false)}
        />
      </div>
    );
  }

  // Otherwise, show the login form
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-border p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">ورود / ثبت‌نام</h1>
          <p className="text-sm text-muted">
            {step === 1 
              ? "برای ورود یا ثبت‌نام، شماره موبایل خود را وارد کنید." 
              : `کد تایید به شماره ${phone} ارسال شد.`}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        {/* Step 1: Phone */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">شماره موبایل</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09123456789"
                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-left"
                dir="ltr"
                maxLength={11}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading ? "در حال ارسال..." : "دریافت کد تایید"}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">کد تایید (۴ رقمی)</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="مثلاً 1234"
                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-center text-lg font-bold tracking-widest"
                dir="ltr"
                maxLength={4}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading ? "در حال بررسی..." : "تایید و ورود"}
            </button>
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setError("");
                }} 
                className="text-sm text-muted hover:text-foreground transition"
              >
                ویرایش شماره موبایل
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted">
          با ورود به پلتفرم، شما با <Link href="/terms" className="text-blue-600 hover:underline">قوانین و مقررات</Link> موافقت می‌کنید.
        </div>

      </div>
    </div>
  );
}