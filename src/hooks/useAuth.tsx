import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  home_city: string | null;
  avatar_url: string | null;
  email: string | null;
};

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const hydrate = async (next: Session | null) => {
      if (!active) return;
      setSession(next);
      if (!next?.user) {
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      const [{ data: prof }, { data: admin }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, first_name, last_name, home_city, avatar_url, email")
          .eq("id", next.user.id)
          .maybeSingle(),
        supabase.rpc("has_role", { _user_id: next.user.id, _role: "admin" }),
      ]);
      if (!active) return;
      setProfile((prof as Profile | null) ?? null);
      setIsAdmin(admin === true);
      setLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setTimeout(() => {
        void hydrate(next);
      }, 0);
    });

    void supabase.auth.getSession().then(({ data }) => hydrate(data.session));

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isAdmin,
      loading,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, profile, isAdmin, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
