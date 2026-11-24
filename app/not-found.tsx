import Link from "next/link";
import { Logo, ui } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <Logo />
      <p className="text-7xl font-bold text-teal-500">404</p>
      <div>
        <h1 className="text-xl font-semibold text-navy-900">Page not found</h1>
        <p className="mt-1 text-sm text-navy-500">This page doesn&apos;t exist, or it isn&apos;t available any more.</p>
      </div>
      <Link href="/" className={ui.btnNavy}>Go home</Link>
    </div>
  );
}
