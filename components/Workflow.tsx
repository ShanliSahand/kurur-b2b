const STEPS = [
  {
    number: 1,
    title: "درخواست خرید",
    description: "نیاز خود را ثبت کرده، درخواست قیمت کنید",
  },
  {
    number: 2,
    title: "دریافت پیشنهادات",
    description: "تامین‌کنندگان واجد شرایط قیمت‌ها و شرایط خود را ارسال می‌کنند",
  },
  {
    number: 3,
    title: "مقایسه پیشنهادات",
    description: "پیشنهادات را بر اساس قیمت، کیفیت و شرایط مقایسه کنید",
  },
  {
    number: 4,
    title: "انتخاب تامین‌کننده",
    description: "یکی از گزینه‌ها پیشنهادی مربوطه را انتخاب کنید",
  },
  {
    number: 5,
    title: "مذاکره مستقیم",
    description: "به صورت مستقیم با تامین‌کننده منتخب وارد مذاکره شوید",
  },
];

export default function Workflow() {
  return (
    <section className="px-4 pt-10 pb-6">
      <div className="mx-auto max-w-6xl">
        {/* Colored headline */}
        <h2 className="text-center text-2xl md:text-4xl font-bold mb-10 leading-relaxed">
          <span className="text-brand-600">یک درخواست</span>
          <span className="text-muted mx-2">،</span>
          <span className="text-accent-500">چند پیشنهاد</span>
          <span className="text-muted mx-2">،</span>
          <span className="text-blue-600">یک انتخاب</span>
        </h2>

        {/* Steps row */}
        <div className="flex flex-wrap justify-center gap-3">
          {STEPS.map((step, index) => (
            <div key={step.number} className="flex items-stretch gap-3">
              {/* Step column: box on top, description below */}
              <div className="w-40 md:w-48 flex flex-col items-center">
                {/* Box */}
                <div className="w-full flex items-center gap-2 rounded-lg border-2 border-brand-500 bg-white px-3 h-12">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                  <span className="text-xs md:text-sm font-bold text-foreground truncate">
                    {step.title}
                  </span>
                </div>

                {/* Description */}
                <p className="mt-3 text-xs md:text-sm font-medium text-gray-700 leading-relaxed text-center px-1">
                  {step.description}
                </p>
              </div>

              {/* Arrow between steps — vertically centered with the box row */}
              {index < STEPS.length - 1 && (
                <div className="flex items-center h-12">
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
                    className="text-brand-500 shrink-0"
                  >
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}