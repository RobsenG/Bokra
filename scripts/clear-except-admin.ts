import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing non-admin users and their data...");
  try {
    // 1. Delete all favorites, reviews, payments, bookings, documents, properties
    await prisma.favorite.deleteMany();
    console.log("All favorites deleted.");

    await prisma.review.deleteMany();
    console.log("All reviews deleted.");

    await prisma.payment.deleteMany();
    console.log("All payments deleted.");

    await prisma.booking.deleteMany();
    console.log("All bookings deleted.");

    await prisma.document.deleteMany();
    console.log("All documents deleted.");

    await prisma.property.deleteMany();
    console.log("All properties deleted.");

    // 2. Delete all users except ADMINs
    const { count } = await prisma.user.deleteMany({
      where: {
        role: {
          not: "ADMIN",
        },
      },
    });
    console.log(`Deleted ${count} non-admin users.`);

    // 3. Confirm only ADMINs remain
    const remainingUsers = await prisma.user.findMany();
    console.log("Remaining users in database:", remainingUsers.map(u => ({ email: u.email, role: u.role })));

    console.log("Database cleared successfully! Only Admin accounts remain. 🎉");
  } catch (error) {
    console.error("Error clearing database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
