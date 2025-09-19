import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, BadgeCheck, ArrowRight, Quote, Sparkles, Calculator, MapPin, PaintBucket } from "lucide-react";
import LogoStroke from "@/components/site/LogoStroke";
import PainterCard from "@/components/site/PainterCard";
import { painters } from "@/data/painters";

export default function Index() { useEffect(()=>{ document.title = "PaintBook | Hire Verified Painters"; },[]);
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
        <div className="container mx-auto px-4 pt-0 pb-0 md:pt-0">
          <div className="relative flex flex-col items-center text-center w-full h-[60vh]">
            <LogoStroke />
            <motion.div className="pointer-events-auto absolute inset-x-0 top-[56%] z-20 flex flex-wrap items-center justify-center gap-3 px-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}>
                <Button onClick={() => navigate('/find-painter')} size="xl" className="bg-black text-white hover:bg-black/90 rounded-lg">Find a Painter</Button>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}>
                <Button onClick={() => navigate('/join-painter')} size="xl" variant="outline" className="bg-transparent text-black border-black hover:bg-black/5 rounded-lg">Join as a Painter</Button>
              </motion.div>
            </motion.div>
            <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 flex flex-wrap items-center justify-center gap-4 px-4 text-sm text-black" style={{ filter: "drop-shadow(1px 1px 0 rgba(0,0,0,0.25)) drop-shadow(-1px -1px 0 rgba(255,255,255,0.6))" }}>
              <span className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-black"/> ID verified</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-black"/> Insured</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-black"/> 100% escrow protection — via Stripe (FCA-regulated payment partner)</span>
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
              <Button onClick={() => navigate("/vestimator")}>Open Vestimator</Button>
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
