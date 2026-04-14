import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

async function detectRole(userId: string): Promise<"painter" | "customer"> {
  const { data } = await supabase
    .from("painters")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return data ? "painter" : "customer";
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"painter" | "customer" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const r = await detectRole(session.user.id);
        setRole(r);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const r = await detectRole(session.user.id);
        setRole(r);
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, role, loading };
}
