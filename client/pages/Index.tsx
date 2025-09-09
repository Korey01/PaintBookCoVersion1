import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, BadgeCheck, ArrowRight, Quote, Sparkles, Calculator, MapPin, PaintBucket } from "lucide-react";
import PainterCard from "@/components/site/PainterCard";
import { painters } from "@/data/painters";

export default function Index() {
  const navigate = useNavigate();
  const [jobType, setJobType] = useState<string>("");

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const location = String(form.get("location") || "").trim();
    const q = new URLSearchParams();
    if (location) q.set("location", location);
    if (jobType) q.set("type", jobType);
    navigate(`/find-painter?${q.toString()}`);
  }

  return (
    <div className="space-y-24">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F6a440303ba6e42bd817b07b0544d4451?format=webp&width=1600" alt="Painter at work" className="h-[540px] w-full object-cover opacity-40"/>
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background"/>
        </div>
        <div className="container mx-auto px-4 pt-16 pb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5"/> Trusted painters. Escrow-protected bookings.
            </div>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Hire verified painters you can trust</h1>
            <p className="mt-3 text-lg text-muted-foreground">Compare painters by ratings, skills and price. Pay a 30–40% deposit into secure escrow and release on completion.</p>
            <form onSubmit={handleSearch} className="mt-6 grid gap-3 rounded-xl border bg-card/80 p-3 backdrop-blur md:grid-cols-[1fr_1fr_auto]">
              <div className="flex items-center gap-2 rounded-lg bg-background p-2">
                <MapPin className="h-4 w-4 text-muted-foreground"/>
                <Input name="location" placeholder="Postcode or city" className="border-0 focus-visible:ring-0"/>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-background p-2">
                <PaintBucket className="h-4 w-4 text-muted-foreground"/>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger className="border-0 focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interior">Interior</SelectItem>
                    <SelectItem value="exterior">Exterior</SelectItem>
                    <SelectItem value="kitchen">Kitchen cabinets</SelectItem>
                    <SelectItem value="wallpaper">Wallpaper</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="h-12 md:h-auto">Find a Painter <ArrowRight className="ml-2 h-4 w-4"/></Button>
            </form>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-primary"/> ID verified</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary"/> Insured</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary"/> Deposit protection via escrow</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => navigate("/post-job")} variant="secondary">Start your job</Button>
              <Button onClick={() => navigate("/estimator")} variant="outline"><Calculator className="mr-2 h-4 w-4"/> Paint Estimator</Button>
              <Button onClick={() => navigate("/join-painter")} variant="ghost">Join as a Painter</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <h2 className="text-2xl font-bold">Top rated near you</h2>
        <p className="mt-1 text-muted-foreground">Compare profiles at a glance and contact instantly.</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {painters.slice(0,3).map((p) => (
            <PainterCard key={p.id} painter={p} />
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <img src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2Fc1db86da96eb40bd97ce4e112a273df4?format=webp&width=1200" alt="Estimate tools" className="rounded-xl shadow-lg"/>
          <div>
            <h3 className="text-2xl font-bold">Estimate your paint in minutes</h3>
            <p className="mt-2 text-muted-foreground">Enter room dimensions, number of coats and openings. Get litres required and a baseline material cost. Attach to your job post with one click.</p>
            <div className="mt-4 flex gap-3">
              <Button onClick={() => navigate("/estimator")}>Open Estimator</Button>
              <Button onClick={() => navigate("/find-painter")} variant="outline">Find a Painter</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <h3 className="text-2xl font-bold">What customers say</h3>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[{
            quote: "Flawless finish and super professional. The escrow deposit made payment stress-free.", name: "Ella R.", location: "London"
          },{
            quote: "Booked in a day, loved the portfolio, and the estimate tool was spot on.", name: "James K.", location: "Leeds"
          },{
            quote: "Felt safe with ID verified and insured badges. Great experience.", name: "Priya S.", location: "Bristol"
          }].map((t, i) => (
            <Card key={i} className="border-muted/60">
              <CardContent className="p-6">
                <Quote className="h-6 w-6 text-primary"/>
                <p className="mt-3 text-sm">{t.quote}</p>
                <p className="mt-4 text-xs text-muted-foreground">{t.name} · {t.location}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
