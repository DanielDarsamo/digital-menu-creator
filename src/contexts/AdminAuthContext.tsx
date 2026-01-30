
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
            const { data, error } = await supabaseAdmin
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('AdminAuth: Error fetching role:', error);
                setRole(null);
            } else {
                setRole(data?.role as UserRole);
            }
        } catch (err) {
            console.error('AdminAuth: Unexpected error:', err);
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
