import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database for Phase 7...");

  // Clean up existing data to avoid conflicts
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.document.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Admin@123", 10);

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

  // 2. Create 2 Hosts
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

  // 3. Create 5 Renters
  const renters = [];
  const renterData = [
    { name: "John Doe", email: "john@example.com" },
    { name: "Mary Smith", email: "mary@example.com" },
    { name: "David Jones", email: "david@example.com" },
    { name: "Martha Bekele", email: "martha@example.com" },
    { name: "Samuel Girma", email: "samuel@example.com" },
  ];

  for (const r of renterData) {
    const renter = await prisma.user.create({
      data: {
        name: r.name,
        email: r.email,
        password: passwordHash,
        role: "RENTER",
        isVerified: true,
      },
    });
    renters.push(renter);
  }
  console.log(`Created ${renters.length} Renters: ${renters.map(r => r.email).join(", ")}`);

  // 4. Create 3 Properties for Host 1
  const propH1_1 = await prisma.property.create({
    data: {
      title: "Cozy Villa in Hossana",
      description: "A beautiful and quiet villa located in the heart of Hossana. Perfect for family getaways and peaceful retreats.",
      address: "Menaheria Area",
      city: "Hossana",
      pricePerNight: 2400.00,
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

  const propH1_2 = await prisma.property.create({
    data: {
      title: "Modern Apartment near Wachemo University",
      description: "Modern, fully furnished apartment within walking distance to Wachemo University main campus in Hossana.",
      address: "University Road",
      city: "Hossana",
      pricePerNight: 1200.00,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      amenities: ["WiFi", "TV", "Workspace", "Hot Water"],
      images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      ],
      isVerified: true,
      isAvailable: true,
      hostId: host1.id,
    },
  });

  const propH1_3 = await prisma.property.create({
    data: {
      title: "Traditional Cottage in Addis Ababa",
      description: "Experience the unique charm of a traditional stone cottage nestled in a quiet green neighborhood in Addis Ababa.",
      address: "Lamberet Area",
      city: "Addis Ababa",
      pricePerNight: 1800.00,
      bedrooms: 2,
      bathrooms: 1,
      maxGuests: 4,
      amenities: ["Free Parking", "Garden", "Kitchen", "Security"],
      images: [
        "https://images.unsplash.com/photo-1549693578-d683be217e58?w=800&q=80",
      ],
      isVerified: true,
      isAvailable: true,
      hostId: host1.id,
    },
  });

  // Create 3 Properties for Host 2
  const propH2_1 = await prisma.property.create({
    data: {
      title: "Luxury Condo in Bole",
      description: "Stunning high-rise luxury condo in the center of Bole, Addis Ababa. Close to restaurants, malls, and the airport.",
      address: "Bole Road",
      city: "Addis Ababa",
      pricePerNight: 4500.00,
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 4,
      amenities: ["WiFi", "Gym", "Pool", "Elevator", "24/7 Security"],
      images: [
        "https://images.unsplash.com/photo-1502672260266-1c1e52db06ac?w=800&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      ],
      isVerified: true,
      isAvailable: true,
      hostId: host2.id,
    },
  });

  const propH2_2 = await prisma.property.create({
    data: {
      title: "Lake Breeze Villa in Hawassa",
      description: "An elegant lakeside villa offering premium comfort and spectacular sunset views over Lake Hawassa.",
      address: "Lake Road",
      city: "Hawassa",
      pricePerNight: 3500.00,
      bedrooms: 4,
      bathrooms: 3,
      maxGuests: 8,
      amenities: ["WiFi", "Balcony", "Garden", "Lake Access", "Free Parking"],
      images: [
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
      ],
      isVerified: true,
      isAvailable: true,
      hostId: host2.id,
    },
  });

  const propH2_3 = await prisma.property.create({
    data: {
      title: "Lakeside Studio in Hawassa",
      description: "A cozy and compact studio apartment perfect for couples or solo travelers looking to explore Hawassa.",
      address: "Piazza Area",
      city: "Hawassa",
      pricePerNight: 1500.00,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      amenities: ["WiFi", "Kitchen", "Hot Water"],
      images: [
        "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&q=80",
      ],
      isVerified: true,
      isAvailable: true,
      hostId: host2.id,
    },
  });
  console.log(`Created 6 verified properties (3 for each host) across Hossana, Addis Ababa, and Hawassa.`);

  // 5. Create Bookings & Reviews
  const today = new Date();

  // Booking 1: Renter 1 (John) completed booking at Cozy Villa in Hossana
  const checkIn1 = new Date(today);
  checkIn1.setDate(today.getDate() - 10);
  const checkOut1 = new Date(today);
  checkOut1.setDate(today.getDate() - 6);

  const booking1 = await prisma.booking.create({
    data: {
      checkIn: checkIn1,
      checkOut: checkOut1,
      totalPrice: Number(propH1_1.pricePerNight) * 4,
      status: "COMPLETED",
      renterId: renters[0].id,
      propertyId: propH1_1.id,
    },
  });

  // Create Review for Booking 1
  await prisma.review.create({
    data: {
      rating: 5,
      comment: "Absolutely amazing stay! The villa was extremely clean, quiet, and Abebe was a fantastic host.",
      renterId: renters[0].id,
      propertyId: propH1_1.id,
    },
  });

  // Booking 2: Renter 2 (Mary) completed booking at Luxury Condo in Bole
  const checkIn2 = new Date(today);
  checkIn2.setDate(today.getDate() - 8);
  const checkOut2 = new Date(today);
  checkOut2.setDate(today.getDate() - 5);

  const booking2 = await prisma.booking.create({
    data: {
      checkIn: checkIn2,
      checkOut: checkOut2,
      totalPrice: Number(propH2_1.pricePerNight) * 3,
      status: "COMPLETED",
      renterId: renters[1].id,
      propertyId: propH2_1.id,
    },
  });

  // Create Review for Booking 2
  await prisma.review.create({
    data: {
      rating: 4,
      comment: "Very luxurious and centrally located in Bole. Lots of great cafes nearby.",
      renterId: renters[1].id,
      propertyId: propH2_1.id,
    },
  });

  // Booking 3: Renter 3 (David) confirmed booking at Lake Breeze Villa in Hawassa
  const checkIn3 = new Date(today);
  checkIn3.setDate(today.getDate() + 2);
  const checkOut3 = new Date(today);
  checkOut3.setDate(today.getDate() + 5);

  await prisma.booking.create({
    data: {
      checkIn: checkIn3,
      checkOut: checkOut3,
      totalPrice: Number(propH2_2.pricePerNight) * 3,
      status: "CONFIRMED",
      renterId: renters[2].id,
      propertyId: propH2_2.id,
    },
  });

  // Booking 4: Renter 4 (Martha) pending booking at Lakeside Studio in Hawassa
  const checkIn4 = new Date(today);
  checkIn4.setDate(today.getDate() + 10);
  const checkOut4 = new Date(today);
  checkOut4.setDate(today.getDate() + 12);

  await prisma.booking.create({
    data: {
      checkIn: checkIn4,
      checkOut: checkOut4,
      totalPrice: Number(propH2_3.pricePerNight) * 2,
      status: "PENDING",
      renterId: renters[3].id,
      propertyId: propH2_3.id,
    },
  });

  console.log("Seeded sample bookings and reviews successfully!");
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
