import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ShieldCheck, Pencil, CreditCard, Trash2 } from "lucide-react";
import { painters } from "@/data/painters";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { removeAccount } from "@/lib/auth";

const JOBS_EVENT = "paintbook:jobs:updated";
const NOTIFICATIONS_EVENT = "paintbook:notifications:updated";

function readJobsFromStorage(): any[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("paintbook:jobs") || "[]"); } catch { return []; }
}

function writeJobsToStorage(jobs: any[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("paintbook:jobs", JSON.stringify(jobs)); } catch {}
}

function readNotificationsFromStorage(): any[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("paintbook:notifications") || "[]"); } catch { return []; }
}

function writeNotificationsToStorage(notifications: any[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("paintbook:notifications", JSON.stringify(notifications)); } catch {}
}

function toNumber(value: unknown): number {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : 0;
}

export default function CustomerDashboard(){
  useEffect(()=>{ document.title = "Customer Dashboard | PaintBook"; },[]);
  const navigate = useNavigate();
  const favIds: string[] = JSON.parse(localStorage.getItem('paintbook:favs')||'[]');
  const favs = painters.filter(p => favIds.includes(p.id));
  const profile = JSON.parse(localStorage.getItem('paintbook:customerProfile')||'{}');
  const membership = JSON.parse(localStorage.getItem('paintbook:customerMembership')||'{}');
  const [jobs, setJobs] = useState<any[]>(() => readJobsFromStorage());
  const [notifications, setNotifications] = useState<any[]>(() => readNotificationsFromStorage());
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState<string>(profile.name || "");
  const [location, setLocation] = useState<string>(profile.location || "");
  const [phone, setPhone] = useState<string>(profile.phone || "");
  const [signupNotice, setSignupNotice] = useState(false);

  const pendingPayments = useMemo(() => jobs.filter((job: any) => job && job.status === 'awaiting_payment' && job.escrowOptIn), [jobs]);
  const escrowNotifications = useMemo(() => notifications.filter((n: any) => n && n.type === 'escrow_payment_due'), [notifications]);
  const paymentAlerts = useMemo(() => pendingPayments.map((job: any) => {
    const notification = escrowNotifications.find((n: any) => n.jobId === job.id);
    const jobAmount = toNumber(job.acceptedAmount) || toNumber(job.budgetMax) || toNumber(job.budgetMin) || 500;
    const escrowFee = toNumber(job.escrowFee ?? job.escrowFeeEstimate ?? 0);
    const totalDue = jobAmount + escrowFee;
    const painterName = job.painterName
      || (typeof job.painter === 'string' ? painters.find(p => p.id === job.painter)?.name : undefined)
      || notification?.painterName
      || 'Confirmed painter';
    const jobTitle = job.jobType ? `${job.jobType} job` : 'Paint job';
    return {
      job,
      notification,
      jobAmount,
      escrowFee,
      totalDue,
      painterName,
      jobTitle,
      createdAt: notification?.createdAt || job.acceptedAt || job.createdAt,
      message: notification?.message,
    };
  }), [pendingPayments, escrowNotifications]);

  function saveProfile(){
    const next = { ...profile, name, location, phone };
    localStorage.setItem('paintbook:customerProfile', JSON.stringify(next));
    setEditOpen(false);
  }

  function handlePay(alert: (typeof paymentAlerts)[number]){
    const baseAmount = Math.round(alert.jobAmount);
    const escrowFee = Math.round(alert.escrowFee);
    const totalDue = Math.round(alert.totalDue);
    const painterName = alert.painterName;

    if (alert.notification && !alert.notification.read) {
      const updatedNotifications = readNotificationsFromStorage().map((n: any) => n.id === alert.notification?.id ? { ...n, read: true, readAt: new Date().toISOString() } : n);
      writeNotificationsToStorage(updatedNotifications);
      setNotifications(updatedNotifications);
      window.dispatchEvent(new Event(NOTIFICATIONS_EVENT));
    }

    const storedJobs = readJobsFromStorage();
    let jobChanged = false;
    const nextJobs = storedJobs.map((j: any) => {
      if (j && j.id === alert.job.id) {
        jobChanged = true;
        return { ...j, status: 'payment_in_progress' };
      }
      return j;
    });
    if (jobChanged) {
      writeJobsToStorage(nextJobs);
      setJobs(nextJobs);
      window.dispatchEvent(new Event(JOBS_EVENT));
    }

    const params = new URLSearchParams({
      mode: 'booking',
      painter: painterName,
      amount: totalDue.toString(),
      baseAmount: baseAmount.toString(),
      escrowFee: escrowFee.toString(),
      job: (alert.job.id || '').toString(),
    });
    navigate(`/checkout?${params.toString()}`);
  }

  function deleteAccount(){
    const current = JSON.parse(localStorage.getItem('paintbook:user') || 'null');
    if (current?.email) {
      removeAccount(current.email);
    }
    localStorage.removeItem('paintbook:user');
    localStorage.removeItem('paintbook:customerProfile');
    navigate('/');
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem('paintbook:lastSignUpNotice') === 'customer') {
      setSignupNotice(true);
      sessionStorage.removeItem('paintbook:lastSignUpNotice');
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncJobs = () => setJobs(readJobsFromStorage());
    const syncNotifications = () => setNotifications(readNotificationsFromStorage());
    window.addEventListener(JOBS_EVENT, syncJobs);
    window.addEventListener(NOTIFICATIONS_EVENT, syncNotifications);
    window.addEventListener("storage", syncJobs);
    window.addEventListener("storage", syncNotifications);
    return () => {
      window.removeEventListener(JOBS_EVENT, syncJobs);
      window.removeEventListener(NOTIFICATIONS_EVENT, syncNotifications);
      window.removeEventListener("storage", syncJobs);
      window.removeEventListener("storage", syncNotifications);
    };
  }, []);

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

      {paymentAlerts.length > 0 && (
        <div className="grid gap-3">
          {paymentAlerts.map(alert => (
            <Card key={alert.job.id || alert.jobTitle} className="border-primary/30 bg-primary/5">
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-primary">Job accepted — secure payment</div>
                    <div className="text-sm text-muted-foreground">{alert.jobTitle} · {alert.painterName}</div>
                    <div className="text-xs text-muted-foreground">Estimated total £{alert.jobAmount.toLocaleString('en-GB')} + escrow fee £{alert.escrowFee.toLocaleString('en-GB')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">£{alert.totalDue.toLocaleString('en-GB')}</div>
                    {alert.createdAt && <div className="text-xs text-muted-foreground">{new Date(alert.createdAt).toLocaleDateString()}</div>}
                  </div>
                </div>
                {alert.message && <p className="text-sm text-muted-foreground">{alert.message}</p>}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span>Stripe holds your funds until you approve the job.</span>
                  <Button size="sm" onClick={()=>handlePay(alert)} className="bg-primary text-primary-foreground">Pay securely</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium">Profile & Settings</div>
            <div className="mt-2 text-sm">Name: {profile.name || '—'}</div>
            <div className="text-sm">Location: {profile.location || '—'}</div>
            <div className="text-sm">Phone: {profile.phone || '—'}</div>
            <Button className="mt-3 w-full" variant="outline" onClick={()=>setEditOpen(true)}><Pencil className="mr-2 h-4 w-4"/> Edit Profile</Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium">Membership</div>
            <div className="mt-2 text-sm">Current: <Badge variant="outline">{membership.plan || 'Free'}</Badge></div>
            <Button className="mt-3 w-full" variant="secondary" onClick={()=>setMemberOpen(true)}><CreditCard className="mr-2 h-4 w-4"/> Manage</Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium">Payments & Escrow</div>
            <div className="mt-2 grid gap-1 text-xs">
              <div className="mb-2 rounded-lg bg-secondary p-2 text-xs">100% escrow protection — your full payment is held until you approve the job (via Stripe (FCA-regulated payment partner)). <a className="underline" href="/escrow-demo/customer">View demo</a></div>
              {JSON.parse(localStorage.getItem('paintbook:payments')||'[]').filter((p:any)=>p.mode==='booking').slice(0,5).map((p:any)=> (
                <div key={p.ref} className="flex items-center justify-between"><span>{new Date(p.createdAt).toLocaleDateString()} · {p.painter}</span><span>£{p.amount}</span></div>
              ))}
              {JSON.parse(localStorage.getItem('paintbook:payments')||'[]').filter((p:any)=>p.mode==='booking').length===0 && (
                <div className="text-muted-foreground">No deposits yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
        <div className="mt-3 flex gap-3">
          <Button variant="secondary" onClick={()=>navigate('/disputes')}>Open Dispute</Button>
          <Button variant="outline" onClick={deleteAccount}><Trash2 className="mr-2 h-4 w-4"/> Delete account</Button>
        </div>
      </section>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit profile</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>Full name</Label>
              <Input value={name} onChange={(e)=>setName(e.target.value)} />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={location} onChange={(e)=>setLocation(e.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={phone} onChange={(e)=>setPhone(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={()=>setEditOpen(false)}>Cancel</Button>
              <Button onClick={saveProfile}>Save changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={memberOpen} onOpenChange={setMemberOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Manage membership</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>Plan</Label>
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger><SelectValue placeholder="Select"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Customer Plus">Customer Plus · £5/mo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={plan==='Free' ? saveMembership : startSubscription}>{plan==='Free' ? 'Save' : 'Upgrade'}</Button>
              <Button variant="secondary" onClick={()=>{ setPlan('Free'); saveMembership(); }}>Cancel membership</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
