import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Palette, ShieldCheck, Sparkles, Users, ChartBar, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <img src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F885f930f542b4689bad15cecd53df8b6?format=webp&width=1600" alt="About PaintBookco" className="mb-8 h-56 w-full rounded-xl object-cover shadow md:h-72"/>
      <header className="max-w-3xl">
        <Badge variant="secondary" className="bg-secondary/60">About PaintBookco</Badge>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Simplifying Your Paint Job. Empowering Painters.</h1>
        <p className="mt-3 text-muted-foreground">At PaintBookco, we believe colour transforms not just walls, but lives. Yet for too long, the UK painting and decorating industry has been fragmented, confusing, and frustrating—for both customers and painters. We set out to change that.</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold">Our Mission</h2>
            <p className="mt-2 text-sm text-muted-foreground">To simplify the paint job journey by connecting customers with trusted painters and decorators, while giving painters the tools and visibility to grow their businesses.</p>
            <p className="mt-2 text-sm text-muted-foreground">With PaintBookco, customers no longer waste time searching endlessly for reliable painters. And painters no longer struggle to find work beyond word‑of‑mouth.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold">What Makes Us Different</h2>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="flex items-start gap-2"><Sparkles className="mt-0.5 h-4 w-4 text-primary"/> <span><span className="font-medium">Smart Paint Estimator & Visualiser</span> – instantly calculate how much paint you’ll need and preview colour schemes in your space.</span></li>
              <li className="flex items-start gap-2"><Users className="mt-0.5 h-4 w-4 text-primary"/> <span><span className="font-medium">Verified Painter Portfolios</span> – no stock images, just real work from real professionals.</span></li>
              <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-primary"/> <span><span className="font-medium">Escrow Deposit Protection</span> – funds are held safely until the job is completed to customer satisfaction.</span></li>
              <li className="flex items-start gap-2"><ChartBar className="mt-0.5 h-4 w-4 text-primary"/> <span><span className="font-medium">Tiered Subscription Model</span> – affordable for both hobbyists and professionals, with benefits that scale with experience.</span></li>
              <li className="flex items-start gap-2"><Palette className="mt-0.5 h-4 w-4 text-primary"/> <span><span className="font-medium">Community‑Driven Platform</span> – loyalty rewards, referral bonuses, and painter success stories make PaintBookco more than a directory—it’s an ecosystem.</span></li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold">For Customers</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary"/> Quickly find reliable, vetted painters.</li>
              <li className="flex items-start gap-2"><Wallet className="mt-0.5 h-4 w-4 text-primary"/> Know your costs upfront with our estimator.</li>
              <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-primary"/> Book with peace of mind, knowing your deposit is protected until the job is done.</li>
            </ul>
            <div className="mt-4 flex gap-3">
              <Button asChild><Link to="/find-painter">Find a Painter</Link></Button>
              <Button asChild variant="outline"><Link to="/estimator">Use Estimator</Link></Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold">For Painters</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-start gap-2"><ChartBar className="mt-0.5 h-4 w-4 text-primary"/> Grow your client base without expensive commissions.</li>
              <li className="flex items-start gap-2"><Sparkles className="mt-0.5 h-4 w-4 text-primary"/> Showcase your best work with verified portfolios.</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary"/> Choose the jobs that match your skills, budget, and availability.</li>
            </ul>
            <div className="mt-4 flex gap-3">
              <Button asChild><Link to="/join-painter">Join as a Painter</Link></Button>
              <Button asChild variant="outline"><Link to="/dashboard">Open Dashboard</Link></Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold">Our Vision</h3>
            <p className="mt-2 text-sm text-muted-foreground">We’re starting in the UK, but our ambition goes further. By 2027, PaintBookco aims to expand into Europe and Africa, becoming the go‑to global marketplace for painting and decorating services. Because everyone deserves a home or workspace that inspires. And every painter deserves the chance to shine.</p>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold">The Team Behind PaintBookco</h3>
            <div className="mt-2 grid gap-4 text-sm md:grid-cols-2">
              <div>
                <div className="font-medium">Oluwakorede Alashe – Founder & Managing Director</div>
                <p className="text-muted-foreground">A business analyst and product strategist with experience in financial compliance, customer experience, and business transformation.</p>
              </div>
              <div>
                <div className="font-medium">Our Support Team</div>
                <p className="text-muted-foreground">Specialists in finance, marketing, and software development ensuring the platform is robust, scalable, and customer‑focused.</p>
              </div>
              <div className="md:col-span-2">
                <div className="font-medium">A Growing Network of Highly Skilled Painters</div>
                <p className="text-muted-foreground">The heart of PaintBookco, bringing craftsmanship, creativity, and professionalism to every project.</p>
              </div>
            </div>
            <Separator className="my-6"/>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">Together, we’re building a platform that brings vibrance, trust, and efficiency to the painting industry.</p>
              <div className="flex gap-3">
                <Button asChild><Link to="/find-painter">Find a Painter</Link></Button>
                <Button asChild variant="secondary"><Link to="/post-job">Post a Job</Link></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="text-center">
        <p className="text-sm font-medium">👉 PaintBookco: The Paint Job, Simplified.</p>
      </footer>
    </div>
  );
}
