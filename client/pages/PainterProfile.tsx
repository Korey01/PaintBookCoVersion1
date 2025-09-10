import { useParams, useNavigate } from "react-router-dom";
import { painters } from "@/data/painters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ShieldCheck, BadgeCheck, ArrowRight, MapPin, PoundSterling, CalendarClock, Pencil } from "lucide-react";

export default function PainterProfile(){
  const { id } = useParams();
  const navigate = useNavigate();
  const painter = painters.find(p=>p.id === id);
  const postedJobs: any[] = JSON.parse(localStorage.getItem('paintbook:jobs')||'[]');
  const join = JSON.parse(localStorage.getItem('paintbook:joinPainter')||'{}');
  const outward = (join.postcode || '').split(' ')[0];
  const nearby = postedJobs.filter(j => (j.postcode||'').split(' ')[0] === outward);

  if(!painter){
    return <div className="container mx-auto px-4 py-16"><p className="text-sm text-muted-foreground">Painter not found.</p></div>;
  }

  return (
    <div className="container mx-auto px-4 py-10 space-y-10">
      <section className="grid gap-6 md:grid-cols-[1fr_360px]">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold">{painter.name}</h1>
              <p className="text-sm text-muted-foreground">{painter.location} · {painter.coverage}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 text-amber-500"><Star className="h-5 w-5 fill-amber-400"/><span className="font-medium">{painter.rating.toFixed(1)}</span><span className="text-xs text-muted-foreground">({painter.reviews})</span></div>
                <Badge variant="outline">{painter.tier}</Badge>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><BadgeCheck className="h-4 w-4 text-primary"/>ID verified</span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-primary"/>Insured</span>
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-prose text-sm">{painter.bio}</p>

          <div className="mt-6">
            <h2 className="text-lg font-semibold">Services & typical prices</h2>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {painter.services.map((s)=> (
                <li key={s.name} className="flex items-center justify-between rounded-lg border p-3 text-sm"><span>{s.name}</span><span className="text-muted-foreground">{s.priceRange}</span></li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold">Portfolio</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
              {painter.portfolio.map((src, i)=> <img key={i} src={src} alt="portfolio" className="h-40 w-full rounded object-cover"/>) }
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold">Reviews</h2>
            <div className="mt-2 grid gap-3">
              {painter.reviewList.map(r => (
                <Card key={r.id}>
                  <CardContent className="p-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-amber-500"><Star className="h-4 w-4 fill-amber-400"/><span className="font-medium">{r.rating.toFixed(1)}</span></div>
                      <span className="text-muted-foreground">{r.author} · {new Date(r.date).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-1">{r.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Jobs nearby your base area</h2>
              <a className="text-sm text-primary underline" href="/dashboard#edit-profile"><Pencil className="inline mr-1 h-4 w-4"/> Edit my profile</a>
            </div>
            <p className="text-sm text-muted-foreground">Based on your postcode {join.postcode || '—'} and coverage radius.</p>
            <div className="mt-3 grid gap-3">
              {(nearby.length > 0 ? nearby : postedJobs).slice(0,5).map((j:any, i:number)=> (
                <Card key={j.id || i} className="border-muted/60">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium">{j.jobType || j.title || 'Job'}</div>
                        <div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-3">
                          {j.date && <span className="inline-flex items-center gap-1"><CalendarClock className="h-4 w-4"/> {new Date(j.date).toLocaleDateString()}</span>}
                          {j.postcode && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4"/> {j.postcode}</span>}
                          {(j.budgetMin||j.budgetMax||j.budget) && <span className="inline-flex items-center gap-1"><PoundSterling className="h-4 w-4"/> £{j.budget || `${j.budgetMin}–${j.budgetMax}`}</span>}
                        </div>
                        <p className="mt-2 text-xs">{j.desc || j.description || 'Customer posted a new job near your coverage area.'}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={()=>navigate(`/messages?job=${j.id||''}&painter=${painter.id}`)}>Message</Button>
                        <Button size="sm" variant="secondary" onClick={()=>navigate(`/post-job?painter=${painter.id}`)}>Quote</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {postedJobs.length===0 && (
                <p className="text-xs text-muted-foreground">No live jobs yet. Ask customers to post jobs from the Post a Job page.</p>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <img src={painter.photo} alt={painter.name} className="h-56 w-full rounded-lg object-cover"/>
          <Card>
            <CardContent className="p-4 text-sm">
              <div className="flex items-center justify-between"><span>Price range</span><span className="font-medium">{painter.priceRange}</span></div>
              <div className="mt-2 flex flex-wrap gap-2">
                {painter.skills.map(s => <Badge key={s} variant="secondary" className="bg-secondary/60">{s}</Badge>)}
              </div>
              <div className="mt-4 grid gap-2">
                <Button onClick={()=>navigate(`/post-job?painter=${painter.id}`)}>Request Quote</Button>
                <Button variant="secondary" onClick={()=>navigate(`/post-job?painter=${painter.id}`)}>Contact</Button>
                <Button variant="outline" onClick={()=>navigate('/estimator')}>Attach Estimation <ArrowRight className="ml-2 h-4 w-4"/></Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}
