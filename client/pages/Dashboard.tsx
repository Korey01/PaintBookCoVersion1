import { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShieldCheck, BadgeCheck, Mail, CheckCircle2, Sparkles, Filter, MapPin, PoundSterling, CalendarClock, Pencil } from "lucide-react";

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

  const [editOpen, setEditOpen] = useState(false);
  const stored = JSON.parse(localStorage.getItem('paintbook:joinPainter')||'{}');
  const [name, setName] = useState<string>(stored.name || "");
  const [business, setBusiness] = useState<string>(stored.business || "");
  const [bio, setBio] = useState<string>(stored.bio || "");
  const [postcode, setPostcode] = useState<string>(stored.postcode || "");
  const [radius, setRadius] = useState<number[]>([stored.radius || 15]);
  const [idType, setIdType] = useState<string>(stored.idType || "");
  const [idNumber, setIdNumber] = useState<string>(stored.idNumber || "");
  const [idExpiry, setIdExpiry] = useState<string>(stored.idExpiry || "");
  const [idDocs, setIdDocs] = useState<string[]>(stored.idDocs || []);
  const [insuranceInsurer, setInsuranceInsurer] = useState<string>(stored.insuranceInsurer || "");
  const [insurancePolicy, setInsurancePolicy] = useState<string>(stored.insurancePolicy || "");
  const [insuranceExpiry, setInsuranceExpiry] = useState<string>(stored.insuranceExpiry || "");
  const [insuranceDocs, setInsuranceDocs] = useState<string[]>(stored.insuranceDocs || []);
  const idStatus = stored.idStatus || (idDocs.length>0 ? 'pending' : 'not_uploaded');
  const insuranceStatus = stored.insuranceStatus || (insuranceDocs.length>0 ? 'on_file' : 'not_provided');

  const profileProgress = 80;
  const painterStore = JSON.parse(localStorage.getItem('paintbook:joinPainter')||'{}');
  const tier = (painterStore?.subscription?.plan) || painterStore?.tier || 'Starter';
  const [subOpen, setSubOpen] = useState(false);
  const [subPlan, setSubPlan] = useState<string>(painterStore?.subscription?.plan || tier);

  useEffect(()=>{
    if (location.hash === '#edit-profile') setEditOpen(true);
  },[]);

  function onIdFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 3);
    files.forEach((f)=>{
      const reader = new FileReader();
      reader.onload = () => setIdDocs(prev => [...prev, String(reader.result)]);
      reader.readAsDataURL(f);
    });
  }

  function onInsuranceFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 3);
    files.forEach((f)=>{
      const reader = new FileReader();
      reader.onload = () => setInsuranceDocs(prev => [...prev, String(reader.result)]);
      reader.readAsDataURL(f);
    });
  }

  function saveProfile(){
    const current = JSON.parse(localStorage.getItem('paintbook:joinPainter')||'{}');
    const next = { ...current, name, business, bio, postcode, radius: radius[0], idType, idNumber, idExpiry, idDocs, idStatus: idDocs.length>0 ? (current.idStatus||'pending') : (current.idStatus||'not_uploaded'), insuranceInsurer, insurancePolicy, insuranceExpiry, insuranceDocs, insuranceStatus: insuranceDocs.length>0 ? 'on_file' : 'not_provided' };
    localStorage.setItem('paintbook:joinPainter', JSON.stringify(next));
    setEditOpen(false);
  }

  const combinedJobs: Job[] = useMemo(()=>{
    const local = (JSON.parse(localStorage.getItem('paintbook:jobs')||'[]') as any[]).map((j:any, i:number)=> ({
      id: `lj_${i}`,
      title: j.jobType ? `${j.jobType} job` : 'Customer job',
      budget: Number(j.budgetMax || j.budgetMin || 500),
      date: j.createdAt || new Date().toISOString(),
      distance: Math.max(1, Math.min(20, Math.round(Math.random()*15)+1)),
      location: (j.postcode||'').split(' ')[0] || 'N/A',
      type: (j.jobType||'General').toString(),
      description: j.desc || 'New job posted by a customer.',
    }));
    return [...local, ...NEARBY_JOBS];
  },[]);

  const filteredJobs = useMemo(()=>{
    return combinedJobs.filter(j => {
      const inBudget = j.budget >= budget[0] && j.budget <= budget[1];
      const inDistance = j.distance <= maxDistance[0];
      const inWhen = when === 'any' || (when === 'this_week' ? daysFromNow(j.date) <= 7 : daysFromNow(j.date) <= 30);
      return inBudget && inDistance && inWhen;
    });
  },[combinedJobs, budget, maxDistance, when]);

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
              <div className="text-2xl font-bold flex items-center gap-2">Painter Dashboard
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs"><svg xmlns='http://www.w3.org/2000/svg' className='h-3.5 w-3.5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='3' y='11' width='18' height='10' rx='2'/><path d='M7 11V7a5 5 0 0 1 10 0v4'/></svg> Funds Secured</span>
                <button aria-label="Edit profile" className="rounded-full border p-2 hover:bg-secondary" onClick={()=>setEditOpen(true)}>
                  <Pencil className="h-4 w-4"/>
                </button>
              </div>
              <a href="/disputes" className="text-sm text-primary underline">Dispute log</a>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg bg-secondary p-3"><div className="text-muted-foreground">Jobs this week</div><div className="text-xl font-bold">{filteredJobs.length}</div></div>
              <div className="rounded-lg bg-secondary p-3"><div className="text-muted-foreground">Messages</div><div className="text-xl font-bold">3</div></div>
              <div className="rounded-lg bg-secondary p-3"><div className="text-muted-foreground">Profile</div><div className="text-xl font-bold">{profileProgress}%</div></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium">Trust & Badges</div>
            <div className="mt-2 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-primary"/>
                <span>{(idStatus) === 'pending' ? 'ID verification pending' : (idStatus==='verified' ? 'ID verified' : 'ID not uploaded')}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary"/>
                <span>{insuranceStatus==='on_file' ? 'Insurance on file' : 'Insurance not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 text-primary' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='3' y='11' width='18' height='10' rx='2'/><path d='M7 11V7a5 5 0 0 1 10 0v4'/></svg>
                <span>Funds Secured — via Stripe (FCA-regulated payment partner)</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium">Escrow & Payments (Demo)</div>
            <div className="mt-2 grid gap-1 text-sm">
              <div className="flex items-center justify-between"><span>Escrow balance</span><span className="font-medium">£450.00</span></div>
              <div className="flex items-center justify-between"><span>Pending release</span><span className="font-medium">£300.00</span></div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button asChild size="sm"><a href="/escrow-demo/painter">Open demo</a></Button>
              <Button asChild size="sm" variant="secondary"><a href="/disputes">Open dispute</a></Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium">Subscription</div>
            <div className="mt-2 text-sm">Current tier: <Badge variant="outline">{tier}</Badge></div>
            <Button className="mt-3 w-full" variant="secondary" onClick={()=>setSubOpen(true)}>Manage</Button>
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
                      <a href={`/messages?job=${j.id}`} className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-primary hover:bg-primary/10"><Mail className="h-4 w-4"/> Message</a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit my profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>Full name</Label>
              <Input value={name} onChange={(e)=>setName(e.target.value)} />
            </div>
            <div>
              <Label>Business name</Label>
              <Input value={business} onChange={(e)=>setBusiness(e.target.value)} />
            </div>
            <div>
              <Label>Short bio</Label>
              <Input value={bio} onChange={(e)=>setBio(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Base postcode</Label>
                <Input value={postcode} onChange={(e)=>setPostcode(e.target.value)} />
              </div>
              <div>
                <Label>Coverage radius (miles)</Label>
                <Slider min={5} max={50} step={1} value={radius} onValueChange={setRadius} />
                <div className="text-xs text-muted-foreground mt-1">{radius[0]} miles</div>
              </div>
            </div>

            <div className="pt-2">
              <div className="text-sm font-medium">ID verification</div>
              <div className="mt-2 grid gap-3 md:grid-cols-3">
                <div>
                  <Label>ID type</Label>
                  <Select value={idType} onValueChange={setIdType}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="driving_licence">Driving licence</SelectItem>
                      <SelectItem value="national_id">National ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>ID number</Label>
                  <Input value={idNumber} onChange={(e)=>setIdNumber(e.target.value)} placeholder="e.g. 123456789" />
                </div>
                <div>
                  <Label>Expiry date</Label>
                  <Input type="date" value={idExpiry} onChange={(e)=>setIdExpiry(e.target.value)} />
                </div>
              </div>
              <div className="mt-2">
                <Input type="file" accept="image/*,application/pdf" multiple onChange={onIdFiles} />
                <div className="text-xs text-muted-foreground mt-1">Accepted formats: PDF, JPG, PNG</div>
                <div className="text-xs text-muted-foreground">{idDocs.length} file{ idDocs.length===1? '' : 's' } uploaded</div>
              </div>
            </div>

            <div className="pt-4">
              <div className="text-sm font-medium">Insurance</div>
              <div className="mt-2 grid gap-3 md:grid-cols-3">
                <div>
                  <Label>Insurer</Label>
                  <Input value={insuranceInsurer} onChange={(e)=>setInsuranceInsurer(e.target.value)} placeholder="e.g. Aviva" />
                </div>
                <div>
                  <Label>Policy number</Label>
                  <Input value={insurancePolicy} onChange={(e)=>setInsurancePolicy(e.target.value)} placeholder="e.g. POL123456" />
                </div>
                <div>
                  <Label>Policy expiry</Label>
                  <Input type="date" value={insuranceExpiry} onChange={(e)=>setInsuranceExpiry(e.target.value)} />
                </div>
              </div>
              <div className="mt-2">
                <Input type="file" accept="image/*,application/pdf" multiple onChange={onInsuranceFiles} />
                <div className="text-xs text-muted-foreground mt-1">Accepted formats: PDF, JPG, PNG</div>
                <div className="text-xs text-muted-foreground">{insuranceDocs.length} file{ insuranceDocs.length===1? '' : 's' } uploaded</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={()=>setEditOpen(false)}>Cancel</Button>
              <Button onClick={saveProfile}>Save changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={subOpen} onOpenChange={setSubOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage subscription</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 text-sm">
            <div>
              <Label>Plan</Label>
              <Select value={subPlan} onValueChange={setSubPlan}>
                <SelectTrigger><SelectValue placeholder="Select plan"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Starter">Starter · £10/mo</SelectItem>
                  <SelectItem value="Professional">Professional · £20/mo</SelectItem>
                  <SelectItem value="Premium">Premium · £35/mo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={()=>{ setSubOpen(false); location.href = `/checkout?mode=subscription&plan=${encodeURIComponent(subPlan)}`; }}>Update plan</Button>
              <Button variant="secondary" onClick={()=>{ const cur = JSON.parse(localStorage.getItem('paintbook:joinPainter')||'{}'); localStorage.setItem('paintbook:joinPainter', JSON.stringify({ ...cur, subscription: { ...(cur.subscription||{}), status: 'canceled' } })); setSubOpen(false); }}>Cancel subscription</Button>
            </div>
            <div className="pt-2">
              <div className="font-medium">Billing history</div>
              <div className="mt-2 grid gap-1">
                {JSON.parse(localStorage.getItem('paintbook:payments')||'[]').filter((p:any)=>p.mode==='subscription').slice(0,5).map((p:any)=> (
                  <div key={p.ref} className="flex items-center justify-between text-xs"><span>{new Date(p.createdAt).toLocaleDateString()} · {p.plan}</span><span>£{p.amount}</span></div>
                ))}
                {JSON.parse(localStorage.getItem('paintbook:payments')||'[]').filter((p:any)=>p.mode==='subscription').length===0 && (
                  <div className="text-xs text-muted-foreground">No payments yet.</div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
