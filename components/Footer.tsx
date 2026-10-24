import Link from "next/link";
import Image from "next/image";

const QUICK_LINKS = [
  { href: "/", label: "خانه" },
  { href: "/products", label: "لیست محصولات" },
  { href: "/suppliers", label: "لیست تامین‌کنندگان" },
  { href: "/requests", label: "لیست درخواست‌های خرید" },
];

const SERVICES = [
  { href: "/plans", label: "اشتراک پلتفرم" },
  { href: "/post", label: "ثبت درخواست خرید" },
  { href: "/panel", label: "پنل کاربری" },
  { href: "/terms", label: "قوانین و مقررات" },
];

const CONTACT = [
  { label: "تهران، ایران", icon: "📍" },
  { label: "021-1405", icon: "📞" },
  { label: "info@kurur.ir", icon: "✉️" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Top: 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1 — About */}
          <div>
            <div className="mb-4">
              <Image
                src="/logo.png"
                alt="کرور"
                width={110}
                height={44}
                className="h-10 w-auto object-contain bg-white rounded-lg p-1"
              />
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              کرور، پلتفرم تخصصی خرید و فروش عمده در ایران
            </p>
          </div>

          {/* Column 2 — Quick links */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm">دسترسی سریع</h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Services */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm">خدمات</h3>
            <ul className="space-y-2">
              {SERVICES.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm">ارتباط با ما</h3>
            <ul className="space-y-3">
              {CONTACT.map((item) => (
                <li key={item.label} className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="shrink-0">{item.icon}</span>
                  <span dir="ltr">{item.label}</span>
                </li>
              ))}
            </ul>

            {/* Social icons */}
            <div className="flex items-center gap-2 mt-5">
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition"
                aria-label="اینستاگرام"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition"
                aria-label="تلگرام"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition"
                aria-label="لینکدین"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 text-center md:text-right">
            © ۱۴۰۵ پلتفرم کرور — تمامی حقوق محفوظ است
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link href="/terms" className="hover:text-white transition">
              قوانین و مقررات
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/privacy" className="hover:text-white transition">
              حریم خصوصی
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}