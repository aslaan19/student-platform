/**
 * TEMPORARY DIAGNOSTIC ENDPOINT — remove after fixing the school admin 403 issue.
 * GET /api/school-admin/debug
 *
 * Returns a step-by-step breakdown of what requireSchoolAdmin() sees,
 * so you can diagnose which step fails without needing Vercel log access.
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const steps: Record<string, unknown> = {};

  // Step 1 — Supabase session
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  steps.step1_user = user
    ? { id: user.id, email: user.email }
    : { error: userError?.message ?? "no session" };

  if (!user) {
    return NextResponse.json({ ok: false, failedAt: "step1_no_user", steps });
  }

  // Step 2 — Profile lookup
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { id: true, role: true, is_active: true, full_name: true },
  });
  steps.step2_profile = profile ?? "NOT FOUND";

  if (!profile) {
    return NextResponse.json({ ok: false, failedAt: "step2_no_profile", steps });
  }
  if (profile.role !== "SCHOOL_ADMIN") {
    return NextResponse.json({ ok: false, failedAt: "step2_wrong_role", steps });
  }

  // Step 3 — is_active check
  if (!profile.is_active) {
    return NextResponse.json({ ok: false, failedAt: "step3_deactivated", steps });
  }

  // Step 4 — School lookup
  const school = await prisma.school.findFirst({
    where: { admin_id: profile.id },
    select: { id: true, name: true, admin_id: true },
  });
  steps.step4_school = school ?? "NOT FOUND";

  // Also list every school so we can see which one the admin should be linked to
  const allSchools = await prisma.school.findMany({
    select: { id: true, name: true, admin_id: true },
  });
  steps.all_schools = allSchools;

  if (!school) {
    return NextResponse.json({ ok: false, failedAt: "step4_no_school_for_admin", steps });
  }

  return NextResponse.json({ ok: true, steps });
}
