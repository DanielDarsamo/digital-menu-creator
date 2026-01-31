
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
            console.log('[WaiterAuth] Fetching role for user:', userId);
            const { data, error } = await supabaseWaiter
                .from('profiles')
                .select('role, is_active, full_name')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('[WaiterAuth] Error fetching profile:', error);
                setRole(null);
            } else {
                if (!data.is_active) {
                    console.warn('[WaiterAuth] User is inactive');
                    await signOut();
                    return;
                }

                // Strict check: Only allow if role is explicitly 'waiter'
                if (data.role === 'waiter') {
                    console.log('[WaiterAuth] Access granted for waiter:', data.full_name);
                    setRole('waiter');
                } else {
                    console.warn('[WaiterAuth] Access denied: User is not a waiter (role:', data.role, ')');
                    setRole(null);
                }
            }
        } catch (err) {
            console.error('[WaiterAuth] Unexpected error:', err);
            setRole(null);
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
