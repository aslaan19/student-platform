import {
  PrismaClient,
  Role,
  StudentOnboardingStatus,
} from "@prisma/client";
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
type SeedUser = {
  email: string;
  password: string;
  fullName: string;
  role: Role;
};

const seedUsers: SeedUser[] = [
  // Owner
  {
    email: "owner@platform.com",
    password: "12345678",
    fullName: "Aslan The Greatest",
    role: Role.OWNER,
  },

  // School admins
  {
    email: "admin.ayman@platform.com",
    password: "12345678",
    fullName: "Ayman School Admin",
    role: Role.SCHOOL_ADMIN,
  },
  {
    email: "admin.omar@platform.com",
    password: "12345678",
    fullName: "Omar School Admin",
    role: Role.SCHOOL_ADMIN,
  },
  {
    email: "admin.manzoma@platform.com",
    password: "12345678",
    fullName: "Manzoma School Admin",
    role: Role.SCHOOL_ADMIN,
  },

  // Teachers
  {
    email: "teacher1.ayman@platform.com",
    password: "12345678",
    fullName: "Ahmed Hassan",
    role: Role.TEACHER,
  },
  {
    email: "teacher2.ayman@platform.com",
    password: "12345678",
    fullName: "Mohamed Ali",
    role: Role.TEACHER,
  },
  {
    email: "teacher1.omar@platform.com",
    password: "12345678",
    fullName: "Omar Khaled",
    role: Role.TEACHER,
  },
  {
    email: "teacher2.omar@platform.com",
    password: "12345678",
    fullName: "Youssef Sameh",
    role: Role.TEACHER,
  },
  {
    email: "teacher1.manzoma@platform.com",
    password: "12345678",
    fullName: "Kareem Tarek",
    role: Role.TEACHER,
  },
  {
    email: "teacher2.manzoma@platform.com",
    password: "12345678",
    fullName: "Hassan Fathy",
    role: Role.TEACHER,
  },

  // Fully assigned students
  {
    email: "student1.ayman@platform.com",
    password: "12345678",
    fullName: "Ali Mahmoud",
    role: Role.STUDENT,
  },
  {
    email: "student1.omar@platform.com",
    password: "12345678",
    fullName: "Sara Ahmed",
    role: Role.STUDENT,
  },
  {
    email: "student1.manzoma@platform.com",
    password: "12345678",
    fullName: "Mona Khaled",
    role: Role.STUDENT,
  },

  // Onboarding test students
  {
    email: "pending.intake@platform.com",
    password: "12345678",
    fullName: "Pending Intake Student",
    role: Role.STUDENT,
  },
  {
    email: "submitted.intake@platform.com",
    password: "12345678",
    fullName: "Submitted Intake Student",
    role: Role.STUDENT,
  },
  {
    email: "school.assigned@platform.com",
    password: "12345678",
    fullName: "School Assigned Student",
    role: Role.STUDENT,
  },
  {
    email: "placement.submitted@platform.com",
    password: "12345678",
    fullName: "Placement Submitted Student",
    role: Role.STUDENT,
  },
];

async function deleteAuthUserByEmail(email: string) {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    throw new Error(`Failed to list auth users: ${error.message}`);
  }

  const existing = data.users.find((u) => u.email === email);

  if (existing) {
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      existing.id
    );

    if (deleteError) {
      throw new Error(
        `Failed to delete existing auth user ${email}: ${deleteError.message}`
      );
    }
  }
}

async function createAuthUser(user: SeedUser) {
  await deleteAuthUserByEmail(user.email);

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw new Error(
      `Failed to create auth user ${user.email}: ${error?.message ?? "Unknown error"}`
    );
  }

  return data.user;
}

async function createProfile(userId: string, fullName: string, role: Role) {
  return prisma.profile.create({
    data: {
      id: userId,
      full_name: fullName,
      role,
    },
  });
}

async function createTeacherUser(user: SeedUser, schoolId: string) {
  const authUser = await createAuthUser(user);

  await createProfile(authUser.id, user.fullName, user.role);

  return prisma.teacher.create({
    data: {
      profile_id: authUser.id,
      school_id: schoolId,
    },
  });
}

async function createStudentUser(
  user: SeedUser,
  status: StudentOnboardingStatus,
  schoolId?: string,
  classId?: string
) {
  const authUser = await createAuthUser(user);

  await createProfile(authUser.id, user.fullName, user.role);

  return prisma.student.create({
    data: {
      profile_id: authUser.id,
      onboarding_status: status,
      school_id: schoolId ?? null,
      class_id: classId ?? null,
    },
  });
}

async function createSchoolAdminUser(user: SeedUser, schoolId: string) {
  const authUser = await createAuthUser(user);

  await createProfile(authUser.id, user.fullName, user.role);

  await prisma.school.update({
    where: { id: schoolId },
    data: {
      admin_id: authUser.id,
    },
  });

  return authUser;
}

async function main() {
  console.log("🌱 Starting seed...");

  // Create owner
  const ownerSeed = seedUsers.find((u) => u.role === Role.OWNER)!;
  const ownerAuth = await createAuthUser(ownerSeed);
  await createProfile(ownerAuth.id, ownerSeed.fullName, ownerSeed.role);

  // Create schools
  const schoolA = await prisma.school.create({
    data: { name: "مدرسة ايمن" },
  });

  const schoolB = await prisma.school.create({
    data: { name: "مدرسة عمر" },
  });

  const schoolC = await prisma.school.create({
    data: { name: "مدرسة منظومة" },
  });

  // Create school admins
  await createSchoolAdminUser(
    seedUsers.find((u) => u.email === "admin.ayman@platform.com")!,
    schoolA.id
  );

  await createSchoolAdminUser(
    seedUsers.find((u) => u.email === "admin.omar@platform.com")!,
    schoolB.id
  );

  await createSchoolAdminUser(
    seedUsers.find((u) => u.email === "admin.manzoma@platform.com")!,
    schoolC.id
  );

  // Create teachers
  const teacherA1 = await createTeacherUser(
    seedUsers.find((u) => u.email === "teacher1.ayman@platform.com")!,
    schoolA.id
  );
  const teacherA2 = await createTeacherUser(
    seedUsers.find((u) => u.email === "teacher2.ayman@platform.com")!,
    schoolA.id
  );

  const teacherB1 = await createTeacherUser(
    seedUsers.find((u) => u.email === "teacher1.omar@platform.com")!,
    schoolB.id
  );
  const teacherB2 = await createTeacherUser(
    seedUsers.find((u) => u.email === "teacher2.omar@platform.com")!,
    schoolB.id
  );

  const teacherC1 = await createTeacherUser(
    seedUsers.find((u) => u.email === "teacher1.manzoma@platform.com")!,
    schoolC.id
  );
  const teacherC2 = await createTeacherUser(
    seedUsers.find((u) => u.email === "teacher2.manzoma@platform.com")!,
    schoolC.id
  );

  // Create classes
  const classA1 = await prisma.class.create({
    data: {
      name: "Grade 1",
      school_id: schoolA.id,
      teacher_id: teacherA1.id,
    },
  });

  const classA2 = await prisma.class.create({
    data: {
      name: "Grade 2",
      school_id: schoolA.id,
      teacher_id: teacherA2.id,
    },
  });

  const classB1 = await prisma.class.create({
    data: {
      name: "Beginner",
      school_id: schoolB.id,
      teacher_id: teacherB1.id,
    },
  });

  const classB2 = await prisma.class.create({
    data: {
      name: "Intermediate",
      school_id: schoolB.id,
      teacher_id: teacherB2.id,
    },
  });

  const classC1 = await prisma.class.create({
    data: {
      name: "Level A",
      school_id: schoolC.id,
      teacher_id: teacherC1.id,
    },
  });

  const classC2 = await prisma.class.create({
    data: {
      name: "Level B",
      school_id: schoolC.id,
      teacher_id: teacherC2.id,
    },
  });

  // Create fully assigned students
  await createStudentUser(
    seedUsers.find((u) => u.email === "student1.ayman@platform.com")!,
    StudentOnboardingStatus.CLASS_ASSIGNED,
    schoolA.id,
    classA1.id
  );

  await createStudentUser(
    seedUsers.find((u) => u.email === "student1.omar@platform.com")!,
    StudentOnboardingStatus.CLASS_ASSIGNED,
    schoolB.id,
    classB1.id
  );

  await createStudentUser(
    seedUsers.find((u) => u.email === "student1.manzoma@platform.com")!,
    StudentOnboardingStatus.CLASS_ASSIGNED,
    schoolC.id,
    classC1.id
  );

  // Create onboarding students
  await createStudentUser(
    seedUsers.find((u) => u.email === "pending.intake@platform.com")!,
    StudentOnboardingStatus.PENDING_INTAKE
  );

  await createStudentUser(
    seedUsers.find((u) => u.email === "submitted.intake@platform.com")!,
    StudentOnboardingStatus.INTAKE_SUBMITTED
  );

  await createStudentUser(
    seedUsers.find((u) => u.email === "school.assigned@platform.com")!,
    StudentOnboardingStatus.SCHOOL_ASSIGNED,
    schoolA.id
  );

  await createStudentUser(
    seedUsers.find((u) => u.email === "placement.submitted@platform.com")!,
    StudentOnboardingStatus.SCHOOL_PLACEMENT_SUBMITTED,
    schoolB.id
  );

  console.log("✅ Seed completed successfully!");
  console.log("");
  console.log("Owner:");
  console.log("  owner@platform.com / 12345678");
  console.log("");
  console.log("School admins:");
  console.log("  admin.ayman@platform.com / 12345678");
  console.log("  admin.omar@platform.com / 12345678");
  console.log("  admin.manzoma@platform.com / 12345678");
  console.log("");
  console.log("Teachers:");
  console.log("  teacher1.ayman@platform.com / 12345678");
  console.log("  teacher1.omar@platform.com / 12345678");
  console.log("  teacher1.manzoma@platform.com / 12345678");
  console.log("");
  console.log("Students:");
  console.log("  student1.ayman@platform.com / 12345678");
  console.log("  student1.omar@platform.com / 12345678");
  console.log("  student1.manzoma@platform.com / 12345678");
  console.log("  pending.intake@platform.com / 12345678");
  console.log("  submitted.intake@platform.com / 12345678");
  console.log("  school.assigned@platform.com / 12345678");
  console.log("  placement.submitted@platform.com / 12345678");
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