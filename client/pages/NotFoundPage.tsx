import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function NotFoundPage() {
  useEffect(() => {
    document.title = "404 — Page Not Found | PaintBookCo";
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-center bg-background">
      <div className="max-w-md">
        <div className="font-display text-7xl text-primary mb-4">404</div>
        <h1 className="font-display text-2xl text-foreground mb-3">
          Page not found
        </h1>
        <p className="text-muted-foreground mb-8 leading-[1.7]">
          Sorry, we could not find that page. It may have moved or the link
          might be incorrect.
        </p>
        <Link
          to="/"
          className="inline-block text-base font-semibold text-primary-foreground bg-primary px-8 py-3 transition-opacity hover:opacity-90"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => {
    Builder.registerComponent(NotFoundPage, {
      name: "NotFoundPage",
      inputs: [],
    });
  })
  .catch(() => {});
