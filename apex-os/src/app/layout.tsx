import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav, MobileTabs } from "@/components/Nav";
import { CommandPalette } from "@/components/CommandPalette";
import { ThemeToggle, THEME_SCRIPT } from "@/components/ThemeToggle";
import { TimerBadge } from "@/components/TimerBadge";
import { activeTimer } from "@/server/active";
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
        <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" /><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" />
      </head>
      <body>
        <div className="flex min-h-screen">
          <Nav />
          <div className="min-w-0 flex-1">
            <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 backdrop-blur-md lg:px-8" style={{ background: "color-mix(in srgb, var(--bg) 80%, transparent)" }}>
              <span className="pl-10 text-[13px] font-bold tracking-[0.14em] lg:hidden">APEX</span>
              {demo && (
                <a href="/data#demo" className="rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold" style={{ background: "var(--warn-soft)", color: "var(--warn-ink)" }}>
                  Demo data
                </a>
              )}
              <div className="ml-auto flex items-center gap-2">
                {t && <TimerBadge start={t.start} pausedMinutes={t.pausedMinutes} pausedAt={t.pausedAt} label={`${t.domain} · ${t.activity}`} />}
                <CommandPalette />
                <ThemeToggle />
              </div>
            </header>
            <main className="mx-auto max-w-[1440px] px-4 pb-28 pt-2 lg:px-8 lg:pb-12">{children}</main>
          </div>
        </div>
        <MobileTabs />
      </body>
    </html>
  );
}
