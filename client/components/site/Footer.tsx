import { Link } from "react-router-dom";
import { ShieldCheck, BadgeCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-card/50">
      <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-4">
        <div className="col-span-2">
          <img src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F58508160cf8c4641baffc02ea4d04605?format=webp&width=800" alt="PaintBookco logo" className="h-12 w-auto drop-shadow-md contrast-110 saturate-110"/>
          <p className="mt-2 text-sm text-muted-foreground max-w-prose">Find trusted, verified painters and decorators. Book with confidence with deposit protection via secure escrow.</p>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-primary"/> ID verified</span>
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary"/> Insured</span>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Product</h4>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/find-painter" className="hover:text-primary">Find a Painter</Link></li>
            <li><Link to="/post-job" className="hover:text-primary">Post a Job</Link></li>
            <li><Link to="/estimator" className="hover:text-primary">Paint Estimator</Link></li>
            <li><Link to="/join-painter" className="hover:text-primary">Join as a Painter</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Company</h4>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/help" className="hover:text-primary">Help & Support</Link></li>
            <li><Link to="/privacy" className="hover:text-primary">Privacy</Link></li>
            <li><Link to="/terms" className="hover:text-primary">Terms</Link></li>
            <li><Link to="/cookies" className="hover:text-primary">Cookies</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} The PaintBook Company Ltd. All rights reserved.</div>
    </footer>
  );
}
