import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "robinsongelana21@gmail.com";
  const password = "Admin@123";
  const role = "HOST"; // Changed to HOST per user request

  console.log(`Checking if user ${email} exists...`);
  
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log(`User ${email} already exists! Updating password...`);
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { password: passwordHash, role, isVerified: true },
    });
    console.log(`Password updated successfully.`);
  } else {
    console.log(`Creating user ${email}...`);
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name: "Robinson Gelana",
        email,
        password: passwordHash,
        role,
        isVerified: true,
      },
    });
    console.log(`User created successfully as ADMIN. 🎉`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
