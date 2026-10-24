"use client";

import Link from "next/link";

type MenuDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const PRIMARY_ITEMS = [
  { href: "/", label: "خانه" },
  { href: "/products", label: "لیست محصولات" },
  { href: "/suppliers", label: "لیست تامین‌کنندگان" },
  { href: "/requests", label: "لیست درخواست‌های خرید" },
];

const SECONDARY_ITEMS = [
  { href: "/plans", label: "اشتراک پلتفرم", highlight: true },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
  { href: "/terms", label: "قوانین و مقررات" },
];

export default function MenuDrawer({ isOpen, onClose }: MenuDrawerProps) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-white z-[70] shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex flex-col h-full">
          {/* Header of drawer */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="text-lg font-bold text-foreground">
              پلتفرم کرور
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-brand-50 transition"
              aria-label="بستن"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-foreground"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto p-3">
            {/* Primary nav */}
            <ul className="space-y-1">
              {PRIMARY_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="block px-4 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-brand-50 transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Divider */}
            <div className="my-4 border-t border-border" />

            {/* Secondary links */}
            <ul className="space-y-1">
              {SECONDARY_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                      item.highlight
                        ? "text-blue-700 bg-blue-50 hover:bg-blue-100"
                        : "text-muted hover:bg-brand-50 hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer of drawer — auth buttons */}
          <div className="p-3 border-t border-border space-y-2">
            <Link
              href="/login"
              onClick={onClose}
              className="block text-center text-sm font-medium text-foreground px-4 py-2.5 rounded-lg border border-border hover:bg-brand-50 transition"
            >
              ورود / ثبت‌نام
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}