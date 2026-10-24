"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import MenuDrawer from "./MenuDrawer";
import ConfirmModal from "./ConfirmModal";
import IranClock from "./IranClock";
import { getCurrentUser, logout } from "@/lib/actions/auth";

function HeaderContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<{ fullName: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setIsLogoutModalOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-border">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            
            {/* RIGHT — Logo + tagline + menu + home */}
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.png" alt="کرور" width={110} height={44} priority className="h-9 w-auto object-contain" />
              </Link>

              <span className="hidden md:inline-block text-xs font-bold text-muted mr-1">
                درگاه آنلاین خرید و فروش عمده
              </span>

              <button type="button" onClick={() => setIsMenuOpen(true)} className="p-2 rounded-full hover:bg-brand-50 transition" aria-label="منو">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="14" y2="18" />
                </svg>
              </button>

              <Link href="/" className="p-2 rounded-lg border border-border hover:bg-brand-50 transition" aria-label="خانه">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </Link>
            </div>

            {/* IRAN CLOCK */}
            <IranClock />

            {/* LEFT — User area */}
            <div className="flex items-center gap-2 shrink-0">
              {loading ? (
                <div className="w-24 h-9 bg-gray-100 rounded-full animate-pulse"></div>
              ) : user ? (
                <>
                  <div className="hidden sm:flex flex-col items-end mr-2">
                    <span className="text-sm font-bold text-foreground">{user.fullName}</span>
                    <span className="text-[10px] font-semibold text-muted">خوش آمدید</span>
                  </div>
                  <Link href="/panel" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-3 py-2 rounded-full transition">
                    <span>پنل کاربری</span>
                  </Link>
                  <button onClick={() => setIsLogoutModalOpen(true)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition" title="خروج">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
                </>
              ) : (
                <Link href="/login" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-3 py-2 rounded-full transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>ورود / پنل</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="خروج از حساب"
        description="آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟"
        confirmText="بله، خارج شو"
        cancelText="انصراف"
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
}

export default function Header() {
  return (
    <Suspense fallback={<div className="h-16 bg-white border-b border-border"></div>}>
      <HeaderContent />
    </Suspense>
  );
}