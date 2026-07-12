import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking and creating Supabase storage buckets via SQL...");
  try {
    // Insert 'documents' bucket
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES ('documents', 'documents', true, null, null)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log("Bucket 'documents' verified/created.");

    // Insert 'properties' bucket
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES ('properties', 'properties', true, null, null)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log("Bucket 'properties' verified/created.");

    // Enable public access policies for storage objects if they don't exist
    console.log("Setting up storage policies...");
    
    // Select policy
    await prisma.$executeRawUnsafe(`
      DROP POLICY IF EXISTS "Allow public select 2026" ON storage.objects;
    `);
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Allow public select 2026" ON storage.objects
        FOR SELECT TO public USING (bucket_id IN ('documents', 'properties'));
    `);
    
    // Insert policy
    await prisma.$executeRawUnsafe(`
      DROP POLICY IF EXISTS "Allow public insert 2026" ON storage.objects;
    `);
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Allow public insert 2026" ON storage.objects
        FOR INSERT TO public WITH CHECK (bucket_id IN ('documents', 'properties'));
    `);

    console.log("Storage policies for 'documents' and 'properties' configured. 🎉");
  } catch (error) {
    console.error("Error setting up storage buckets via SQL:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
