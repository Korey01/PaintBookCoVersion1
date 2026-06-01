import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { z } from "zod";

export default function Support(){
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string,string>>({});

  const schema = z.object({ email: z.string().email("Enter a valid email"), subject: z.string().min(3, "Add a subject"), message: z.string().min(10, "Tell us a bit more")});

  function submit(){
    const r = schema.safeParse({ email, subject, message });
    if(!r.success){ const e: Record<string,string> = {}; r.error.issues.forEach(i=> e[i.path[0] as string] = i.message); setErrors(e); return; }
    setErrors({});
    const ticket = { id: `s${Date.now()}`, email, subject, message, createdAt: new Date().toISOString(), status: 'open' };
    const list = JSON.parse(localStorage.getItem('paintbook:support')||'[]');
    list.unshift(ticket);
    localStorage.setItem('paintbook:support', JSON.stringify(list));
    setEmail(""); setSubject(""); setMessage("");
  }

  return (
    <div className="container mx-auto px-4 py-10 grid gap-8 md:grid-cols-[1fr_420px]" style={{ background: '#FBF7F0', minHeight: '100vh' }}>
      <section>
        <h1 className="text-2xl font-bold">Help & Support</h1>
        <p className="text-sm text-muted-foreground">Articles and contact for jobs, onboarding, subscriptions, and escrow.</p>
        <div className="mt-6 grid gap-4">
          {[{
            q: 'How do deposits and escrow work?', a: 'You pay a 30–40% deposit into secure escrow. Funds are released only when you confirm satisfactory completion.'
          },{
            q: 'How do I verify my ID and insurance?', a: 'Upload documents in your dashboard. Our team verifies within 1–2 business days.'
          },{
            q: 'How do I cancel my subscription?', a: 'Manage your tier from Dashboard → Subscription. You can cancel anytime and keep access until period end.'
          }].map((f, i)=>(
            <Card key={i}><CardContent className="p-4"><div className="font-medium">{f.q}</div><p className="text-sm text-muted-foreground mt-1">{f.a}</p></CardContent></Card>
          ))}
        </div>
      </section>
      <aside>
        <Card>
          <CardContent className="p-6 grid gap-3">
            <div className="text-lg font-semibold">Contact support</div>
            <div>
              <Label>Email</Label>
              <Input aria-invalid={!!errors.email} className={errors.email? 'border-destructive':''} value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label>Subject</Label>
              <Input aria-invalid={!!errors.subject} className={errors.subject? 'border-destructive':''} value={subject} onChange={e=>setSubject(e.target.value)} />
              {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
            </div>
            <div>
              <Label>Message</Label>
              <Textarea aria-invalid={!!errors.message} className={errors.message? 'border-destructive':''} rows={5} value={message} onChange={e=>setMessage(e.target.value)} />
              {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
            </div>
            <Button onClick={submit}>Submit ticket</Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
