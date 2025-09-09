import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function JoinPainter() {
  type Step = 1 | 2 | 3 | 4;
  const [step, setStep] = useState<Step>(1);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [bio, setBio] = useState("");
  const [postcode, setPostcode] = useState("");
  const [radius, setRadius] = useState<number[]>([15]);

  const [skills, setSkills] = useState<string[]>([]);
  const toggleSkill = (s: string) => setSkills((prev) => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s]);

  const [rateMin, setRateMin] = useState<number[]>([18]);
  const [rateMax, setRateMax] = useState<number[]>([35]);
  const [availability, setAvailability] = useState<string[]>([]);
  const toggleAvail = (s: string) => setAvailability((prev) => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s]);

  const [images, setImages] = useState<string[]>([]);
  const [tier, setTier] = useState("Starter");

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach((f)=>{
      const reader = new FileReader();
      reader.onload = () => setImages(prev => [...prev, String(reader.result)]);
      reader.readAsDataURL(f);
    });
  }

  function next() { setStep((s)=> Math.min(4, (s+1) as Step)); }
  function back() { setStep((s)=> Math.max(1, (s-1) as Step)); }

  function submit() {
    const payload = { name, email, business, bio, postcode, radius: radius[0], skills, rateMin: rateMin[0], rateMax: rateMax[0], availability, images, tier };
    localStorage.setItem('paintbook:joinPainter', JSON.stringify(payload));
    navigate('/join-painter/completed');
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Join as a Painter</h1>
        <p className="text-sm text-muted-foreground">Create your profile in minutes. Start a 14‑day free trial on any tier.</p>
      </div>

      <div className="mb-6 flex gap-2 text-sm">
        {[1,2,3,4].map(n => (
          <div key={n} className={`flex-1 rounded-full border px-3 py-1 text-center ${step >= n ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-foreground'}`}>Step {n}</div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <div>
              <Label>Full name</Label>
              <Input value={name} onChange={(e)=>setName(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Business name (optional)</Label>
              <Input value={business} onChange={(e)=>setBusiness(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Short bio</Label>
              <Textarea value={bio} onChange={(e)=>setBio(e.target.value)} rows={4} placeholder="Tell customers about your experience and specialties"/>
            </div>
            <div>
              <Label>Base postcode</Label>
              <Input value={postcode} onChange={(e)=>setPostcode(e.target.value)} placeholder="e.g. M1 1AE"/>
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

      {step === 2 && (
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
            </div>
            <div className="sm:col-span-2 flex justify-between">
              <Button variant="secondary" onClick={back}>Back</Button>
              <Button onClick={next}>Next <ArrowRight className="ml-2 h-4 w-4"/></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="mb-2 block">Upload 3–6 photos of past work</Label>
              <div className="flex items-center gap-3">
                <Input type="file" accept="image/*" multiple onChange={onFiles}/>
                <Button variant="secondary"><Upload className="mr-2 h-4 w-4"/> Add</Button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {images.map((src, i)=>(<img key={i} src={src} className="h-24 w-full rounded object-cover"/>))}
              </div>
            </div>
            <div>
              <Label>Choose your tier</Label>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Starter">Starter — essentials</SelectItem>
                  <SelectItem value="Pro">Pro — badges & priority</SelectItem>
                  <SelectItem value="Premium">Premium — highest visibility</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground mt-1">14‑day free trial. Cancel anytime.</div>
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
          <CardContent className="grid gap-4 p-6">
            <div className="flex items-center gap-2 text-green-600"><CheckCircle2 className="h-5 w-5"/> Review & submit</div>
            <p className="text-sm text-muted-foreground">By submitting you agree to ID verification and platform terms. You can edit your profile later.</p>
            <div className="flex justify-between">
              <Button variant="secondary" onClick={back}>Back</Button>
              <Button onClick={submit}>Create Profile</Button>
            </div>
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
      <h1 className="mt-4 text-2xl font-bold">Welcome to PaintBook</h1>
      <p className="mt-2 text-muted-foreground">Your painter profile is set up. Start your 14‑day trial and browse nearby jobs.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Button onClick={()=>navigate('/dashboard')}>Go to Dashboard</Button>
        <Button variant="outline" onClick={()=>navigate('/find-painter')}>Preview marketplace</Button>
      </div>
    </div>
  );
}
