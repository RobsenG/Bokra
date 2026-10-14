import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const SECRET = "bokra-migrate-2026-secret";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = new PrismaClient();
  const results: string[] = [];

  try {
    // ── USERS ──────────────────────────────────────────────────────────────
    await prisma.$executeRawUnsafe(`
      INSERT INTO "users" (id, email, name, password, role, phone, avatar, "isVerified", "createdAt", "updatedAt", "selfieUrl", "selfieVerifiedAt", "termsAcceptedAt", "adminVerifiedName", "shortBio", "trustBadge", "trustBadgeAt", "resetToken", "resetTokenExpiry", "emailVerified", image)
      VALUES ('cmuy2kg7c0004rionwfdpiobu','grumayele@gmail.com','Grum Ayele','$2b$10$NNUCy0zKlMu2jWha8lA.r.YgMnxZIXQ3cJD2vvrb4i3jBACgF4Vxe','FINANCE_ADMIN',NULL,NULL,true,'2026-10-07 12:14:03.529','2026-10-07 12:14:03.529',NULL,NULL,'2026-10-07 12:14:03.527',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL)
      ON CONFLICT (id) DO NOTHING
    `);
    await prisma.$executeRawUnsafe(`
      INSERT INTO "users" (id, email, name, password, role, phone, avatar, "isVerified", "createdAt", "updatedAt", "selfieUrl", "selfieVerifiedAt", "termsAcceptedAt", "adminVerifiedName", "shortBio", "trustBadge", "trustBadgeAt", "resetToken", "resetTokenExpiry", "emailVerified", image)
      VALUES ('cmrs2umqt0001prmssrl14y2f','robinsongelana21@gmail.com','Robsen Gelana','$2b$10$rJiiNAOj2unPNXKorQduxOlg6i/fdtvA7XSO0yxzHpT0YeuwnO2eu','HOST','0979049711','https://zzpwospikysdlbucdcia.supabase.co/storage/v1/object/public/avatars/avatars/cmrs2umqt0001prmssrl14y2f-1788114113908-test2-Photoroom.png',true,'2026-07-19 17:36:14.502','2026-10-13 12:38:27.751',NULL,NULL,'2026-09-22 14:24:12.088',NULL,'I am the best host in ethiopia regarding on Homes and apartments','Premium Host','2026-10-12 14:39:07.175',NULL,NULL,NULL,NULL)
      ON CONFLICT (id) DO NOTHING
    `);
    await prisma.$executeRawUnsafe(`
      INSERT INTO "users" (id, email, name, password, role, phone, avatar, "isVerified", "createdAt", "updatedAt", "selfieUrl", "selfieVerifiedAt", "termsAcceptedAt", "adminVerifiedName", "shortBio", "trustBadge", "trustBadgeAt", "resetToken", "resetTokenExpiry", "emailVerified", image)
      VALUES ('cmuxtgrz00001tyoob6ybpc3t','superadmin@bokrastay.com','Bokra Super Admin','$2b$10$9WzNMC99FPyjZ80Hd1OV/OPx/Ps6mcEoC1PykvnujDeM6m9aCAGOW','SUPER_ADMIN',NULL,NULL,true,'2026-10-07 07:59:15.612','2026-10-07 07:59:15.612',NULL,NULL,'2026-10-07 07:59:15.611',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL)
      ON CONFLICT (id) DO NOTHING
    `);
    await prisma.$executeRawUnsafe(`
      INSERT INTO "users" (id, email, name, password, role, phone, avatar, "isVerified", "createdAt", "updatedAt", "selfieUrl", "selfieVerifiedAt", "termsAcceptedAt", "adminVerifiedName", "shortBio", "trustBadge", "trustBadgeAt", "resetToken", "resetTokenExpiry", "emailVerified", image)
      VALUES ('cmrs1qsmq00004ry87npqc0kl','admin@bokrastay.com','Bokra Admin','$2b$10$wgwQaYkHNxJ44s4Z25guyOhBNhNPZNsVX.BC94nFH59esi9kHL4SG','ADMIN',NULL,NULL,true,'2026-07-19 17:05:15.89','2026-10-07 11:31:40.853',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL)
      ON CONFLICT (id) DO NOTHING
    `);
    await prisma.$executeRawUnsafe(`
      INSERT INTO "users" (id, email, name, password, role, phone, avatar, "isVerified", "createdAt", "updatedAt", "selfieUrl", "selfieVerifiedAt", "termsAcceptedAt", "adminVerifiedName", "shortBio", "trustBadge", "trustBadgeAt", "resetToken", "resetTokenExpiry", "emailVerified", image)
      VALUES ('cmrs2q8yw0000prmstrt949cm','robsengelana21@gmail.com','Robinson Gelana','$2b$10$fjzxG6JynI7cGYA37SuJXeSysOZXlvKW26O7GXKg.eyRvD0ry9YHa','RENTER',NULL,NULL,true,'2026-07-19 17:32:50.025','2026-10-07 11:51:36.172',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL)
      ON CONFLICT (id) DO NOTHING
    `);
    await prisma.$executeRawUnsafe(`
      INSERT INTO "users" (id, email, name, password, role, phone, avatar, "isVerified", "createdAt", "updatedAt", "selfieUrl", "selfieVerifiedAt", "termsAcceptedAt", "adminVerifiedName", "shortBio", "trustBadge", "trustBadgeAt", "resetToken", "resetTokenExpiry", "emailVerified", image)
      VALUES ('cmv5drnr80000k8v41mxmykc1','robaghost4@gmail.com','Klopp',NULL,'HOST','0999663322','https://zzpwospikysdlbucdcia.supabase.co/storage/v1/object/public/avatars/avatars/cmv5drnr80000k8v41mxmykc1-1791895568287-jurgen.webp',true,'2026-10-12 15:01:58.916','2026-10-13 12:52:23.691','https://zzpwospikysdlbucdcia.supabase.co/storage/v1/object/public/selfies/cmv5drnr80000k8v41mxmykc1/1791895336890.jpg','2026-10-13 12:42:18.433','2026-10-12 15:02:07.628',NULL,'One Of the biggest Host on this platform',NULL,NULL,NULL,NULL,'https://lh3.googleusercontent.com/a/ACg8ocLGkfxJns9DRR5sRkk_tkC8y9y8Pjknm4H41GVnqrNRuRbSaA=s96-c')
      ON CONFLICT (id) DO NOTHING
    `);
    results.push("✅ 6 users inserted");

    // ── ACCOUNTS ───────────────────────────────────────────────────────────
    await prisma.$executeRawUnsafe(`
      INSERT INTO "accounts" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state)
      VALUES ('cmv5drnsd0002k8v4kxzlibo8','cmv5drnr80000k8v41mxmykc1','oidc','google','108522788053816376489',NULL,NULL,NULL,'bearer','https://www.googleapis.com/auth/userinfo.profile openid https://www.googleapis.com/auth/userinfo.email',NULL,NULL)
      ON CONFLICT (id) DO NOTHING
    `);
    results.push("✅ accounts inserted");

    // ── ADMIN ACCOUNTS ─────────────────────────────────────────────────────
    await prisma.$executeRawUnsafe(`
      INSERT INTO "admin_accounts" (id, "userId", "assignedBy", permissions, "createdAt", "updatedAt")
      VALUES ('cmuy2kg7u0006rionq2ho8ax3','cmuy2kg7c0004rionwfdpiobu','Bokra Super Admin',ARRAY['FINANCE_READ','FINANCE_WRITE'],'2026-10-07 12:14:03.547','2026-10-07 12:14:03.547')
      ON CONFLICT (id) DO NOTHING
    `);
    results.push("✅ admin_accounts inserted");

    // ── ADMIN NOTIFICATIONS ────────────────────────────────────────────────
    await prisma.$executeRawUnsafe(`
      INSERT INTO "admin_notifications" (id, type, message, "isRead", "propertyId", "reportedByUserId", "createdAt")
      VALUES ('cmv5cyg5p00031488a3ag7682','PROPERTY_APPROVED','Property "Villa Near Wachemo University" was approved and published.',true,'cmv5cw7i500011488j17y4p4r',NULL,'2026-10-12 14:39:16.045'),
             ('cmv6o3vy20003lcvd56wt4267','PROPERTY_APPROVED','Property "Gumbora Villa House" was approved and published.',true,'cmv6o29rp0001lcvd53v5pzxg',NULL,'2026-10-13 12:39:11.738'),
             ('cmv6ooth30009lcvd2e2hmdhk','PROPERTY_APPROVED','Property "MAriyam  Apartment" was approved and published.',true,'cmv6of6iv0007lcvd6pk493ly',NULL,'2026-10-13 12:55:28.311')
      ON CONFLICT (id) DO NOTHING
    `);
    results.push("✅ admin_notifications inserted");

    // ── PROPERTIES ─────────────────────────────────────────────────────────
    await prisma.$executeRawUnsafe(`
      INSERT INTO "properties" (id, title, description, address, city, "pricePerNight", bedrooms, bathrooms, "maxGuests", amenities, images, "isVerified", "isAvailable", "hostId", "createdAt", "updatedAt", "rejectionReason", status)
      VALUES ('cmv5cw7i500011488j17y4p4r','Villa Near Wachemo University','Nestled just minutes from Wachemo University, this exquisite villa','Wachemo Road','Hossana',650,4,3,4,ARRAY['Wifi','Water','Light'],ARRAY['https://zzpwospikysdlbucdcia.supabase.co/storage/v1/object/public/property-images/cmrs2umqt0001prmssrl14y2f/1791815848895.avif','https://zzpwospikysdlbucdcia.supabase.co/storage/v1/object/public/property-images/cmrs2umqt0001prmssrl14y2f/1791815849971.avif','https://zzpwospikysdlbucdcia.supabase.co/storage/v1/object/public/property-images/cmrs2umqt0001prmssrl14y2f/1791815850469.avif','https://zzpwospikysdlbucdcia.supabase.co/storage/v1/object/public/property-images/cmrs2umqt0001prmssrl14y2f/1791815850873.avif'],true,true,'cmrs2umqt0001prmssrl14y2f','2026-10-12 14:37:31.517','2026-10-12 14:39:16.035',NULL,'APPROVED'::"PropertyStatus")
      ON CONFLICT (id) DO NOTHING
    `);
    await prisma.$executeRawUnsafe(`
      INSERT INTO "properties" (id, title, description, address, city, "pricePerNight", bedrooms, bathrooms, "maxGuests", amenities, images, "isVerified", "isAvailable", "hostId", "createdAt", "updatedAt", "rejectionReason", status)
      VALUES ('cmv6o29rp0001lcvd53v5pzxg','Gumbora Villa House','Welcome to Gumbora Villa House, a luxurious retreat nestled in the heart of Ethiopia.','Eyerus Alem Square','Hossana',800,4,3,4,ARRAY['Wifi','Genarator','Backyard'],ARRAY['https://zzpwospikysdlbucdcia.supabase.co/storage/v1/object/public/property-images/cmrs2umqt0001prmssrl14y2f/1791895071579.avif','https://zzpwospikysdlbucdcia.supabase.co/storage/v1/object/public/property-images/cmrs2umqt0001prmssrl14y2f/1791895073140.avif','https://zzpwospikysdlbucdcia.supabase.co/storage/v1/object/public/property-images/cmrs2umqt0001prmssrl14y2f/1791895073710.avif','https://zzpwospikysdlbucdcia.supabase.co/storage/v1/object/public/property-images/cmrs2umqt0001prmssrl14y2f/1791895074351.avif','https://zzpwospikysdlbucdcia.supabase.co/storage/v1/object/public/property-images/cmrs2umqt0001prmssrl14y2f/1791895075389.avif'],true,true,'cmrs2umqt0001prmssrl14y2f','2026-10-13 12:37:56.34','2026-10-13 12:39:11.69',NULL,'APPROVED'::"PropertyStatus")
      ON CONFLICT (id) DO NOTHING
    `);
    await prisma.$executeRawUnsafe(`
      INSERT INTO "properties" (id, title, description, address, city, "pricePerNight", bedrooms, bathrooms, "maxGuests", amenities, images, "isVerified", "isAvailable", "hostId", "createdAt", "updatedAt", "rejectionReason", status)
      VALUES ('cmv6of6iv0007lcvd6pk493ly','MAriyam  Apartment','Welcome to MAriyam Church Apartment! Located in a pleasant neighbourhood.','MAriyam Chruch','Hossana',650,3,3,3,ARRAY['Wifi','Water','Light'],ARRAY['https://zzpwospikysdlbucdcia.supabase.co/storage/v1/object/public/property-images/cmv5drnr80000k8v41mxmykc1/1791895674728.avif','https://zzpwospikysdlbucdcia.supabase.co/storage/v1/object/public/property-images/cmv5drnr80000k8v41mxmykc1/1791895676067.avif','https://zzpwospikysdlbucdcia.supabase.co/storage/v1/object/public/property-images/cmv5drnr80000k8v41mxmykc1/1791895677307.avif','https://zzpwospikysdlbucdcia.supabase.co/storage/v1/object/public/property-images/cmv5drnr80000k8v41mxmykc1/1791895677747.avif','https://zzpwospikysdlbucdcia.supabase.co/storage/v1/object/public/property-images/cmv5drnr80000k8v41mxmykc1/1791895678135.avif'],true,true,'cmv5drnr80000k8v41mxmykc1','2026-10-13 12:47:58.663','2026-10-13 12:55:28.052',NULL,'APPROVED'::"PropertyStatus")
      ON CONFLICT (id) DO NOTHING
    `);
    results.push("✅ 3 properties inserted");

    // ── BOOKINGS ───────────────────────────────────────────────────────────
    await prisma.$executeRawUnsafe(`
      INSERT INTO "bookings" (id, "checkIn", "checkOut", "totalPrice", status, "renterId", "propertyId", "createdAt")
      VALUES ('cmv5czw4900051488ydlzrlzv','2026-10-13 00:00:00','2026-10-17 00:00:00',2600,'CONFIRMED'::"BookingStatus",'cmrs2q8yw0000prmstrt949cm','cmv5cw7i500011488j17y4p4r','2026-10-12 14:40:23.385')
      ON CONFLICT (id) DO NOTHING
    `);
    results.push("✅ 1 booking inserted");

    // ── DOCUMENTS ──────────────────────────────────────────────────────────
    await prisma.$executeRawUnsafe(`
      INSERT INTO "documents" (id, type, "fileUrl", status, "uploadedAt", "userId", "propertyId") VALUES
      ('cmrs2vdse0003prms1hphckn9','ID_CARD'::"DocumentType",'https://zzpwospikysdlbucdcia.supabase.co/storage/v1/object/public/documents/documents/cmrs2umqt0001prmssrl14y2f/ID_CARD-1784482608121-20260531_172347_optimized_250.jpg','APPROVED'::"DocumentStatus",'2026-07-19 17:36:49.55','cmrs2umqt0001prmssrl14y2f',NULL),
      ('cmv5cw7ip00021488lj6ngkqq','OWNERSHIP_PROOF'::"DocumentType",'https://zzpwospikysdlbucdcia.supabase.co/storage/v1/object/public/property-documents/host/1791815833343.pdf','APPROVED'::"DocumentStatus",'2026-10-12 14:37:31.538','cmrs2umqt0001prmssrl14y2f','cmv5cw7i500011488j17y4p4r'),
      ('cmv6o29u60002lcvdh6o0pfob','OWNERSHIP_PROOF'::"DocumentType",'https://zzpwospikysdlbucdcia.supabase.co/storage/v1/object/public/property-documents/host/1791895053023.pdf','APPROVED'::"DocumentStatus",'2026-10-13 12:37:56.431','cmrs2umqt0001prmssrl14y2f','cmv6o29rp0001lcvd53v5pzxg'),
      ('cmv6o8k4k0005lcvdl47yd00z','ID_CARD'::"DocumentType",'https://zzpwospikysdlbucdcia.supabase.co/storage/v1/object/public/documents/cmv5drnr80000k8v41mxmykc1/1791895363720.jpg','APPROVED'::"DocumentStatus",'2026-10-13 12:42:49.7','cmv5drnr80000k8v41mxmykc1',NULL),
      ('cmv6of6ki0008lcvdd42ysue5','OWNERSHIP_PROOF'::"DocumentType",'https://zzpwospikysdlbucdcia.supabase.co/storage/v1/object/public/property-documents/host/1791895669122.pdf','APPROVED'::"DocumentStatus",'2026-10-13 12:47:58.722','cmv5drnr80000k8v41mxmykc1','cmv6of6iv0007lcvd6pk493ly')
      ON CONFLICT (id) DO NOTHING
    `);
    results.push("✅ 5 documents inserted");

    // ── PAYMENTS ───────────────────────────────────────────────────────────
    await prisma.$executeRawUnsafe(`
      INSERT INTO "payments" (id, "bookingId", amount, currency, status, "chapaReference", "createdAt")
      VALUES ('cmv5d05z800071488qdvvmn4s','cmv5czw4900051488ydlzrlzv',2600,'ETB','SUCCESS'::"PaymentStatus",'booking-cmv5czw4900051488ydlzrlzv','2026-10-12 14:40:36.164')
      ON CONFLICT (id) DO NOTHING
    `);
    results.push("✅ 1 payment inserted");

    // ── REVIEWS ────────────────────────────────────────────────────────────
    await prisma.$executeRawUnsafe(`
      INSERT INTO "reviews" (id, rating, comment, "createdAt", "renterId", "propertyId")
      VALUES ('cmv5d0rn500091488vv1v4ezy',5,'What A place Recommed for every one','2026-10-12 14:41:04.242','cmrs2q8yw0000prmstrt949cm','cmv5cw7i500011488j17y4p4r')
      ON CONFLICT (id) DO NOTHING
    `);
    results.push("✅ 1 review inserted");

    // ── WITHDRAWAL REQUESTS ────────────────────────────────────────────────
    await prisma.$executeRawUnsafe(`
      INSERT INTO "withdrawal_requests" (id, "hostId", amount, "accountType", "accountNumber", "accountName", status, "chapaReference", note, "createdAt", "processedAt", "netAmount", "platformFee") VALUES
      ('cms23qxmo000311pob07q3i3p','cmrs2umqt0001prmssrl14y2f',2000,'telebirr','0966332255','Robsen','PROCESSING'::"WithdrawalStatus",'transfer-1785088743358-273','Monthly payout','2026-07-26 17:59:03.36',NULL,0,0),
      ('cmtg4nxyt000527rvn6c3q89e','cmrs2umqt0001prmssrl14y2f',1000,'telebirr','0979049711','Roba','COMPLETED'::"WithdrawalStatus",'BOKRA-WD-1788113592241',NULL,'2026-08-30 18:13:12.245','2026-08-30 18:13:12.243',970,30),
      ('cmutqgwhb0005itcjrkh8y00y','cmrs2umqt0001prmssrl14y2f',1000,'bank','10256865386','Abebe','COMPLETED'::"WithdrawalStatus",'BOKRA-WD-1791113057901','dasfa','2026-10-04 11:24:17.903','2026-10-04 11:24:17.902',970,30)
      ON CONFLICT (id) DO NOTHING
    `);
    results.push("✅ 3 withdrawal_requests inserted");

    return NextResponse.json({ success: true, results });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg, results }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
