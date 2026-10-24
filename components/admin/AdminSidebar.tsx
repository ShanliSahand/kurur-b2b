"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAdmin } from "@/lib/actions/admin-auth";

const MENU_ITEMS = [
  { href: "/admin/dashboard", label: "داشبورد", icon: "📊" },
  { href: "/admin/users", label: "کاربران", icon: "👥" },
  { href: "/admin/requests", label: "درخواست‌های خرید", icon: "📝" },
  { href: "/admin/ads", label: "آگهی‌های فروش", icon: "📦" },
  { href: "/admin/categories", label: "دسته‌بندی‌ها", icon: "🗂️" },
  { href: "/admin/locations", label: "مدیریت موقعیت‌ها", icon: "📍" },
  { href: "/admin/plans", label: "پلن‌های اشتراک", icon: "💳" },
  { href: "/admin/transactions", label: "تراکنش‌های مالی", icon: "💰" },
  { href: "/admin/logins", label: "تاریخچه ورود", icon: "🔑" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAdmin();
    router.push("/admin/login");
  };

  return (
    <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col h-screen sticky top-0 border-l border-gray-800 shrink-0">
      
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center border-b border-gray-800 px-4">
        <Link href="/admin/dashboard" className="text-white font-bold text-lg">
          پنل مدیریت کرور
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                isActive 
                  ? "bg-blue-600 text-white" 
                  : "hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <Link 
          href="/" 
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition"
        >
          <span>🌐</span> مشاهده سایت
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition"
        >
          <span>🚪</span> خروج از حساب
        </button>
      </div>
    </aside>
  );
}