import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

// ── KYC Status Types ──────────────────────────────────────────────────────────
export type KYCStatus = "pending" | "approved" | "rejected";

export interface KYCData {
  status: KYCStatus;
  submitted_at: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  document_url: string | null;
}

// ── User Profile Types ────────────────────────────────────────────────────────
export type UserRole = "customer" | "painter";

export interface CustomerProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  kyc_status: KYCStatus;
  created_at: string;
  updated_at: string;
}

export interface PainterProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  postcode: string;
  specialisms: string[];
  avatar_url: string | null;
  kyc_status: KYCStatus;
  kyc_document_url: string | null;
  kyc_submitted_at: string | null;
  kyc_verified_at: string | null;
  kyc_rejection_reason: string | null;
  commission_tier: number;
  rating: number | null;
  review_count: number;
  verified_badge: boolean;
  created_at: string;
  updated_at: string;
}

// ── Auth Context Type ────────────────────────────────────────────────────────
export interface AuthContextType {
  // Auth state
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  authenticated: boolean;

  // User data
  customerProfile: CustomerProfile | null;
  painterProfile: PainterProfile | null;

  // KYC
  kycStatus: KYCStatus | null;

  // Auth methods
  signUp: (
    email: string,
    password: string,
    role: UserRole,
    metadata: Record<string, any>
  ) => Promise<{ user: User | null; error: string | null }>;

  signIn: (email: string, password: string) => Promise<{ error: string | null }>;

  signOut: () => Promise<void>;

  resetPassword: (email: string) => Promise<{ error: string | null }>;

  // KYC methods
  submitKYC: (
    role: UserRole,
    documentUrl: string
  ) => Promise<{ error: string | null }>;

  updateProfile: (
    role: UserRole,
    data: Partial<CustomerProfile | PainterProfile>
  ) => Promise<{ error: string | null }>;
}

// ── Context Creation ──────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

// ── Auth Provider Component ───────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(
    null
  );
  const [painterProfile, setPainterProfile] = useState<PainterProfile | null>(
    null
  );

  // ── Subscribe to auth changes ─────────────────────────────────────────────
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Only process relevant auth events
      if (event === "TOKEN_REFRESHED") return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        try {
          const { data: painterData } = await supabase
            .from("painters")
            .select("id, kyc_status, is_active, insurance_verified, first_name, last_name, email, phone, postcode, city, bio, specialisms, service_radius_km, avg_rating, completed_jobs, gallery_size_bytes, insurance_submitted_at, insurance_company, insurance_policy_number, insurance_expiry_date, insurance_certificate_url, terms_accepted, profile_complete, transpact_registered, kyc_rejection_reason")
            .eq("user_id", currentUser.id)
            .maybeSingle();

          if (painterData) {
            setRole("painter");
            setPainterProfile(painterData);
            setCustomerProfile(null);
          } else {
            setRole("customer");
            setPainterProfile(null);
            setCustomerProfile(null);
          }
        } catch (err) {
          console.error("Role detection error:", err);
          setRole("customer");
        }
      } else {
        setRole(null);
        setCustomerProfile(null);
        setPainterProfile(null);
      }
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // ── Authentication Methods ────────────────────────────────────────────────
  async function signUp(
    email: string,
    password: string,
    role_: UserRole,
    metadata: Record<string, any>
  ): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email,
          password,
          options: {
            data: { ...metadata, role: role_ },
          },
        }
      );

      if (signUpError) {
        return { user: null, error: signUpError.message };
      }

      const newUser = authData.user;
      if (!newUser) {
        return { user: null, error: "User creation failed" };
      }

      // Create role-specific profile record
      if (role_ === "painter") {
        const { error: insertError } = await supabase.from("painters").insert({
          user_id: newUser.id,
          first_name: metadata.first_name || "",
          last_name: metadata.last_name || "",
          email: newUser.email!,
          phone: metadata.phone || "",
          postcode: metadata.postcode || "",
          specialisms: metadata.specialisms || [],
          kyc_status: "pending",
        });

        if (insertError) {
          return {
            user: newUser,
            error: `Profile creation failed: ${insertError.message}`,
          };
        }
      } else {
        const { error: insertError } = await supabase
          .from("customers")
          .insert({
            user_id: newUser.id,
            full_name: metadata.full_name || "",
            email: newUser.email!,
            kyc_status: "pending",
          });

        if (insertError) {
          return {
            user: newUser,
            error: `Profile creation failed: ${insertError.message}`,
          };
        }
      }

      return { user: newUser, error: null };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error.message : "Sign up failed",
      };
    }
  }

  async function signIn(
    email: string,
    password: string
  ): Promise<{ error: string | null }> {
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        return { error: signInError.message };
      }

      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Sign in failed",
      };
    }
  }

  async function signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
      setCustomerProfile(null);
      setPainterProfile(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }

  async function resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectUrl: `${window.location.origin}/reset-password-confirm`,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Password reset failed",
      };
    }
  }

  // ── KYC Methods ───────────────────────────────────────────────────────────
  async function submitKYC(
    role_: UserRole,
    documentUrl: string
  ): Promise<{ error: string | null }> {
    if (!user) return { error: "Not authenticated" };

    try {
      const tableName = role_ === "painter" ? "painters" : "customers";

      const { error } = await supabase
        .from(tableName)
        .update({
          kyc_status: "submitted",
          kyc_document_url: documentUrl,
          kyc_submitted_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) {
        return { error: error.message };
      }

      // Update local state
      if (role_ === "painter" && painterProfile) {
        setPainterProfile({
          ...painterProfile,
          kyc_status: "submitted",
          kyc_document_url: documentUrl,
          kyc_submitted_at: new Date().toISOString(),
        });
      } else if (role_ === "customer" && customerProfile) {
        setCustomerProfile({
          ...customerProfile,
          kyc_status: "submitted",
        });
      }

      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "KYC submission failed",
      };
    }
  }

  async function updateProfile(
    role_: UserRole,
    data: Partial<CustomerProfile | PainterProfile>
  ): Promise<{ error: string | null }> {
    if (!user) return { error: "Not authenticated" };

    try {
      const tableName = role_ === "painter" ? "painters" : "customers";

      const { error } = await supabase
        .from(tableName)
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) {
        return { error: error.message };
      }

      // Update local state
      if (role_ === "painter" && painterProfile) {
        setPainterProfile({ ...painterProfile, ...data });
      } else if (role_ === "customer" && customerProfile) {
        setCustomerProfile({ ...customerProfile, ...data });
      }

      return { error: null };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Profile update failed",
      };
    }
  }

  const value: AuthContextType = {
    user,
    role,
    loading,
    authenticated: !!user,
    customerProfile,
    painterProfile,
    kycStatus: role === "painter" ? painterProfile?.kyc_status ?? null : customerProfile?.kyc_status ?? null,
    signUp,
    signIn,
    signOut,
    resetPassword,
    submitKYC,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Custom Hook ───────────────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
