"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/lib/actions/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await loginAdmin(email, password);

    if (res.success) {
      router.push("/admin/dashboard");
      router.refresh();
    } else {
      setError(res.error || "خطا در ورود");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4" dir="rtl">
      
      <div className="w-full max-w-md bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">ورود به پنل مدیریت</h1>
          <p className="text-sm font-medium text-gray-400">دسترسی فقط برای مدیران سیستم</p>
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-400 text-sm font-semibold p-3 rounded-lg mb-6 text-center border border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">ایمیل مدیر</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@kurur.ir"
              className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-left"
              dir="ltr"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">رمز عبور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-left"
              dir="ltr"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 mt-4"
          >
            {loading ? "در حال بررسی..." : "ورود به سیستم"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            این صفحه مخصوص مدیران است. اگر کاربر عادی هستید، به <a href="/login" className="text-blue-400 hover:underline">صفحه ورود کاربران</a> بروید.
          </p>
        </div>

      </div>
    </div>
  );
}