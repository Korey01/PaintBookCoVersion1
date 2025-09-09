import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, BadgeCheck, Mail, CheckCircle2, Sparkles, Filter, MapPin, PoundSterling, CalendarClock } from "lucide-react";

interface Job {
  id: string;
  title: string;
  budget: number;
  date: string; // ISO
  distance: number; // miles
  location: string;
  type: string;
  description: string;
}

const NEARBY_JOBS: Job[] = [
  { id: "j1", title: "2-bed flat repaint", budget: 1200, date: new Date().toISOString(), distance: 4, location: "SW1A", type: "Interior", description: "Walls & ceilings, two coats emulsion, small plaster patch." },
  { id: "j2", title: "Exterior front & fence", budget: 850, date: new Date(Date.now()+3*86400000).toISOString(), distance: 9, location: "SE15", type: "Exterior", description: "Front elevation and timber fence staining." },
  { id: "j3", title: "Kitchen cabinets respray", budget: 1800, date: new Date(Date.now()+10*86400000).toISOString(), distance: 14, location: "E3", type: "Kitchens", description: "Prime and spray 18 doors + handles, satin finish." },
];

const DISCOUNTS = [
  { name: "Dulux Trade", detail: "5% off emulsions", requires: "Pro", link: "#" },
  { name: "Johnstone's", detail: "10% tools & sundries", requires: "Starter", link: "#" },
  { name: "Leyland", detail: "7% exterior masonry", requires: "Pro", link: "#" },
  { name: "wilko", detail: "Budget rollers bundle", requires: "Starter", link: "#" },
];

export default function Dashboard(){
  const [budget, setBudget] = useState<number[]>([300, 2000]);
  const [maxDistance, setMaxDistance] = useState<number[]>([15]);
  const [when, setWhen] = useState<string>("this_week");
  const [applied, setApplied] = useState<string[]>(() => JSON.parse(localStorage.getItem('paintbook:applied')||'[]'));

  const profileProgress = 80;
  const tier = (JSON.parse(localStorage.getItem('paintbook:joinPainter')||'{}')?.tier) || 'Starter';

  const filteredJobs = useMemo(()=>{
    return NEARBY_JOBS.filter(j => {
      const inBudget = j.budget >= budget[0] && j.budget <= budget[1];
      const inDistance = j.distance <= maxDistance[0];
      const inWhen = when === 'any' || (when === 'this_week' ? daysFromNow(j.date) <= 7 : daysFromNow(j.date) <= 30);
      return inBudget && inDistance && inWhen;
    });
  },[budget, maxDistance, when]);

  function daysFromNow(iso: string){
    const diff = new Date(iso).getTime() - Date.now();
    return Math.ceil(diff/86400000);
  }

  function expressInterest(id: string){
    setApplied(prev => {
      const next = prev.includes(id) ? prev : [...prev, id];
      localStorage.setItem('paintbook:applied', JSON.stringify(next));
      return next;
    });
  }

  return (
    <div className="container mx-auto grid gap-8 px-4 py-10">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Sparkles className="h-4 w-4"/> Welcome back</div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-2xl font-bold">Painter Dashboard</div>
              <a href="/disputes" className="text-sm text-primary underline">Dispute log</a>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg bg-secondary p-3"><div className="text-muted-foreground">Jobs this week</div><div className="text-xl font-bold">{NEARBY_JOBS.length}</div></div>
              <div className="rounded-lg bg-secondary p-3"><div className="text-muted-foreground">Messages</div><div className="text-xl font-bold">3</div></div>
              <div className="rounded-lg bg-secondary p-3"><div className="text-muted-foreground">Profile</div><div className="text-xl font-bold">{profileProgress}%</div></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium">Trust & Badges</div>
            <div className="mt-2 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-primary"/> ID verified</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary"/> Insured</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium">Subscription</div>
            <div className="mt-2 text-sm">Current tier: <Badge variant="outline">{tier}</Badge></div>
            <Button className="mt-3 w-full" variant="secondary">Manage</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-[340px_1fr]">
        <aside className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between"><div className="text-sm font-medium flex items-center gap-2"><Filter className="h-4 w-4"/> Job filters</div></div>
              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <Label>Budget (£{budget[0]}–£{budget[1]})</Label>
                  <Slider min={100} max={4000} step={50} value={budget} onValueChange={setBudget}/>
                </div>
                <div>
                  <Label>Max distance ({maxDistance[0]} mi)</Label>
                  <Slider min={1} max={50} step={1} value={maxDistance} onValueChange={setMaxDistance}/>
                </div>
                <div>
                  <Label>When</Label>
                  <Select value={when} onValueChange={setWhen}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="this_week">This week</SelectItem>
                      <SelectItem value="this_month">This month</SelectItem>
                      <SelectItem value="any">Any time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium">Profile completeness</div>
              <Progress value={profileProgress} className="mt-3"/>
              <Button className="mt-3 w-full" variant="outline">Finish setup</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium">Discounts</div>
              <div className="mt-3 grid gap-2 text-sm">
                {DISCOUNTS.map(d => (
                  <div key={d.name} className="flex items-center justify-between rounded border p-2">
                    <div>
                      <div className="font-medium">{d.name}</div>
                      <div className="text-muted-foreground text-xs">{d.detail} · requires {d.requires}</div>
                    </div>
                    <Button size="sm" variant="secondary">Redeem</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Nearby jobs</h2>
            <div className="text-xs text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4"/> Based on your coverage radius</div>
          </div>
          <div className="grid gap-4">
            {filteredJobs.map(j => (
              <Card key={j.id} className="border-muted/60">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold">{j.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1"><CalendarClock className="h-4 w-4"/> in {daysFromNow(j.date)} days</span>
                        <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4"/> {j.location} · {j.distance}mi</span>
                        <span className="inline-flex items-center gap-1"><PoundSterling className="h-4 w-4"/> Budget £{j.budget}</span>
                        <Badge variant="secondary" className="bg-secondary/60">{j.type}</Badge>
                      </div>
                      <p className="mt-2 text-sm">{j.description}</p>
                    </div>
                    <div className="flex gap-2">
                      {applied.includes(j.id) ? (
                        <Button variant="secondary" disabled className="cursor-default"><CheckCircle2 className="mr-2 h-4 w-4"/> Applied</Button>
                      ) : (
                        <Button onClick={()=>expressInterest(j.id)}>Express interest</Button>
                      )}
                      <Button variant="outline"><Mail className="mr-2 h-4 w-4"/> Message</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
