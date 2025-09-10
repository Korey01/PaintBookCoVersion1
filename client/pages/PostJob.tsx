import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, ArrowRight, CheckCircle2 } from "lucide-react";
import { z } from "zod";

export default function PostJob() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  type Step = 1 | 2 | 3 | 4;
  const [step, setStep] = useState<Step>(1);

  const [jobType, setJobType] = useState("");
  const [desc, setDesc] = useState("");
  const [budgetMin, setBudgetMin] = useState<number | "">("");
  const [budgetMax, setBudgetMax] = useState<number | "">("");
  const [postcode, setPostcode] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [attachedEstimate, setAttachedEstimate] = useState<any>(null);
  const prePainter = params.get("painter") || undefined;

  useEffect(()=>{
    const est = params.get('estimate');
    if (est) try { setAttachedEstimate(JSON.parse(est)); } catch {}
  },[params]);

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach((f)=>{
      const reader = new FileReader();
      reader.onload = () => setImages(prev => [...prev, String(reader.result)]);
      reader.readAsDataURL(f);
    });
  }

  const [errors, setErrors] = useState<Record<string,string>>({});

  const schemaStep1 = z.object({
    jobType: z.string().min(1, "Select a job type"),
    desc: z.string().min(10, "Add at least 10 characters"),
  });
  const ukPostcode = /^(?:[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2})$/i;
  const schemaStep2 = z.object({
    budgetMin: z.number().min(0),
    budgetMax: z.number().min(0),
    postcode: z.string().regex(ukPostcode, "Enter a valid UK postcode (e.g. SW1A 1AA)"),
  }).refine(v => (typeof v.budgetMin==='number' && typeof v.budgetMax==='number' ? v.budgetMax >= v.budgetMin : false), { message: "Max must be greater than min", path: ["budgetMax"] });
  const schemaStep3 = z.object({
    email: z.string().email("Enter a valid email"),
    phone: z.string().min(7, "Enter a valid phone")
  });

  function next() {
    if (step === 1) {
      const r = schemaStep1.safeParse({ jobType, desc });
      if (!r.success) { const e: Record<string,string> = {}; r.error.issues.forEach(i=> e[i.path[0] as string] = i.message); setErrors(e); return; }
      setErrors({});
    }
    if (step === 2) {
      const r = schemaStep2.safeParse({ budgetMin: budgetMin || 0, budgetMax: budgetMax || 0, postcode });
      if (!r.success) { const e: Record<string,string> = {}; r.error.issues.forEach(i=> e[i.path[0] as string] = i.message); setErrors(e); return; }
      setErrors({});
    }
    setStep((s)=> Math.min(4, (s+1) as Step));
  }
  function back() { setStep((s)=> Math.max(1, (s-1) as Step)); }

  function submit() {
    const r = schemaStep3.safeParse({ email, phone });
    if (!r.success) { const e: Record<string,string> = {}; r.error.issues.forEach(i=> e[i.path[0] as string] = i.message); setErrors(e); return; }
    const job = { jobType, desc, budgetMin, budgetMax, postcode, email, phone, images, attachedEstimate, painter: prePainter, createdAt: new Date().toISOString() };
    const list = JSON.parse(localStorage.getItem('paintbook:jobs') || '[]');
    list.push(job);
    localStorage.setItem('paintbook:jobs', JSON.stringify(list));
    navigate('/post-job/confirmation');
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Post a Job</h1>
        <p className="text-sm text-muted-foreground">Start your job in a few steps. We'll notify nearby verified painters.</p>
      </div>

      <div className="mb-6 flex gap-2 text-sm">
        {[1,2,3].map(n => (
          <div key={n} className={`flex-1 rounded-full border px-3 py-1 text-center ${step >= n ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-foreground'}`}>Step {n}</div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Job type</Label>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger aria-invalid={!!errors.jobType}>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interior">Interior</SelectItem>
                  <SelectItem value="exterior">Exterior</SelectItem>
                  <SelectItem value="kitchen">Kitchen cabinets</SelectItem>
                  <SelectItem value="wallpaper">Wallpaper</SelectItem>
                </SelectContent>
              </Select>
              {errors.jobType && <p className="text-xs text-red-500 mt-1">{errors.jobType}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label>Short description</Label>
              <Textarea aria-invalid={!!errors.desc} className={errors.desc? 'border-destructive':''} value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="Share details for accurate quotes" rows={5}/>
              {errors.desc && <p className="text-xs text-red-500 mt-1">{errors.desc}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-2 block">Upload area photos</Label>
              <div className="flex items-center gap-3">
                <Input type="file" accept="image/*" multiple onChange={onFiles}/>
                <Button variant="secondary"><Upload className="mr-2 h-4 w-4"/> Add</Button>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Accepted formats: JPG, PNG</div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {images.map((src, i)=>(<img key={i} src={src} className="h-24 w-full rounded object-cover"/>))}
              </div>
            </div>
            {attachedEstimate && (
              <div className="sm:col-span-2 rounded-lg bg-secondary p-4 text-sm">
                <div className="font-medium">Attached Estimation</div>
                <div className="mt-1 text-muted-foreground">{attachedEstimate.litres} L · £{attachedEstimate.materialCost} materials</div>
              </div>
            )}
            <div className="sm:col-span-2 flex justify-end">
              <Button onClick={next}>Next <ArrowRight className="ml-2 h-4 w-4"/></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <div>
              <Label>Budget min (£)</Label>
              <Input type="number" min={0} aria-invalid={!!errors.budgetMin} className={errors.budgetMin? 'border-destructive':''} value={budgetMin} onChange={(e)=>setBudgetMin(e.target.value ? Number(e.target.value): "")}/>
            </div>
            <div>
              <Label>Budget max (£)</Label>
              <Input type="number" min={0} aria-invalid={!!errors.budgetMax} className={errors.budgetMax? 'border-destructive':''} value={budgetMax} onChange={(e)=>setBudgetMax(e.target.value ? Number(e.target.value): "")}/>
              {errors.budgetMax && <p className="text-xs text-red-500 mt-1">{errors.budgetMax}</p>}
            </div>
            <div>
              <Label>Postcode / address</Label>
              <Input aria-invalid={!!errors.postcode} className={errors.postcode? 'border-destructive':''} value={postcode} onChange={(e)=>setPostcode(e.target.value)} placeholder="e.g. SW1A 1AA"/>
              {errors.postcode && <p className="text-xs text-red-500 mt-1">{errors.postcode}</p>}
            </div>
            <div className="sm:col-span-2 flex justify-between">
              <Button variant="secondary" onClick={back}>Back</Button>
              <Button onClick={next}>Next <ArrowRight className="ml-2 h-4 w-4"/></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <div>
              <Label>Email</Label>
              <Input type="email" aria-invalid={!!errors.email} className={errors.email? 'border-destructive':''} value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com"/>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label>Phone</Label>
              <Input aria-invalid={!!errors.phone} className={errors.phone? 'border-destructive':''} value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="07..."/>
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
            <div className="sm:col-span-2 rounded-lg bg-secondary p-4 text-sm">
              We'll notify nearby verified painters. Your contact is shared only after you accept a quote. Deposits are held in escrow for protection.
            </div>
            <div className="sm:col-span-2 flex justify-between">
              <Button variant="secondary" onClick={back}>Back</Button>
              <Button onClick={submit} className="bg-primary">Submit Job</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function PostJobConfirmation() {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-primary"/>
      <h1 className="mt-4 text-2xl font-bold">Your job is live</h1>
      <p className="mt-2 text-muted-foreground">We sent it to nearby painters. You'll receive messages and quotes shortly.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Button onClick={()=>navigate('/find-painter')}>Find a Painter</Button>
        <Button variant="outline" onClick={()=>navigate('/estimator')}>Open Estimator</Button>
      </div>
    </div>
  );
}
