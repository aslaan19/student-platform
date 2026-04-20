// prisma/seed-students.ts
import { PrismaClient, Role, StudentOnboardingStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl = process.env.DATABASE_URL;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!databaseUrl) throw new Error("Missing DATABASE_URL");
if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
if (!serviceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

import { createClient } from "@supabase/supabase-js";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// 3 students per class × 6 classes = 18 students
// Each entry: { arabicName, emailSlug }
const classSudents: Record<string, { fullName: string; email: string }[]> = {
  "Grade 1": [
    { fullName: "عمر سعيد الغامدي",   email: "omar.said@student.com" },
    { fullName: "ريم محمد العتيبي",   email: "reem.mohammed@student.com" },
    { fullName: "خالد عبدالله الزهراني", email: "khaled.abdallah@student.com" },
  ],
  "Grade 2": [
    { fullName: "نورة سلمان القحطاني", email: "noura.salman@student.com" },
    { fullName: "فيصل ناصر الشهري",   email: "faisal.nasser@student.com" },
    { fullName: "هند علي الدوسري",    email: "hind.ali@student.com" },
  ],
  "Beginner": [
    { fullName: "يوسف إبراهيم المطيري", email: "yousef.ibrahim@student.com" },
    { fullName: "سارة أحمد الحربي",    email: "sara.ahmed.h@student.com" },
    { fullName: "عبدالرحمن فهد العنزي", email: "abdelrahman.fahd@student.com" },
  ],
  "Intermediate": [
    { fullName: "ليلى محمود الرشيدي",  email: "layla.mahmoud@student.com" },
    { fullName: "تركي سعد البلوي",     email: "turki.saad@student.com" },
    { fullName: "منى عمر السبيعي",     email: "mona.omar@student.com" },
  ],
  "Level A": [
    { fullName: "جاسم سليمان المري",   email: "jasim.sulaiman@student.com" },
    { fullName: "أسماء وليد الجهني",   email: "asma.walid@student.com" },
    { fullName: "راشد حمد الكندي",     email: "rashed.hamad@student.com" },
  ],
  "Level B": [
    { fullName: "دانة طارق الفيفي",    email: "dana.tariq@student.com" },
    { fullName: "سلطان بدر الحازمي",   email: "sultan.badr@student.com" },
    { fullName: "شيخة ماجد العمري",    email: "shaikha.majed@student.com" },
  ],
};

async function deleteAuthUserByEmail(email: string) {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) throw new Error(`Failed to list users: ${error.message}`);
  const existing = data.users.find((u) => u.email === email);
  if (existing) {
    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(existing.id);
    if (delErr) throw new Error(`Failed to delete ${email}: ${delErr.message}`);
  }
}

async function main() {
  console.log("🌱 Seeding students into classes...\n");

  // Load all classes with their school
  const classes = await prisma.class.findMany({
    include: { school: true },
  });

  for (const cls of classes) {
    const students = classSudents[cls.name];
    if (!students) {
      console.log(`⚠️  No students defined for class "${cls.name}" — skipping`);
      continue;
    }

    console.log(`📚 Class: ${cls.name} (${cls.school.name})`);

    for (const s of students) {
      // Clean up existing auth user if any
      await deleteAuthUserByEmail(s.email);

      // Create auth user
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: s.email,
        password: "123456",
        email_confirm: true,
      });

      if (error || !data.user) {
        console.error(`  ❌ Failed to create auth for ${s.email}: ${error?.message}`);
        continue;
      }

      const userId = data.user.id;

      // Create profile
      await prisma.profile.upsert({
        where: { id: userId },
        update: { full_name: s.fullName, role: Role.STUDENT },
        create: { id: userId, full_name: s.fullName, role: Role.STUDENT },
      });

      // Create student row — fully assigned
      await prisma.student.upsert({
        where: { profile_id: userId },
        update: {
          onboarding_status: StudentOnboardingStatus.CLASS_ASSIGNED,
          school_id: cls.school_id,
          class_id: cls.id,
        },
        create: {
          profile_id: userId,
          onboarding_status: StudentOnboardingStatus.CLASS_ASSIGNED,
          school_id: cls.school_id,
          class_id: cls.id,
        },
      });

      console.log(`  ✅ ${s.fullName} (${s.email})`);
    }

    console.log("");
  }

  console.log("✅ Done! All students seeded.\n");
  console.log("Password for all: 123456");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });