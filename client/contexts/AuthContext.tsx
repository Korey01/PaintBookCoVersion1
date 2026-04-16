import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type UserRole = "painter" | "customer" | "admin" | null;

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  painterProfile: any | null;
  customerProfile: any | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  painterProfile: null,
  customerProfile: null,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const ADMIN_EMAIL = "o.a.alashe@paintbookco.co.uk";

async function detectRole(userId: string, email: string): Promise<{
  role: UserRole;
  painterProfile: any | null;
}> {
  if (email === ADMIN_EMAIL) {
    return { role: "admin", painterProfile: null };
  }
  try {
    const { data } = await supabase
      .from("painters")
      .select("id, kyc_status, is_active, insurance_verified, first_name, last_name, email, phone, postcode, city, bio, specialisms, service_radius_km, avg_rating, completed_jobs, gallery_size_bytes, insurance_submitted_at, insurance_company, insurance_policy_number, insurance_expiry_date, insurance_certificate_url, terms_accepted, profile_complete, transpact_registered, kyc_rejection_reason")
      .eq("user_id", userId)
      .maybeSingle();
    if (data) return { role: "painter", painterProfile: data };
  } catch (err) {
    console.error("Role detection error:", err);
  }
  return { role: "customer", painterProfile: null };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [painterProfile, setPainterProfile] = useState<any | null>(null);
  const [customerProfile] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;

    // onAuthStateChange fires INITIAL_SESSION on mount for returning users,
    // covering the getSession() case without a second painters table query.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        if (event === "TOKEN_REFRESHED") return;
        if (session?.user) {
          const { role: r, painterProfile: p } =
            await detectRole(session.user.id, session.user.email ?? "");
          if (!mounted) return;
          setUser(session.user);
          setRole(r);
          setPainterProfile(p);
        } else {
          setUser(null);
          setRole(null);
          setPainterProfile(null);
        }
        setLoading(false);
      }
    );

    const timeout = setTimeout(() => {
      if (mounted) setLoading(() => false);
    }, 6000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setPainterProfile(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{
      user, role, loading, painterProfile, customerProfile, signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export type { UserRole };
export default AuthContext;
