import { ProviderSidebar } from "@/components/ProviderSidebar";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <ProviderSidebar role="provider" />
      <div className="flex-1 min-h-screen">{children}</div>
    </div>
  );
}
