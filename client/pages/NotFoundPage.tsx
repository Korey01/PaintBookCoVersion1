import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function NotFoundPage() {
  useEffect(() => {
    document.title = "404 — Page Not Found | PaintBookCo";
  }, []);

  return (
    <div
      className="flex min-h-screen items-center justify-center px-6 text-center"
      style={{ fontFamily: "Arial, system-ui, sans-serif", backgroundColor: "#f8fafc" }}
    >
      <div className="max-w-md">
        <div
          className="text-7xl font-bold mb-4"
          style={{ color: "#2E75B6" }}
        >
          404
        </div>
        <h1 className="text-2xl font-bold text-[#1B3A5C] mb-3">
          Page not found
        </h1>
        <p className="text-gray-500 mb-8">
          Sorry, we could not find that page. It may have moved or the link
          might be incorrect.
        </p>
        <Link
          to="/"
          className="inline-block text-base font-semibold text-white px-8 py-3 transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#2E75B6", borderRadius: "8px" }}
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
