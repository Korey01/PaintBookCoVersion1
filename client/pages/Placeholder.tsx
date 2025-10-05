import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Placeholder() {
  const { pathname } = useLocation();
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">This page is coming next</h1>
      <p className="mx-auto mt-2 max-w-prose text-muted-foreground">We're focusing on the core journeys first. Tell Fusion to generate this page next and we'll build it to spec. You navigated to: <span className="font-mono text-foreground">{pathname}</span></p>
      <div className="mt-6 flex justify-center gap-3">
        <Button asChild><Link to="/find-painter">Find A Painter/Decorator</Link></Button>
        <Button asChild variant="secondary"><Link to="/post-job">Post a Job</Link></Button>
      </div>
    </div>
  );
}
