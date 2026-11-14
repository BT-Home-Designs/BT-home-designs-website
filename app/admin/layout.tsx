import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quote Dashboard",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-[#f4f1ea]">{children}</div>;
}
