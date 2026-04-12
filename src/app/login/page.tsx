"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("من فضلك أدخل البريد الإلكتروني وكلمة المرور");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("LOGIN RESULT:", { data, error });

    if (error) {
      setLoading(false);
      alert("خطأ في تسجيل الدخول: " + error.message);
      return;
    }

    const user = data.user;

    if (!user) {
      setLoading(false);
      alert("تم تسجيل الدخول لكن لم يتم العثور على user");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    console.log("PROFILE RESULT:", { profile, profileError });

    setLoading(false);

    if (profileError || !profile) {
      alert("تم تسجيل الدخول لكن لم يتم العثور على profile");
      return;
    }

    if (profile.role === "ADMIN") {
      window.location.href = "/admin";
      return;
    }

    if (profile.role === "TEACHER") {
      window.location.href = "/teacher";
      return;
    }

    if (profile.role === "STUDENT") {
      window.location.href = "/student";
      return;
    }

    alert("نوع المستخدم غير صحيح: " + profile.role);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-center text-2xl font-bold">تسجيل الدخول</h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          أدخل بياناتك للوصول إلى المنصة
        </p>

        <div className="space-y-4">
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-lg bg-black py-2 text-white transition disabled:opacity-50"
          >
            {loading ? "جارٍ تسجيل الدخول..." : "دخول"}
          </button>
        </div>

        <p className="mt-5 text-center text-sm text-gray-500">
          لا تملك حسابًا؟{" "}
          <Link href="/signup" className="font-medium text-black underline">
            إنشاء حساب طالب
          </Link>
        </p>
      </div>
    </main>
  );
}
