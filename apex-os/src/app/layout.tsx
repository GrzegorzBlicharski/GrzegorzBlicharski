import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav, MobileTabs } from "@/components/Nav";
import { CommandPalette } from "@/components/CommandPalette";
import { ThemeToggle, THEME_SCRIPT } from "@/components/ThemeToggle";
import { TimerBadge } from "@/components/TimerBadge";
import { activeTimer } from "@/server/active";
import { currentDay } from "@/server/context";
import { getDb } from "@/data/db";

export const metadata: Metadata = {
  title: "APEX OS",
  description: "Personal performance, learning & life intelligence system — local-first.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const t = activeTimer();
  const demo = getDb().prepare("SELECT 1 AS x FROM imports WHERE source = 'fictional-demo' LIMIT 1").get();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <div className="flex min-h-screen">
          <Nav />
          <div className="min-w-0 flex-1">
            <header className="sticky top-0 z-30 flex items-center gap-2 border-b px-4 py-2 backdrop-blur" style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--bg) 85%, transparent)" }}>
              <span className="pl-10 text-sm font-bold tracking-[0.2em] lg:hidden">APEX</span>
              <span className="muted num hidden text-xs sm:inline">{currentDay()}</span>
              {demo && (
                <a href="/data" className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase" style={{ border: "1px solid var(--warn)", color: "var(--warn-ink)" }}>
                  Fictional demo data
                </a>
              )}
              <div className="ml-auto flex items-center gap-2">
                {t && <TimerBadge start={t.start} pausedMinutes={t.pausedMinutes} pausedAt={t.pausedAt} label={`${t.domain} · ${t.activity}`} />}
                <CommandPalette />
                <ThemeToggle />
              </div>
            </header>
            <main className="mx-auto max-w-[1500px] px-4 pb-24 pt-4 lg:pb-10">{children}</main>
          </div>
        </div>
        <MobileTabs />
      </body>
    </html>
  );
}
