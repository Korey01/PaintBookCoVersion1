import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";

export type Dispute = {
  id: string;
  jobTitle: string;
  counterparty: string; // customer/painter name
  amountOnHold: number;
  status: "open" | "under_review" | "resolved";
  openedAt: string; // ISO
  reason: string;
  photos: string[];
};

function seedIfEmpty(): Dispute[] {
  const raw = localStorage.getItem("paintbook:disputes");
  if (raw) return JSON.parse(raw);
  const seed: Dispute[] = [
    { id: "d1", jobTitle: "2-bed flat repaint", counterparty: "Ella R.", amountOnHold: 420, status: "under_review", openedAt: new Date(Date.now()-2*86400000).toISOString(), reason: "Paint bleed on ceiling edge; needs touch-up before release.", photos: [] },
    { id: "d2", jobTitle: "Kitchen cabinet respray", counterparty: "Rajan S.", amountOnHold: 600, status: "open", openedAt: new Date(Date.now()-1*86400000).toISOString(), reason: "Colour mismatch on 2 doors.", photos: [] },
  ];
  localStorage.setItem("paintbook:disputes", JSON.stringify(seed));
  return seed;
}

export default function Disputes(){
  const [items, setItems] = useState<Dispute[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");

  // form
  const [jobTitle, setJobTitle] = useState("");
  const [counterparty, setCounterparty] = useState("");
  const [amountOnHold, setAmountOnHold] = useState<number | "">("");
  const [reason, setReason] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(()=>{
    setItems(seedIfEmpty());
  },[]);

  const filtered = useMemo(()=>{
    return items.filter(d => statusFilter === "all" ? true : d.status === statusFilter);
  },[items, statusFilter]);

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach((f)=>{
      const reader = new FileReader();
      reader.onload = () => setPhotos(prev => [...prev, String(reader.result)]);
      reader.readAsDataURL(f);
    });
  }

  function submit(){
    if(!jobTitle || !counterparty || !amountOnHold || !reason) return;
    const next: Dispute = { id: `d${Date.now()}`, jobTitle, counterparty, amountOnHold: Number(amountOnHold), status: "open", openedAt: new Date().toISOString(), reason, photos };
    const list = [next, ...items];
    setItems(list);
    localStorage.setItem("paintbook:disputes", JSON.stringify(list));
    setJobTitle(""); setCounterparty(""); setAmountOnHold(""); setReason(""); setPhotos([]);
  }

  const statusBadge = (s: Dispute["status"]) => {
    switch(s){
      case "open": return <Badge className="bg-amber-500 text-white">Open</Badge>;
      case "under_review": return <Badge className="bg-primary text-primary-foreground">Under review</Badge>;
      case "resolved": return <Badge variant="secondary" className="bg-green-500 text-white">Resolved</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dispute log</h1>
          <p className="text-sm text-muted-foreground">Raise a dispute for escrow-held deposits. Our team will review and mediate fairly.</p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4"/> FCA-regulated escrow partner</div>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
          <div className="sm:col-span-2 font-medium flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500"/> Raise a dispute</div>
          <div>
            <Label>Job title</Label>
            <Input value={jobTitle} onChange={(e)=>setJobTitle(e.target.value)} placeholder="e.g. Lounge repaint"/>
          </div>
          <div>
            <Label>Counterparty</Label>
            <Input value={counterparty} onChange={(e)=>setCounterparty(e.target.value)} placeholder="Customer or painter name"/>
          </div>
          <div>
            <Label>Amount on hold (£)</Label>
            <Input type="number" value={amountOnHold} onChange={(e)=>setAmountOnHold(e.target.value ? Number(e.target.value) : "")}/>
          </div>
          <div className="sm:col-span-2">
            <Label>Reason</Label>
            <Textarea value={reason} onChange={(e)=>setReason(e.target.value)} rows={4} placeholder="Describe the issue and what resolution you seek"/>
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-2 block">Add photos (optional)</Label>
            <div className="flex items-center gap-3">
              <Input type="file" accept="image/*" multiple onChange={onFiles}/>
              <Button variant="secondary"><Upload className="mr-2 h-4 w-4"/> Add</Button>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Accepted formats: JPG, PNG</div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {photos.map((src, i)=>(<img key={i} src={src} className="h-24 w-full rounded object-cover"/>))}
            </div>
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button onClick={submit}><AlertTriangle className="mr-2 h-4 w-4"/> Submit dispute</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your disputes</h2>
        <div className="flex items-center gap-2">
          <Label className="text-sm">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="under_review">Under review</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map(d => (
          <Card key={d.id} className="border-muted/60">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold">{d.jobTitle}</div>
                  <div className="mt-1 text-xs text-muted-foreground">With {d.counterparty} · Opened {new Date(d.openedAt).toLocaleDateString()}</div>
                  <p className="mt-2 text-sm">{d.reason}</p>
                  {d.photos.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {d.photos.map((src,i)=>(<img key={i} src={src} className="h-20 w-full rounded object-cover"/>))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div>{statusBadge(d.status)}</div>
                  <div className="mt-2 text-sm font-medium">£{d.amountOnHold} held</div>
                  {d.status !== 'resolved' ? (
                    <Button size="sm" variant="secondary" className="mt-3"><CheckCircle2 className="mr-2 h-4 w-4"/> Mark resolved</Button>
                  ) : (
                    <Button size="sm" disabled className="mt-3">Resolved</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">No disputes in this view.</p>
        )}
      </div>
    </div>
  );
}
