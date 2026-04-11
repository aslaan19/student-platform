import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-xl rounded-2xl border bg-white p-8 text-center shadow-sm">
        <h1 className="mb-3 text-3xl font-bold">المنصة التعليمية</h1>
        <p className="mb-6 text-gray-600">
          منصة تعليمية منظمة للطلاب والمعلمين
        </p>

        <div className="flex justify-center gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-black px-5 py-2 text-white"
          >
            تسجيل الدخول
          </Link>

          <Link
            href="/signup"
            className="rounded-lg border px-5 py-2 text-black"
          >
            إنشاء حساب طالب
          </Link>
        </div>
      </div>
    </main>
  );
}
