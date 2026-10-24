import Link from "next/link";

const LISTS = [
  {
    href: "/products",
    title: "لیست محصولات",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3h18v18H3z" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </svg>
    ),
  },
  {
    href: "/suppliers",
    title: "لیست تامین‌کنندگان",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/requests",
    title: "لیست درخواست‌های خرید",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    ),
  },
];

export default function QuickLinks() {
  return (
    <section className="px-4 pb-12">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {LISTS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white px-4 py-3 hover:shadow-md transition flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  {link.icon}
                </div>
                <span className="text-sm font-semibold truncate">
                  {link.title}
                </span>
              </div>
              <span className="shrink-0 w-6 h-6 rounded-full bg-white text-blue-700 flex items-center justify-center group-hover:-translate-x-1 transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}