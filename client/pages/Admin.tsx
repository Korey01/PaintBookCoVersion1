import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Admin(){
  const [users, setUsers] = useState<any[]>(()=>{
    const painter = JSON.parse(localStorage.getItem('paintbook:joinPainter')||'null');
    return painter ? [{ id: 'p1', name: painter.name || 'Painter', role: 'painter', status: 'verified' }] : [];
  });
  const [jobs, setJobs] = useState<any[]>(()=> JSON.parse(localStorage.getItem('paintbook:jobs')||'[]'));
  const [disputes, setDisputes] = useState<any[]>(()=> JSON.parse(localStorage.getItem('paintbook:disputes')||'[]'));

  function toggleUser(i:number){ setUsers(prev => prev.map((u,idx)=> idx===i ? { ...u, status: u.status==='suspended'?'verified':'suspended' } : u)); }
  function resolveDispute(i:number){ setDisputes(prev => prev.map((d,idx)=> idx===i ? { ...d, status: 'resolved' } : d)); localStorage.setItem('paintbook:disputes', JSON.stringify(disputes)); }

  const metrics = useMemo(()=>({
    activeUsers: users.filter(u=>u.status!=='suspended').length,
    jobs: jobs.length,
    disputesOpen: disputes.filter((d:any)=>d.status!=='resolved').length,
    subscriptions: 0,
  }),[users, jobs, disputes]);

  return (
    <div className="container mx-auto px-4 py-10 grid gap-6">
      <h1 className="text-2xl font-bold">Admin Console</h1>
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded bg-secondary p-4"><div className="text-xs text-muted-foreground">Active users</div><div className="text-2xl font-bold">{metrics.activeUsers}</div></div>
        <div className="rounded bg-secondary p-4"><div className="text-xs text-muted-foreground">Jobs</div><div className="text-2xl font-bold">{metrics.jobs}</div></div>
        <div className="rounded bg-secondary p-4"><div className="text-xs text-muted-foreground">Open disputes</div><div className="text-2xl font-bold">{metrics.disputesOpen}</div></div>
        <div className="rounded bg-secondary p-4"><div className="text-xs text-muted-foreground">Subscriptions</div><div className="text-2xl font-bold">{metrics.subscriptions}</div></div>
      </div>

      <Card><CardContent className="p-4">
        <div className="text-lg font-semibold">Users</div>
        <div className="mt-3 grid gap-2">
          {users.map((u,i)=> (
            <div key={u.id} className="flex items-center justify-between rounded border p-2 text-sm">
              <div>{u.name} · {u.role} · <span className="uppercase">{u.status}</span></div>
              <Button variant="secondary" onClick={()=>toggleUser(i)}>{u.status==='suspended'?'Reinstate':'Suspend'}</Button>
            </div>
          ))}
          {users.length===0 && <p className="text-sm text-muted-foreground">No users yet.</p>}
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-4">
        <div className="text-lg font-semibold">Disputes</div>
        <div className="mt-3 grid gap-2">
          {disputes.map((d:any,i:number)=> (
            <div key={d.id} className="flex items-center justify-between rounded border p-2 text-sm">
              <div>{d.jobTitle} · £{d.amountOnHold} · {d.status}</div>
              <Button variant="secondary" onClick={()=>resolveDispute(i)} disabled={d.status==='resolved'}>Mark resolved</Button>
            </div>
          ))}
          {disputes.length===0 && <p className="text-sm text-muted-foreground">No disputes.</p>}
        </div>
      </CardContent></Card>
    </div>
  );
}
