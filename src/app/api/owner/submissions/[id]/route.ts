// api/owner/submissions/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { prisma } from "../../../../../lib/prisma";

async function requireOwner() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile || profile.role !== "OWNER") return null;
  return profile;
}

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const ownerProfile = await requireOwner();
  if (!ownerProfile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await context.params;

  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id },
    include: {
      assessment: {
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: { options: { orderBy: { order: "asc" } } },
          },
        },
      },
      student: {
        include: {
          profile: { select: { id: true, full_name: true } },
          school: { select: { id: true, name: true } },
        },
      },
      answers: {
        include: {
          question: {
            include: { options: { orderBy: { order: "asc" } } },
          },
        },
      },
      assigned_school: { select: { id: true, name: true } },
      reviewer: { select: { id: true, full_name: true } },
    },
  });

  if (!attempt) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

  return NextResponse.json({ attempt });
}
