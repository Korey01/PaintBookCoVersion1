import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function DashboardRouter() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        navigate("/login", { replace: true });
        return;
      }
      const { data: painter } = await supabase
        .from("painters")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (painter) {
        navigate("/dashboard/painter", { replace: true });
      } else {
        navigate("/dashboard/customer", { replace: true });
      }
    });
  }, []);

  return null;
}
