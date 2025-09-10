import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { painters } from "@/data/painters";

export default function CustomerDashboard(){
  const navigate = useNavigate();
  const favIds: string[] = JSON.parse(localStorage.getItem('paintbook:favs')||'[]');
  const favs = painters.filter(p => favIds.includes(p.id));

  return (
    <div className="container mx-auto grid gap-8 px-4 py-10">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold flex items-center gap-2">Customer Dashboard</div>
            <div className="text-xs text-muted-foreground inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary"/> Deposits are escrow‑protected</div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={()=>navigate('/post-job')}>Post a Job</Button>
            <Button variant="outline" onClick={()=>navigate('/find-painter')}>Browse Painters</Button>
          </div>
        </CardContent>
      </Card>

      <section>
        <h2 className="text-lg font-semibold">Favourite painters</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No favourites yet. Browse painters and tap ♡ to save.</p>
          ) : (
            favs.map(p => (
              <Card key={p.id} className="border-muted/60">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground inline-flex items-center gap-2"><MapPin className="h-4 w-4"/>{p.location}</div>
                    </div>
                    <Badge>£{p.priceRange}</Badge>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">{p.skills.slice(0,3).join(' • ')}</div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={()=>navigate(`/painter/${p.id}`)}>View Profile</Button>
                    <Button size="sm" variant="secondary" onClick={()=>navigate(`/checkout?mode=booking&painter=${encodeURIComponent(p.name)}&amount=150`)}>Book (escrow)</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Help & Support</h2>
        <div className="mt-2 text-sm text-muted-foreground">Report problems or open disputes from the Disputes page.</div>
        <Button className="mt-3" variant="secondary" onClick={()=>navigate('/disputes')}>Open Dispute</Button>
      </section>
    </div>
  );
}
