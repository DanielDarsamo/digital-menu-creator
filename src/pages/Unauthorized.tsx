
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Unauthorized = () => {
    const navigate = useNavigate();
    const { signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-destructive/10 rounded-full">
                        <ShieldAlert className="h-16 w-16 text-destructive" />
                    </div>
                </div>

                <h1 className="text-3xl font-display font-bold">Access Denied</h1>
                <p className="text-muted-foreground text-lg">
                    You do not have permission to access this page. Please contact your administrator if you believe this is an error.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </Button>
                    <Button variant="destructive" onClick={handleLogout} className="gap-2">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
