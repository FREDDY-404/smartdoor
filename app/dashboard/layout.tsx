import SidebarNav from "@/components/dashboard/SidebarNav";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen px-3 py-3 md:px-5 md:py-5">
      <div className="mx-auto grid max-w-[1440px] gap-5 lg:grid-cols-[296px_minmax(0,1fr)]">
        <SidebarNav />
        <div className="min-w-0 space-y-5">{children}</div>
      </div>
    </main>
  );
}
