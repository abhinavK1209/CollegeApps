"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, LayoutDashboard, PenLine, School } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Today", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/colleges", label: "Colleges", icon: School },
  { href: "/essays", label: "Essays", icon: PenLine },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="border-border bg-bg-subtle flex shrink-0 border-t md:hidden"
    >
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10.5px]",
              active ? "text-accent" : "text-fg-subtle",
            )}
          >
            <Icon className="size-[18px]" strokeWidth={1.5} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
