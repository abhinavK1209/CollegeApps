import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandPalette } from "@/components/command/command-palette";
import { SearchTrigger } from "@/components/command/search-trigger";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border flex h-14 shrink-0 items-center justify-between border-b px-5">
          <span className="text-fg text-[14px] font-semibold md:hidden">Sequence</span>
          <SearchTrigger />
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
        <MobileNav />
      </div>
      <CommandPalette />
    </div>
  );
}
