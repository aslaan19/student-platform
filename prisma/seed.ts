import "dotenv/config";  // ← add this at the top

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main() {
  console.log("🌱 Seeding...");

  const teachers = [
    { name: "أحمد محمد", email: "ahmed@test.com" },
    { name: "سارة علي", email: "sara@test.com" },
    { name: "خالد عمر", email: "khaled@test.com" },
  ];

  const classes = ["الفصل الأول", "الفصل الثاني", "الفصل الثالث"];

  for (let i = 0; i < teachers.length; i++) {
    const { name, email } = teachers[i];

    // 1. Create auth user
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password: "123456",
        email_confirm: true,
      });

    if (authError || !authData.user) {
      console.error(`❌ Failed to create auth user for ${name}:`, authError?.message);
      continue;
    }

    const userId = authData.user.id;
    console.log(`✅ Auth user created: ${email}`);

    // 2. Create profile
    await prisma.profile.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        full_name: name,
        role: "TEACHER",
      },
    });

    // 3. Create teacher + class
    const teacher = await prisma.teacher.upsert({
      where: { profile_id: userId },
      update: {},
      create: { profile_id: userId },
    });

    await prisma.class.upsert({
      where: { name: classes[i] },
      update: {},
      create: {
        name: classes[i],
        teacher: { connect: { id: teacher.id } },
      },
    });

    console.log(`✅ Teacher ${name} created and assigned to ${classes[i]}`);
  }

  console.log("🎉 Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });