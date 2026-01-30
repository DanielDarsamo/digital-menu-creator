
import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabaseWaiter } from "@/lib/supabase-waiter";
import { AuthContext, UserRole } from "./AuthContext";

export const WaiterAuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabaseWaiter.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserRole(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabaseWaiter.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                setRole(null);
                fetchUserRole(session.user.id);
            } else {
                setRole(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserRole = async (userId: string) => {
        try {
            const { data, error } = await supabaseWaiter
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('WaiterAuth: Error fetching role:', error);
                setRole(null);
            } else {
                setRole(data?.role as UserRole);
            }
        } catch (err) {
            console.error('WaiterAuth: Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await supabaseWaiter.auth.signOut();
        setRole(null);
        setUser(null);
        setSession(null);
    };

    const value = {
        user,
        session,
        role,
        loading,
        isAdmin: role === 'admin',
        isWaiter: role === 'waiter',
        signOut,
        supabase: supabaseWaiter,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
