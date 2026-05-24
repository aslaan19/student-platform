// school admin auth
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function requireSchoolAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile || profile.role !== "SCHOOL_ADMIN") return null;

  // Deactivated admins are blocked from all school-admin API routes
  if (!profile.is_active) return null;

  const school = await prisma.school.findFirst({ where: { admin_id: profile.id } });
  if (!school) return null;

  return { profile, school };
}

/**
 * Returns the raw activation status so the layout can distinguish
 * "deactivated" (show deactivated page) from "unauthorized" (redirect).
 */
export async function getSchoolAdminStatus(): Promise<"ok" | "deactivated" | "unauthorized"> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "unauthorized";

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true, is_active: true },
  });
  if (!profile || profile.role !== "SCHOOL_ADMIN") return "unauthorized";
  if (!profile.is_active) return "deactivated";
  return "ok";
}
