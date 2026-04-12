"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password) {
      alert("من فضلك أكمل جميع الحقول");
      return;
    }

    if (password.length < 6) {
      alert("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log("SIGNUP RESULT:", { data, error });

    if (error) {
      setLoading(false);
      alert("خطأ في إنشاء مستخدم auth: " + error.message);
      return;
    }

    const user = data.user;

    if (!user) {
      setLoading(false);
      alert("لم يتم إنشاء الحساب في auth.users");
      return;
    }

    const { data: insertedProfile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        role: "STUDENT",
        full_name: fullName,
      })
      .select()
      .single();

    console.log("PROFILE INSERT RESULT:", {
      insertedProfile,
      profileError,
    });

    setLoading(false);

    if (profileError) {
      alert(
        "تم إنشاء auth user لكن فشل إنشاء profile: " + profileError.message,
      );
      return;
    }

    alert("تم إنشاء حساب الطالب بنجاح");
    window.location.href = "/student";
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-center text-2xl font-bold">إنشاء حساب طالب</h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          هذه الصفحة مخصصة للطلاب فقط
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              الاسم الكامل
            </label>
            <input
              type="text"
              placeholder="الاسم الكامل"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              كلمة المرور
            </label>
            <input
              type="password"
              placeholder="6 أحرف أو أكثر"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            type="button"
            onClick={handleSignup}
            disabled={loading}
            className="w-full rounded-lg bg-black py-2 text-white transition disabled:opacity-50"
          >
            {loading ? "جارٍ إنشاء الحساب..." : "إنشاء حساب"}
          </button>
        </div>

        <p className="mt-5 text-center text-sm text-gray-500">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="font-medium text-black underline">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </main>
  );
}
