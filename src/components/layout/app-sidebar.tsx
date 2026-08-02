"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  FileText,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  Mail,
  PenLine,
  School,
  Settings,
  Trophy,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  /** Not yet built — rendered but visibly inert rather than 404ing. */
  soon?: boolean;
}

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Plan",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, soon: true },
      { href: "/calendar", label: "Calendar", icon: CalendarDays, soon: true },
      { href: "/tasks", label: "Tasks", icon: CheckSquare, soon: true },
    ],
  },
  {
    title: "Apply",
    items: [
      { href: "/colleges", label: "Colleges", icon: School },
      { href: "/applications", label: "My list", icon: GraduationCap },
      { href: "/essays", label: "Essays", icon: PenLine, soon: true },
      { href: "/recommendations", label: "Recommendations", icon: Mail, soon: true },
    ],
  },
  {
    title: "Money",
    items: [
      { href: "/financial-aid", label: "Financial aid", icon: Landmark, soon: true },
      { href: "/scholarships", label: "Scholarships", icon: Trophy, soon: true },
    ],
  },
  {
    title: "Library",
    items: [
      { href: "/documents", label: "Documents", icon: FileText, soon: true },
      { href: "/analytics", label: "Analytics", icon: BarChart3, soon: true },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="border-border bg-bg-subtle hidden w-[248px] shrink-0 flex-col border-r md:flex"
    >
      <div className="px-5 py-5">
        <Link href="/colleges" className="flex items-center gap-2.5">
          <span className="bg-accent text-accent-fg grid size-7 place-items-center rounded-[8px] text-[13px] font-bold">
            S
          </span>
          <span className="text-fg text-[15px] font-semibold tracking-[-0.01em]">
            Sequence
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {SECTIONS.map((section) => (
          <div key={section.title} className="mb-5">
            <p className="text-fg-subtle px-2.5 pb-1.5 text-[11px] font-semibold tracking-[0.06em] uppercase">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon, soon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <li key={href}>
                    {soon ? (
                      <span
                        aria-disabled
                        title="Coming in a later phase"
                        className="text-fg-subtle flex cursor-default items-center gap-2.5 rounded-[8px] px-2.5 py-1.5 text-[13.5px]"
                      >
                        <Icon className="size-4 shrink-0" strokeWidth={1.5} />
                        {label}
                      </span>
                    ) : (
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-2.5 rounded-[8px] px-2.5 py-1.5 text-[13.5px] transition-colors duration-100",
                          active
                            ? "bg-accent-subtle text-accent font-medium"
                            : "text-fg-muted hover:bg-surface-raised hover:text-fg",
                        )}
                      >
                        <Icon className="size-4 shrink-0" strokeWidth={1.5} />
                        {label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-border border-t p-3">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13.5px] transition-colors duration-100",
            pathname === "/profile"
              ? "bg-accent-subtle text-accent font-medium"
              : "text-fg-muted hover:bg-surface-raised hover:text-fg",
          )}
        >
          <User className="size-4" strokeWidth={1.5} />
          Profile
        </Link>
        <span className="text-fg-subtle flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13.5px]">
          <Settings className="size-4" strokeWidth={1.5} />
          Settings
        </span>
      </div>
    </nav>
  );
}
