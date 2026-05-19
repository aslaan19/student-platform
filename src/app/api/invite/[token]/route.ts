// src/app/api/invite/[token]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// ── Shared: resolve invite state ───────────────────────────────────────────

type InviteState =
  | { valid: false; reason: "not_found" | "disabled" | "expired" | "used" }
  | { valid: true; invite: { id: string; school_id: string; type: string; school_name: string } };

async function resolveInvite(token: string): Promise<InviteState> {
  const invite = await prisma.invite.findUnique({
    where: { token },
    select: {
      id: true,
      type: true,
      is_active: true,
      use_count: true,
      max_uses: true,
      expires_at: true,
      school_id: true,
      school: { select: { name: true } },
    },
  });

  if (!invite) return { valid: false, reason: "not_found" };
  if (!invite.is_active) return { valid: false, reason: "disabled" };
  if (invite.expires_at && invite.expires_at < new Date()) return { valid: false, reason: "expired" };
  if (invite.max_uses !== null && invite.use_count >= invite.max_uses) return { valid: false, reason: "used" };

  return {
    valid: true,
    invite: {
      id: invite.id,
      school_id: invite.school_id,
      type: invite.type,
      school_name: invite.school.name,
    },
  };
}

// ── GET /api/invite/[token] ────────────────────────────────────────────────
// Public. Validates the token and returns its state.
// Used by the signup page to decide what to render.

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const state = await resolveInvite(params.token);

  if (!state.valid) {
    return NextResponse.json({ valid: false, reason: state.reason }, { status: 200 });
  }

  return NextResponse.json({
    valid: true,
    type: state.invite.type,
    school_name: state.invite.school_name,
  });
}

// ── POST /api/invite/[token] ───────────────────────────────────────────────
// Public. Accepts the invite and creates the teacher account.
// Body: { full_name, email, password }

export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  // 1. Re-validate the invite atomically before doing anything
  const state = await resolveInvite(params.token);

  if (!state.valid) {
    const messages: Record<string, string> = {
      not_found: "This invite link is invalid.",
      disabled:  "This invite has been disabled.",
      expired:   "This invite link has expired. Please contact your school admin.",
      used:      "This invite has already been used.",
    };
    return NextResponse.json(
      { error: messages[state.reason] },
      { status: 410 }
    );
  }

  // 2. Parse and validate body
  let body: { full_name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const full_name = body.full_name?.trim();
  const email     = body.email?.trim().toLowerCase();
  const password  = body.password;

  if (!full_name || !email || !password) {
    return NextResponse.json(
      { error: "full_name, email, and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  // 3. Create Supabase auth user
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip email confirmation for invite flow
  });

  if (authError || !authData.user) {
    const message = authError?.message?.toLowerCase().includes("already registered")
      ? "An account with this email already exists."
      : "Failed to create account. Please try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const userId = authData.user.id;

  // 4. Create Profile + Teacher row + mark invite used — all in one transaction
  try {
    await prisma.$transaction(async (tx) => {
      // Create profile
      await tx.profile.create({
        data: {
          id: userId,
          full_name,
          role: "TEACHER",
        },
      });

      // Create teacher row linked to school
      await tx.teacher.create({
        data: {
          profile_id: userId,
          school_id: state.invite.school_id,
        },
      });

      // Mark invite as used
      await tx.invite.update({
        where: { id: state.invite.id },
        data: {
          use_count: { increment: 1 },
          is_active: false,   // single-use: disable immediately
          used_at:   new Date(),
          used_by:   userId,
        },
      });
    });
  } catch (err) {
    // If DB transaction fails, clean up the auth user to avoid orphan
    await supabase.auth.admin.deleteUser(userId);
    console.error("Invite acceptance transaction failed:", err);
    return NextResponse.json(
      { error: "Account creation failed. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}