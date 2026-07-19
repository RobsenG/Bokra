import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Running seed (safe mode — will NOT wipe existing data)...");

  // Only create admin if it doesn't already exist
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@bokrastay.com" },
  });

  if (existingAdmin) {
    console.log(`✅ Admin already exists: ${existingAdmin.email} — skipping seed.`);
    return;
  }

  const passwordHash = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Bokra Admin",
      email: "admin@bokrastay.com",
      password: passwordHash,
      role: "ADMIN",
      isVerified: true,
    },
  });

  console.log(`✅ Created Admin: ${admin.email}`);
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
