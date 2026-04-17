import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { ADMIN_EMAIL } from "@/lib/config";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email === ADMIN_EMAIL) {
        setAllowed(true);
      } else {
        navigate("/login", { replace: true });
      }
      setChecking(false);
    });
  }, [navigate]);

  if (checking) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-white" />
    </div>
  );

  if (!allowed) return null;

  return <>{children}</>;
}
