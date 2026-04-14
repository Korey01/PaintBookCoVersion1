import { Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";

export default function NotFoundPage() {
  useEffect(() => { document.title = "404 — Page Not Found | PaintBookCo"; }, []);

  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-center bg-background">
      <div className="max-w-md animate-editorial-up" style={{ animationFillMode: "both" }}>
        <p className="editorial-label text-primary mb-4">404</p>
        <h1 className="font-display text-foreground mb-4">Page not found</h1>
        <p className="text-muted-foreground leading-[1.8] mb-10">
          Sorry, we could not find that page. It may have moved or the link might be incorrect.
        </p>
        <Link
          to="/"
          className="group inline-flex items-center gap-2 bg-foreground text-background font-medium px-8 py-4 transition-all duration-200 hover:bg-foreground/85 hover:scale-[1.02]"
        >
          Go to Homepage
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => { Builder.registerComponent(NotFoundPage, { name: "NotFoundPage", inputs: [] }); })
  .catch(() => {});
