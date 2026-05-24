// GET /api/school-admin/me
// Returns activation status so the layout can show a deactivated page
// instead of just a blank 403.
import { NextResponse } from "next/server";
import { getSchoolAdminStatus } from "@/lib/school-admin-auth";

export async function GET() {
  const status = await getSchoolAdminStatus();
  return NextResponse.json({ status });
}
