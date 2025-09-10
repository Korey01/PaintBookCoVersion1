import Dashboard from "./Dashboard";
import CustomerDashboard from "./CustomerDashboard";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function DashboardRouter(){
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<'painter'|'customer'|'none'>('none');

  useEffect(()=>{
    const u = JSON.parse(localStorage.getItem('paintbook:user')||'null');
    if(!u){ navigate('/auth'); return; }
    const active = u.activeRole || (u.roles?.includes('painter') ? 'painter' : 'customer');
    setRole(active);
    setReady(true);
  },[]);

  if(!ready) return null;

  return (
    <div>
      {role === 'painter' ? <Dashboard /> : <CustomerDashboard />}
    </div>
  );
}
