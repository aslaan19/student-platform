generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

enum UserRole {
  ADMIN
  TEACHER
  STUDENT
}

model Profile {
  id        String    @id @db.Uuid
  role      UserRole
  fullName  String?
  createdAt DateTime  @default(now())

  teacher   Teacher?
  student   Student?

  @@map("profiles")
}

model Teacher {
  id        String    @id @default(uuid()) @db.Uuid
  profileId String    @unique @db.Uuid
  createdAt DateTime  @default(now())

  profile   Profile   @relation(fields: [profileId], references: [id], onDelete: Cascade)
  classes   Class[]

  @@map("teachers")
}

model Student {
  id        String    @id @default(uuid()) @db.Uuid
  profileId String    @unique @db.Uuid
  classId   String?   @db.Uuid
  createdAt DateTime  @default(now())

  profile   Profile   @relation(fields: [profileId], references: [id], onDelete: Cascade)
  class     Class?    @relation(fields: [classId], references: [id], onDelete: SetNull)

  @@map("students")
}

model Class {
  id        String    @id @default(uuid()) @db.Uuid
  name      String
  teacherId String    @db.Uuid
  createdAt DateTime  @default(now())

  teacher   Teacher   @relation(fields: [teacherId], references: [id], onDelete: Restrict)
  students  Student[]

  @@map("classes")
}