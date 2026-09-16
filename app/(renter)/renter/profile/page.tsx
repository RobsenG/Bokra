import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/common/ProfileForm";

export default async function RenterProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let user = null;
  try {
    user = await prisma.user.findUnique({
      where: { id: session!.user.id },
      select: { name: true, email: true, phone: true, avatar: true, role: true },
    });
  } catch (error) {
    console.error("[DB Error] Could not fetch user:", error);
  }

  if (!user) redirect("/login");

  return (
    <div className="space-y-6 max-w-xl mx-auto py-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8] tracking-tight">Your profile</h1>
        <p className="text-sm text-[#6b5e4e] dark:text-[#8a8278] mt-0.5">
          Manage your details and contact info.
        </p>
      </div>
      <div className="bg-white dark:bg-[#141310] rounded-2xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-sm p-6 sm:p-8">
        <ProfileForm user={{ ...user, role: user.role?.toString() || "RENTER" }} />
      </div>
    </div>
  );
}
