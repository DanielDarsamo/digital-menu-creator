
import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { AuthContext, UserRole } from "./AuthContext";

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabaseAdmin.auth.getSession().then(({ data: { session } }) => {
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
        } = supabaseAdmin.auth.onAuthStateChange((_event, session) => {
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
            console.log('[AdminAuth] Fetching role for user:', userId);
            const { data, error } = await supabaseAdmin
                .from('profiles')
                .select('role, is_active, full_name')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('[AdminAuth] Error fetching profile:', error);
                setRole(null);
            } else {
                if (!data.is_active) {
                    console.warn('[AdminAuth] User is inactive');
                    await signOut();
                    return;
                }

                // Strict check: Only allow if role is explicitly 'admin'
                if (data.role === 'admin') {
                    console.log('[AdminAuth] Access granted for admin:', data.full_name);
                    setRole('admin');
                } else {
                    console.warn('[AdminAuth] Access denied: User is not an admin (role:', data.role, ')');
                    setRole(null);
                }
            }
        } catch (err) {
            console.error('[AdminAuth] Unexpected error:', err);
            setRole(null);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await supabaseAdmin.auth.signOut();
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
        supabase: supabaseAdmin,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
