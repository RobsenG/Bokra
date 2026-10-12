import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Running seed (safe mode — will NOT wipe existing data)...");

  // Create or upsert Admin
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@bokrastay.com" },
    update: {},
    create: {
      name: "Bokra Admin",
      email: "admin@bokrastay.com",
      password: adminPasswordHash,
      role: "ADMIN",
      isVerified: true,
      termsAcceptedAt: new Date(),
    },
  });
  console.log(`✅ Admin account ensured: ${admin.email}`);

  // Create or upsert Super Admin
  const superAdminPasswordHash = await bcrypt.hash("SuperAdmin@2026", 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@bokrastay.com" },
    update: {},
    create: {
      email: "superadmin@bokrastay.com",
      name: "Bokra Super Admin",
      password: superAdminPasswordHash,
      role: "SUPER_ADMIN",
      isVerified: true,
      termsAcceptedAt: new Date(),
    },
  });
  console.log(`✅ Super Admin account ensured: ${superAdmin.email}`);

  console.log("Database seeding completed successfully! 🎉");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
