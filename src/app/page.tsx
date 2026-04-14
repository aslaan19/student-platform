"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#1E1E1E] px-4 overflow-hidden">
      
      {/* subtle background glow */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#3A2F25] blur-[120px]" />
      </div>

      {/* content */}
      <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-xl shadow-2xl">

        {/* title */}
        <h1 className="mb-4 text-4xl font-bold text-white">
          المنصة التعليمية
        </h1>

        {/* subtitle */}
        <p className="mb-8 text-gray-300 leading-relaxed">
          نظام متكامل لإدارة الفصول، الطلاب، الاختبارات والتفاعل التعليمي
          بطريقة منظمة واحترافية
        </p>

        {/* buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">

          <Link
            href="/login"
            className="rounded-xl bg-white px-6 py-3 text-black font-medium transition hover:scale-[1.03] hover:bg-gray-200"
          >
            تسجيل الدخول
          </Link>

          <Link
            href="/signup"
            className="rounded-xl border border-white/20 px-6 py-3 text-white transition hover:scale-[1.03] hover:bg-white/10"
          >
            إنشاء حساب طالب
          </Link>

        </div>

        {/* divider */}
        <div className="my-8 h-px w-full bg-white/10" />

        {/* small features */}
        <div className="grid grid-cols-3 gap-4 text-sm text-gray-400">
          <div>📚 إدارة الفصول</div>
          <div>📝 اختبارات</div>
          <div>📊 متابعة الأداء</div>
        </div>

      </div>
    </main>
  );
}