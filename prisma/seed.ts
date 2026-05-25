import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean up existing data (optional, be careful in production!)
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.document.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: "Bokra Admin",
      email: "admin@bokrastay.com",
      password: passwordHash,
      role: "ADMIN",
      isVerified: true,
    },
  });

  console.log(`Created Admin: ${admin.email}`);

  // 2. Create Hosts
  const host1 = await prisma.user.create({
    data: {
      name: "Abebe Bekele",
      email: "abebe@example.com",
      password: passwordHash,
      role: "HOST",
      isVerified: true,
    },
  });

  const host2 = await prisma.user.create({
    data: {
      name: "Sara Hailu",
      email: "sara@example.com",
      password: passwordHash,
      role: "HOST",
      isVerified: true,
    },
  });

  console.log(`Created Hosts: ${host1.email}, ${host2.email}`);

  // 3. Create Renters
  const renter1 = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john@example.com",
      password: passwordHash,
      role: "RENTER",
      isVerified: true,
    },
  });

  console.log(`Created Renter: ${renter1.email}`);

  // 4. Create Properties (Hossana and Addis Ababa)
  const prop1 = await prisma.property.create({
    data: {
      title: "Cozy Villa in Hossana",
      description: "A beautiful and quiet villa located in the heart of Hossana. Perfect for family getaways and peaceful retreats.",
      address: "Menaheria Area",
      city: "Hossana",
      pricePerNight: 45.0,
      bedrooms: 3,
      bathrooms: 2,
      maxGuests: 6,
      amenities: ["WiFi", "Free Parking", "Kitchen", "Washer"],
      images: [
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      ],
      isVerified: true,
      isAvailable: true,
      hostId: host1.id,
    },
  });

  const prop2 = await prisma.property.create({
    data: {
      title: "Modern Apartment near Wachemo University",
      description: "Modern, fully furnished apartment within walking distance to Wachemo University main campus.",
      address: "University Road",
      city: "Hossana",
      pricePerNight: 25.0,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      amenities: ["WiFi", "TV", "Workspace"],
      images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      ],
      isVerified: true,
      isAvailable: true,
      hostId: host2.id,
    },
  });

  const prop3 = await prisma.property.create({
    data: {
      title: "Luxury Condo in Addis Ababa",
      description: "Stunning views from this high-rise luxury condo in Bole.",
      address: "Bole Road",
      city: "Addis Ababa",
      pricePerNight: 120.0,
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 4,
      amenities: ["WiFi", "Gym", "Pool", "Free Parking"],
      images: [
        "https://images.unsplash.com/photo-1502672260266-1c1e52db06ac?w=800&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      ],
      isVerified: true,
      isAvailable: true,
      hostId: host1.id,
    },
  });

  console.log(`Created Properties: ${prop1.title}, ${prop2.title}, ${prop3.title}`);

  // 5. Create Bookings
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const nextWeekPlus3 = new Date(nextWeek);
  nextWeekPlus3.setDate(nextWeek.getDate() + 3);

  const booking1 = await prisma.booking.create({
    data: {
      checkIn: nextWeek,
      checkOut: nextWeekPlus3,
      totalPrice: Number(prop1.pricePerNight) * 3,
      status: "CONFIRMED",
      renterId: renter1.id,
      propertyId: prop1.id,
    },
  });

  console.log(`Created Booking for ${renter1.name} at ${prop1.title}`);

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
