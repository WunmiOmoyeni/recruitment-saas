import { Suspense } from "react";
import { Logo } from "@/components/ui";
import { SideNav } from "@/components/side-nav";
import { OrgBadge, UserMenu } from "@/components/app-header";

// Shell for every signed-in page. The navy sidebar and header are static; the
// parts that read the session live in their own <Suspense> boundaries so the
// shell can render instantly (required with `cacheComponents: true`).
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-navy-900 text-navy-100 lg:flex">
        <div className="px-5 py-5">
          <Logo light href="/dashboard" />
        </div>
        <div className="px-3">
          <Suspense fallback={<div className="h-14 rounded-lg bg-navy-800" />}>
            <OrgBadge />
          </Suspense>
        </div>
        <Suspense fallback={null}>
          <SideNav />
        </Suspense>
        <div className="mt-auto border-t border-navy-800 p-4 text-xs text-navy-300">
          Need help? Check the README for setup.
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-navy-100 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-8">
            <div className="lg:hidden">
              <Logo href="/dashboard" />
            </div>
            <div className="hidden text-sm text-navy-400 lg:block">Recruitment workspace</div>
            <Suspense fallback={<div className="h-9 w-40 animate-pulse rounded-lg bg-navy-50" />}>
              <UserMenu />
            </Suspense>
          </div>
          <div className="border-t border-navy-100 bg-navy-900 lg:hidden">
            <Suspense fallback={null}>
              <SideNav mobile />
            </Suspense>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
