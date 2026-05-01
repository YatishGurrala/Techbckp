import type { ReactNode } from "react";

import { Footer } from "@/components/marketing/footer";
import { Navbar } from "@/components/marketing/navbar";

type PageShellProps = {
  children: ReactNode;
  footerVariant?: "light" | "dark";
};

export async function PageShell({ children, footerVariant = "light" }: PageShellProps) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer variant={footerVariant} />
    </>
  );
}
