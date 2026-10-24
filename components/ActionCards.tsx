import Link from "next/link";

export default function ActionCards() {
  return (
    <section className="px-4 pb-10">
      <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Buyer card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white p-5 md:p-6">
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute -top-3 -right-3 w-16 h-16 bg-white/10 rounded-full" />

          <div className="relative">
            <span className="inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/20 mb-3">
              خریدار هستید؟
            </span>
            <h2 className="text-lg md:text-xl font-bold mb-2 leading-tight">
              درخواست خرید خود را ثبت کنید
            </h2>
            <p className="text-xs md:text-sm text-white/85 mb-4 leading-relaxed">
             درخواست کالاهای مورد نیاز خودتون رو ثبت کنید تا تامین‌کنندگان مشاهده کرده و پیشنهاد قیمت خود را ارسال کنند.
            </p>
            <Link
              href="/post"
              className="inline-flex items-center gap-1.5 bg-white text-brand-700 text-sm font-medium px-4 py-2 rounded-full hover:bg-brand-50 transition"
            >
              ثبت درخواست خرید
              <span className="text-xs">←</span>
            </Link>
          </div>
        </div>

        {/* Seller card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 text-white p-5 md:p-6">
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute -top-3 -left-3 w-16 h-16 bg-white/10 rounded-full" />

          <div className="relative">
            <span className="inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/20 mb-3">
              فروشنده هستید؟
            </span>
            <h2 className="text-lg md:text-xl font-bold mb-2 leading-tight">
              محصولات خود را عرضه کنید
            </h2>
            <p className="text-xs md:text-sm text-white/85 mb-4 leading-relaxed">
              محصولات خود را ثبت کنید و به درخواست‌های واقعی خریداران دسترسی پیدا کنید.
            </p>
            <Link
              href="/sell"
              className="inline-flex items-center gap-1.5 bg-white text-accent-600 text-sm font-medium px-4 py-2 rounded-full hover:bg-accent-50 transition"
            >
              ثبت محصول
              <span className="text-xs">←</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}