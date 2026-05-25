import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-background px-6">
        <div className="font-bold text-xl">Admin Dashboard</div>
      </header>
      <main className="flex-1 bg-muted/20 p-6">{children}</main>
    </div>
  );
}
