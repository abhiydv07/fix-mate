import { ProviderSidebar } from "@/components/ProviderSidebar";
import { ProviderMobileNav } from "@/components/ProviderMobileNav";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <ProviderSidebar role="provider" />
      <div className="flex-1 min-h-screen pb-20 md:pb-0">{children}</div>
      <ProviderMobileNav />
    </div>
  );
}
