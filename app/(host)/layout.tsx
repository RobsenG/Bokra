import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "HOST" && session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-background px-6">
        <div className="font-bold text-xl">Host Dashboard</div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
