
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session, SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";


export type UserRole = "admin" | "waiter" | null;

interface AuthContextType {
    user: User | null;
    session: Session | null;
    role: UserRole;
    loading: boolean;
    isAdmin: boolean;
    isWaiter: boolean;
    signOut: () => Promise<void>;
    supabase: SupabaseClient;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    role: null,
    loading: true,
    isAdmin: false,
    isWaiter: false,
    signOut: async () => { },
    supabase: supabase,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
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
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                // Only fetch if role isn't already set or user changed
                setRole(null); // Clear previous role to avoid conflation
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
            const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userId)
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error('Error fetching role:', error);
                setRole(null);
            } else {
                setRole(data?.role as UserRole);
            }
        } catch (err) {
            console.error('Unexpected error fetching role:', err);
            setRole(null);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
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
        supabase,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
