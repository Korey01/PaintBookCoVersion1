import { PropsWithChildren } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";

export default function Layout({ children }: PropsWithChildren) {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  return (
    <div className="min-h-screen relative text-foreground">
      {isHome && (
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2Feedf4463914f4f429c364db4882898f1?format=webp&width=2000"
            alt=""
            className="h-full w-full object-cover -scale-x-100 opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20" />
        </div>
      )}
      {!isHome && (
        <div aria-hidden className="fixed inset-0 -z-10 bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--muted))]" />
      )}
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
