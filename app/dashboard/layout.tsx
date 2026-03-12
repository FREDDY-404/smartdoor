import SidebarNav from "@/components/dashboard/SidebarNav";
import HeaderBar from "@/components/dashboard/HeaderBar";
import { requireAdmin } from "@/lib/auth";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();
  const userLabel = user.email ?? "Admin";

  return (
    <main className="min-h-screen px-3 py-3 md:px-5 md:py-5">
      <div className="mx-auto grid max-w-[1440px] gap-5 lg:grid-cols-[296px_minmax(0,1fr)]">
        <SidebarNav />
        <div className="space-y-5">
          <HeaderBar
            title="Smart Door Operations"
            description="Live administration for device status, event monitoring, RFID access, and security review."
            userLabel={userLabel}
          />
          {children}
        </div>
      </div>
    </main>
  );
}
