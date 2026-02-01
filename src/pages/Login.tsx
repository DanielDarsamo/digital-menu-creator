
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
    const [isSignUp, setIsSignUp] = useState(false);
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                // SIGN UP FLOW
                const { data, error } = await supabaseClient.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            phone: phone,
                        }
                    }
                });

                if (error) throw error;

                // Create profile if not created by trigger (manual fallback)
                if (data.user) {
                    // We try to insert profile just in case trigger is missing or delayed
                    const { error: profileError } = await supabaseClient
                        .from('profiles')
                        .upsert({
                            id: data.user.id,
                            full_name: fullName,
                            phone: phone,
                            role: null, // Default to no role, awaiting admin approval
                            is_active: false // Explicitly inactive until approved
                        }, { onConflict: 'id' });

                    if (profileError) console.error('Error creating profile:', profileError);
                }

                toast({
                    title: "Registration successful",
                    description: "Please wait for an administrator to approve your account.",
                });
                setIsSignUp(false); // Switch back to login
            } else {
                // LOGIN FLOW
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                if (data.session) {
                    // ... existing login redirect logic ...
                    console.log('[Login] User logged in:', data.session.user.id);

                    // Try to fetch role
                    let role = null;
                    try {
                        const { data: profile, error: profileError } = await supabaseClient
                            .from('profiles')
                            .select('role, is_active')
                            .eq('id', data.session.user.id)
                            .single();

                        if (profileError) {
                            console.error('[Login] Error fetching profile:', profileError);
                        } else {
                            if (!profile.is_active) {
                                await supabaseClient.auth.signOut();
                                toast({
                                    variant: "destructive",
                                    title: "Account Inactive",
                                    description: "Your account is waiting for approval or has been deactivated.",
                                });
                                setLoading(false);
                                return;
                            }
                            role = profile?.role;
                        }
                    } catch (err) {
                        console.error('[Login] Exception fetching profile:', err);
                    }

                    // FALLBACK role logic
                    if (!role) {
                        const currentPath = location.pathname;
                        if (currentPath.includes('/admin')) role = 'admin';
                        else if (currentPath.includes('/waiter')) role = 'waiter';
                    }

                    toast({
                        title: "Logged in successfully",
                        description: "Welcome back!",
                    });

                    if (role === 'admin') navigate('/admin');
                    else if (role === 'waiter') navigate('/waiter');
                    else navigate('/');
                }
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: isSignUp ? "Registration failed" : "Login failed",
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
                        {isSignUp ? "Create a new staff account" : "Sign in to access the dashboard"}
                    </CardDescription>
                    {isCustomClient && (
                        <div className="mt-2 text-xs font-mono text-center text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                            DEV MODE: Alternate Auth Client Active
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAuth} className="space-y-4">
                        {isSignUp && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        placeholder="John Doe"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone (Optional)</Label>
                                    <Input
                                        id="phone"
                                        placeholder="+258..."
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </>
                        )}
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
                            {loading ? "Processing..." : (isSignUp ? "Register" : "Sign In")}
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">
                                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-primary hover:underline font-medium"
                            >
                                {isSignUp ? "Sign In" : "Sign Up"}
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
