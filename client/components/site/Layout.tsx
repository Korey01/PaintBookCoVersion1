import { PropsWithChildren } from "react";
import type { PropsWithChildren } from "react";

import Header from "./Header";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTurn from "./PageTurn";

export default function Layout({ children }: PropsWithChildren) {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isFind = pathname.startsWith("/find-painter");
  return (
    <div className="relative flex min-h-screen flex-col text-foreground">
      {isHome && (
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <video
            className="h-full w-full object-cover opacity-40 blur-[1px] saturate-50 scale-105"
            autoPlay
            muted
            loop
            playsInline
            src="https://cdn.builder.io/o/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F2ba0324a63604c4fb1cddfae4fa8a84d?alt=media&token=8b7a4306-e600-43b0-8a83-ff8152892c2d&apiKey=4d3ba4dca12d422aaa4ee4ceafe37a1f"
          />
          <div className="absolute inset-0 bg-white/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20" />
        </div>
      )}
      {isFind && !isHome && (
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2Feedf4463914f4f429c364db4882898f1?format=webp&width=2000"
            alt=""
            className="h-full w-full object-cover -scale-x-100 opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/70 to-transparent" />
        </div>
      )}
      {!isHome && !isFind && (
        <div aria-hidden className="fixed inset-0 -z-10 bg-white/75" />
      )}
      <Header />
      {/* Perspective container for book-like page turns */}
      <div style={{ perspective: "1200px" }}>
        <AnimatePresence mode="wait">
          <PageTurn routeKey={pathname}>
            <main className="flex-1">{children}</main>
          </PageTurn>
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
}
