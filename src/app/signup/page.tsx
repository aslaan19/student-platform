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

    // ── Step 1: Auth ──────────────────────────────────────────
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log(
      "STEP 1 - AUTH:",
      JSON.stringify({ authData, authError }, null, 2),
    );

    if (authError) {
      setLoading(false);
      alert("فشل إنشاء auth user: " + authError.message);
      return;
    }

    if (!authData.user) {
      setLoading(false);
      alert("لم يتم إرجاع user من auth");
      return;
    }

    const userId = authData.user.id;
    console.log("STEP 1 - USER ID:", userId);

    // ── Step 2: Profile ───────────────────────────────────────
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .upsert(
        { id: userId, role: "STUDENT", full_name: fullName },
        { onConflict: "id" },
      )
      .select()
      .single();

    console.log(
      "STEP 2 - PROFILE:",
      JSON.stringify({ profileData, profileError }, null, 2),
    );

    if (profileError) {
      setLoading(false);
      alert(
        "فشل إنشاء profile: " +
          profileError.message +
          " | code: " +
          profileError.code,
      );
      return;
    }

    // ── Step 3: Student ───────────────────────────────────────
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .upsert({ profile_id: userId }, { onConflict: "profile_id" })
      .select()
      .single();

    console.log(
      "STEP 3 - STUDENT:",
      JSON.stringify({ studentData, studentError }, null, 2),
    );

    if (studentError) {
      setLoading(false);
      alert(
        "فشل إنشاء student: " +
          studentError.message +
          " | code: " +
          studentError.code,
      );
      return;
    }

    // ── All good ──────────────────────────────────────────────
    console.log("SIGNUP COMPLETE ✅");
    setLoading(false);
    alert("تم إنشاء الحساب بنجاح!");
    window.location.href = "/login";
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-center text-2xl font-bold">إنشاء حساب طالب</h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="الاسم الكامل"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
          />
          <input
            type="email"
            placeholder="example@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
          />
          <input
            type="password"
            placeholder="6 أحرف أو أكثر"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
          />
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
