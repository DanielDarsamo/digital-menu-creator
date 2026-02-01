
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

import { SupabaseClient } from "@supabase/supabase-js";

interface LoginProps {
    supabaseClient?: SupabaseClient;
}

const Login = ({ supabaseClient = supabase }: LoginProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine which client is being used to show in UI (helper for dev)
    const isCustomClient = supabaseClient !== supabase;

    // Redirect to this path after login if it was set
    const from = location.state?.from?.pathname || "/";

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.session) {
                console.log('[Login] User logged in:', data.session.user.id);

                // Try to fetch role to determine redirect
                let role = null;
                try {
                    const { data: profile, error: profileError } = await supabaseClient
                        .from('profiles')
                        .select('role')
                        .eq('id', data.session.user.id)
                        .single();

                    if (profileError) {
                        console.error('[Login] Error fetching profile:', profileError);
                    } else {
                        role = profile?.role;
                        console.log('[Login] Fetched role from profile:', role);
                    }
                } catch (err) {
                    console.error('[Login] Exception fetching profile:', err);
                }

                // FALLBACK: Determine role from current path if fetch failed
                if (!role) {
                    const currentPath = location.pathname;
                    if (currentPath.includes('/admin')) {
                        role = 'admin';
                        console.log('[Login] Using fallback role based on path: admin');
                    } else if (currentPath.includes('/waiter')) {
                        role = 'waiter';
                        console.log('[Login] Using fallback role based on path: waiter');
                    }
                }

                toast({
                    title: "Logged in successfully",
                    description: `Welcome back!`,
                });

                // Navigate based on role
                if (role === 'admin') {
                    navigate('/admin');
                } else if (role === 'waiter') {
                    navigate('/waiter');
                } else {
                    // Default or unknown role
                    navigate('/');
                }
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Login failed",
                description: error.message || "Please check your credentials",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-md mx-4">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Fortaleza De Sabores</CardTitle>
                    <CardDescription className="text-center">
                        Sign in to access the dashboard
                    </CardDescription>
                    {isCustomClient && (
                        <div className="mt-2 text-xs font-mono text-center text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                            DEV MODE: Alternate Auth Client Active
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
