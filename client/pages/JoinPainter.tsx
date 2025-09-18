import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, ArrowRight, CheckCircle2, IdCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import SubscriptionBanner, { Plan } from "@/components/site/SubscriptionBanner";

export default function JoinPainter() {
  type Step = 1 | 2 | 3 | 4;
  const [step, setStep] = useState<Step>(1);
  const [showWelcome, setShowWelcome] = useState(true);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [bio, setBio] = useState("");
  const [postcode, setPostcode] = useState("");
  const [radius, setRadius] = useState<number[]>([15]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [skills, setSkills] = useState<string[]>([]);
  const toggleSkill = (s: string) => setSkills((prev) => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s]);

  const [rateMin, setRateMin] = useState<number[]>([18]);
  const [rateMax, setRateMax] = useState<number[]>([35]);
  const [availability, setAvailability] = useState<string[]>([]);
  const toggleAvail = (s: string) => setAvailability((prev) => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s]);

  const [images, setImages] = useState<string[]>([]);
  const [idDocs, setIdDocs] = useState<string[]>([]);
  const [idType, setIdType] = useState<string>("");
  const [idNumber, setIdNumber] = useState<string>("");
  const [idExpiry, setIdExpiry] = useState<string>("");
  const [hasInsurance, setHasInsurance] = useState<boolean>(false);
  const [insuranceInsurer, setInsuranceInsurer] = useState<string>("");
  const [insurancePolicy, setInsurancePolicy] = useState<string>("");
  const [insuranceExpiry, setInsuranceExpiry] = useState<string>("");
  const [insuranceDocs, setInsuranceDocs] = useState<string[]>([]);
  const [tier, setTier] = useState("Starter");
  function choosePlan(p: Plan){
    const mapped = p === 'Professional' ? 'Pro' : p;
    setTier(mapped);
    setShowWelcome(false);
    setStep(1);
  }

  const workFileRef = useRef<HTMLInputElement|null>(null);
  const idFileRef = useRef<HTMLInputElement|null>(null);
  const insuranceFileRef = useRef<HTMLInputElement|null>(null);

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach((f)=>{
      const reader = new FileReader();
      reader.onload = () => setImages(prev => [...prev, String(reader.result)]);
      reader.readAsDataURL(f);
    });
  }

  function onIdFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 2);
    files.forEach((f)=>{
      const reader = new FileReader();
      reader.onload = () => setIdDocs(prev => [...prev, String(reader.result)]);
      reader.readAsDataURL(f);
    });
  }
  function onInsuranceFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 2);
    files.forEach((f)=>{
      const reader = new FileReader();
      reader.onload = () => setInsuranceDocs(prev => [...prev, String(reader.result)]);
      reader.readAsDataURL(f);
    });
  }

  const [errors, setErrors] = useState<Record<string,string>>({});
  const ukPostcode = /^(?:[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2})$/i;

  const schema1 = z.object({
    name: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
    postcode: z.string().regex(ukPostcode, "Use UK format e.g. M1 1AE"),
  }).refine(v => v.password === v.confirmPassword, { message: "Passwords must match", path: ["confirmPassword"] });
  const schema2 = z.object({
    skills: z.array(z.string()).min(1, "Choose at least one skill"),
    rateMin: z.number().min(5),
    rateMax: z.number().min(5),
    availability: z.array(z.string()).min(1, "Select availability"),
  }).refine(v => v.rateMax >= v.rateMin, { message: "Max must be ≥ min", path: ["rateMax"] });
  const schema3 = z.object({ tier: z.string().min(1) });

  function next() {
    if (step === 1) {
      const r = schema1.safeParse({ name, email, password, confirmPassword, postcode });
      if (!r.success) { const e: Record<string,string> = {}; r.error.issues.forEach(i=> e[i.path[0] as string] = i.message); setErrors(e); return; }
      // persist credentials to keep user signed in
      const existing = JSON.parse(localStorage.getItem('paintbook:user')||'null');
      const u = existing && existing.email === email ? existing : { email, roles: ['painter'], verifiedEmail: true, mfaEnabled: false };
      u.email = email; u.password = password; u.verifiedEmail = true; u.activeRole = 'painter';
      localStorage.setItem('paintbook:user', JSON.stringify(u));
      setErrors({});
    }
    if (step === 2) {
      const r = schema2.safeParse({ skills, rateMin: rateMin[0], rateMax: rateMax[0], availability });
      if (!r.success) { const e: Record<string,string> = {}; r.error.issues.forEach(i=> e[i.path[0] as string] = i.message); setErrors(e); return; }
      setErrors({});
    }
    if (step === 3) {
      const r = schema3.safeParse({ tier });
      if (!r.success) { const e: Record<string,string> = {}; r.error.issues.forEach(i=> e[i.path[0] as string] = i.message); setErrors(e); return; }
      setErrors({});
    }
    setStep((s)=> Math.min(4, (s+1) as Step));
  }
  function back() { setStep((s)=> Math.max(1, (s-1) as Step)); }

  function submit() {
    const payload = { name, email, business, bio, postcode, radius: radius[0], skills, rateMin: rateMin[0], rateMax: rateMax[0], availability, images, idDocs, idType, idNumber, idExpiry, tier, idStatus: idDocs.length>0 ? 'pending' : 'not_uploaded', hasInsurance, insuranceInsurer, insurancePolicy, insuranceExpiry, insuranceDocs, insuranceStatus: hasInsurance && insuranceDocs.length>0 ? 'on_file' : 'not_provided' };
    localStorage.setItem('paintbook:joinPainter', JSON.stringify(payload));
    const plan = tier.toLowerCase() === 'premium' ? 'Premium' : (tier.toLowerCase()==='pro' || tier.toLowerCase()==='professional') ? 'Professional' : 'Starter';
    navigate(`/checkout?mode=subscription&plan=${encodeURIComponent(plan)}`);
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Join as a Painter</h1>
        <p className="text-sm text-muted-foreground">Create your profile in minutes. Start a 14‑day free trial on any tier.</p>
      </div>

      {showWelcome ? (
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 text-center">
            <h2 className="text-xl font-semibold">Welcome to PaintBookco — Grow your painting business</h2>
            <p className="mt-2 text-sm text-muted-foreground">Pick a subscription to get verified, showcase your work, and access nearby jobs. You can change plan anytime.</p>
          </div>
          <SubscriptionBanner onSelect={choosePlan} />
        </div>
      ) : null}

      <div className={`mb-6 mt-6 flex gap-2 text-sm ${showWelcome ? 'opacity-50 pointer-events-none' : ''}`}>
        {[1,2,3,4].map(n => (
          <div key={n} className={`flex-1 rounded-full border px-3 py-1 text-center ${step >= n ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-foreground'}`}>Step {n}</div>
        ))}
      </div>

      {!showWelcome && step === 1 && (
        <Card>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <div>
              <Label>Full name</Label>
              <Input aria-invalid={!!errors.name} className={errors.name? 'border-destructive':''} value={name} onChange={(e)=>setName(e.target.value)} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" aria-invalid={!!errors.email} className={errors.email? 'border-destructive':''} value={email} onChange={(e)=>setEmail(e.target.value)} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label>Business name (optional)</Label>
              <Input value={business} onChange={(e)=>setBusiness(e.target.value)} />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} aria-invalid={!!errors.password} placeholder="Choose a password" />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>
            <div>
              <Label>Confirm password</Label>
              <Input type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} aria-invalid={!!errors.confirmPassword} placeholder="Repeat password" />
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label>Short bio</Label>
              <Textarea value={bio} onChange={(e)=>setBio(e.target.value)} rows={4} placeholder="Tell customers about your experience and specialties"/>
            </div>
            <div>
              <Label>Base postcode</Label>
              <Input aria-invalid={!!errors.postcode} className={errors.postcode? 'border-destructive':''} value={postcode} onChange={(e)=>setPostcode(e.target.value)} placeholder="e.g. M1 1AE"/>
              {errors.postcode && <p className="text-xs text-red-500 mt-1">{errors.postcode}</p>}
            </div>
            <div>
              <Label>Coverage radius (miles)</Label>
              <Slider min={5} max={50} step={1} value={radius} onValueChange={setRadius} />
              <div className="text-xs text-muted-foreground mt-1">{radius[0]} miles</div>
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button onClick={next}>Next <ArrowRight className="ml-2 h-4 w-4"/></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!showWelcome && step === 2 && (
        <Card>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="mb-2 block">Select your skills</Label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {['Interior','Exterior','Kitchens','Cabinets','Wallpaper','Plaster repair','Feature walls','Decking/Fences'].map(s => (
                  <label key={s} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={skills.includes(s)} onCheckedChange={()=>toggleSkill(s)} /> {s}
                  </label>
                ))}
              </div>
              {errors.skills && <p className="text-xs text-red-500 mt-1">{errors.skills}</p>}
            </div>
            <div>
              <Label>Min hourly rate (£)</Label>
              <Slider min={10} max={60} step={1} value={rateMin} onValueChange={setRateMin} />
              <div className="text-xs text-muted-foreground mt-1">£{rateMin[0]}/hr</div>
            </div>
            <div>
              <Label>Max hourly rate (£)</Label>
              <Slider min={10} max={80} step={1} value={rateMax} onValueChange={setRateMax} />
              <div className="text-xs text-muted-foreground mt-1">£{rateMax[0]}/hr</div>
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-2 block">Availability</Label>
              <div className="flex flex-wrap gap-3 text-sm">
                {['Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                  <button key={d} type="button" onClick={()=>toggleAvail(d)} className={`rounded-full border px-3 py-1 ${availability.includes(d)?'bg-primary text-primary-foreground border-primary':'bg-secondary'}`}>{d}</button>
                ))}
              </div>
              {errors.availability && <p className="text-xs text-red-500 mt-1">{errors.availability}</p>}
            </div>
            <div className="sm:col-span-2 flex justify-between">
              <Button variant="secondary" onClick={back}>Back</Button>
              <Button onClick={next}>Next <ArrowRight className="ml-2 h-4 w-4"/></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!showWelcome && step === 3 && (
        <Card>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="mb-2 block">Upload 3–6 photos of past work</Label>
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <Input ref={workFileRef} type="file" accept="image/*" multiple onChange={onFiles}/>
                <Button variant="secondary" type="button" onClick={()=>workFileRef.current?.click()} className="sm:w-auto w-full"><Upload className="mr-2 h-4 w-4"/> Add</Button>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Accepted formats: JPG, PNG</div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {images.map((src, i)=>(<img key={i} src={src} className="h-24 w-full rounded object-cover"/>))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-2 block">Upload government ID for verification</Label>
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <Input ref={idFileRef} type="file" accept="image/*,application/pdf" multiple onChange={onIdFiles}/>
                <Button variant="secondary" type="button" onClick={()=>idFileRef.current?.click()} className="sm:w-auto w-full"><IdCard className="mr-2 h-4 w-4"/> Upload ID</Button>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Accepted formats: PDF, JPG, PNG</div>
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
              <div className="mt-2 text-xs text-muted-foreground">
                {idDocs.length === 0 ? 'No ID uploaded yet.' : `${idDocs.length} file${idDocs.length>1?'s':''} uploaded · Verification pending`}
              </div>
            </div>

            <div className="sm:col-span-2 mt-4">
              <Label className="mb-2 block">Do you have public liability insurance?</Label>
              <div className="flex items-center gap-3 text-sm">
                <button type="button" onClick={()=>setHasInsurance(true)} className={`rounded-full border px-3 py-1 ${hasInsurance ? 'bg-primary text-primary-foreground border-primary':'bg-secondary'}`}>Yes</button>
                <button type="button" onClick={()=>setHasInsurance(false)} className={`rounded-full border px-3 py-1 ${!hasInsurance ? 'bg-primary text-primary-foreground border-primary':'bg-secondary'}`}>No</button>
              </div>
              {!hasInsurance ? (
                <div className="mt-2 rounded-md border bg-secondary p-3 text-xs text-foreground">We advise getting insurance and uploading it to access more jobs and earn trust badges.</div>
              ) : (
                <div className="mt-3 grid gap-3">
                  <div className="grid gap-3 md:grid-cols-3">
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
                  <div>
                    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                      <Input ref={insuranceFileRef} type="file" accept="image/*,application/pdf" multiple onChange={onInsuranceFiles} />
                      <Button variant="secondary" type="button" onClick={()=>insuranceFileRef.current?.click()} className="sm:w-auto w-full"><Upload className="mr-2 h-4 w-4"/> Upload Insurance</Button>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Accepted formats: PDF, JPG, PNG</div>
                    <div className="text-xs text-muted-foreground">{insuranceDocs.length} file{ insuranceDocs.length===1? '' : 's' } uploaded</div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label>Choose your tier</Label>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger aria-invalid={!!errors.tier}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Starter">Starter — essentials</SelectItem>
                  <SelectItem value="Pro">Pro — badges & priority</SelectItem>
                  <SelectItem value="Premium">Premium — highest visibility</SelectItem>
                </SelectContent>
              </Select>
              {errors.tier && <p className="text-xs text-red-500 mt-1">{errors.tier}</p>}
              <div className="text-xs text-muted-foreground mt-1">14‑day free trial. Cancel anytime.</div>
            </div>
            <div className="sm:col-span-2 flex justify-between">
              <Button variant="secondary" onClick={back}>Back</Button>
              <Button onClick={next}>Next <ArrowRight className="ml-2 h-4 w-4"/></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!showWelcome && step === 4 && (
        <Card>
          <CardContent className="grid gap-4 p-6">
            <div className="flex items-center gap-2 text-green-600"><CheckCircle2 className="h-5 w-5"/> Review & submit</div>
            <p className="text-sm text-muted-foreground">By submitting you agree to ID verification and platform terms. You can edit your profile later.</p>
            <div className="flex justify-between">
              <Button variant="secondary" onClick={back}>Back</Button>
              <Button onClick={submit}>Create Profile</Button>
            </div>
            <div className="text-xs text-muted-foreground">ID status: {idDocs.length>0 ? 'Pending verification' : 'Not uploaded'}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function JoinPainterComplete(){
  const navigate = useNavigate();
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-primary"/>
      <h1 className="mt-4 text-2xl font-bold">Welcome to PaintBookco</h1>
      <p className="mt-2 text-muted-foreground">Your painter profile is set up. Start your 14‑day trial and browse nearby jobs.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Button onClick={()=>navigate('/dashboard')}>Go to Dashboard</Button>
        <Button variant="outline" onClick={()=>navigate('/find-painter')}>Preview marketplace</Button>
      </div>
    </div>
  );
}
