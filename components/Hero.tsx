"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section className="px-4 pt-6 pb-2 md:pt-8 md:pb-3">
      <div className="mx-auto max-w-4xl text-center">
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="کرور"
            width={220}
            height={88}
            priority
            className="h-20 md:h-24 w-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
}