import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/common/ProfileForm";
import Link from "next/link";
import { ArrowRight, Camera, ShieldCheck } from "lucide-react";

export default async function HostProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let user = null;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isVerified: true,
        selfieUrl: true,
        selfieVerifiedAt: true,
        shortBio: true,
        trustBadge: true,
      },
    });
  } catch (error) {
    console.error("[DB Error] Could not fetch user profile:", error);
  }

  if (!user) redirect("/login");

  const hasSelfie = !!user.selfieUrl;

  return (
    <div className="space-y-6 max-w-xl font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-800 dark:text-white tracking-tight">Your profile</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Manage your details, bio, and avatar.
        </p>
      </div>

      {/* Identity Verification Status Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-xs p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-[#7c3aed]" />
            <h2 className="font-bold text-neutral-800 dark:text-white text-sm">Identity verification</h2>
          </div>
          <Link
            href="/host/verification"
            className="text-xs font-semibold text-[#7c3aed] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Verify now</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            {hasSelfie && user.selfieUrl ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#7c3aed] shrink-0 bg-neutral-900">
                <img src={user.selfieUrl} alt="Identity Selfie" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Camera className="size-5" />
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                {hasSelfie ? "Selfie uploaded" : "Selfie needed"}
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                {hasSelfie
                  ? `Selfie recorded on ${new Date(user.selfieVerifiedAt || Date.now()).toLocaleDateString()}`
                  : "Take a selfie to get verified."}
              </p>
            </div>
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
              user.isVerified
                ? "bg-purple-50 text-[#7c3aed] border border-purple-200"
                : hasSelfie
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {user.isVerified ? "Verified Host" : hasSelfie ? "Under Review" : "Unverified"}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-xs p-6 sm:p-8">
        <ProfileForm user={{ ...user, role: user.role?.toString() || "HOST" }} />
      </div>
    </div>
  );
}
