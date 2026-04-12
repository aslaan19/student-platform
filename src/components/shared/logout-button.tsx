"use client";

import { createClient } from "../../lib/supabase/client";

export default function LogoutButton() {
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg border px-4 py-2 text-sm font-medium"
    >
      تسجيل الخروج
    </button>
  );
}
