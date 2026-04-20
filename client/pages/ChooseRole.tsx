import { Link } from "react-router-dom";
import { ArrowRight, Users, Briefcase } from "lucide-react";

const LOGO = "https://cdn.builder.io/api/v1/image/assets%2F14c4faafcca042659116108680661770%2F30b601eb466f425b8151484359ee8820?format=webp&width=800&height=1200";

export default function ChooseRole() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-5 border-b border-border">
        <a href="/">
          <img src={LOGO} alt="PaintBookCo" className="h-8 object-contain" />
        </a>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold tracking-tight mb-4">Welcome to PaintBookCo</h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Choose your path below. Whether you're looking for a professional decorator or you are one, we've got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Find a Decorator */}
            <Link
              to="/post-job"
              className="group block p-8 border border-border rounded-lg hover:border-foreground/40 hover:bg-accent transition-all duration-200 space-y-4"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">Find a Decorator</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Post your painting or decorating job for free and get quotes from verified professionals in your area.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-foreground group-hover:gap-3 transition-all">
                Post a Job <ArrowRight className="h-4 w-4" />
              </div>
            </Link>

            {/* Join as a Decorator */}
            <Link
              to="/join-decorator"
              className="group block p-8 border border-border rounded-lg hover:border-foreground/40 hover:bg-accent transition-all duration-200 space-y-4"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">Join as a Decorator</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Grow your business by joining our marketplace. Get matched with verified jobs and get paid securely.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-foreground group-hover:gap-3 transition-all">
                Sign Up <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="text-foreground font-medium hover:underline underline-offset-4">
              Sign in
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
