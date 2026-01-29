
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    LayoutDashboard,
    UtensilsCrossed,
    Users,
    BarChart3,
    LogOut,
    Menu as MenuIcon,
    ArrowLeft
} from "lucide-react";
import { toast } from "sonner";

// Import sub-components (We will refactor the existing order list into a sub-component in the next step, 
// for now we will keep the structure clean)
import AdminOrdersView from "@/components/admin/AdminOrdersView";
import MenuManagement from "@/components/admin/MenuManagement";

// Placeholder components for new features


const StaffManagement = () => (
    <div className="p-8 text-center border rounded-lg bg-muted/20">
        <h2 className="text-xl font-bold mb-2">Staff Management</h2>
        <p className="text-muted-foreground">Manage waiters and admin accounts.</p>
        <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded inline-block">
            Coming Soon in Phase 3
        </div>
    </div>
);

const AnalyticsDashboard = () => (
    <div className="p-8 text-center border rounded-lg bg-muted/20">
        <h2 className="text-xl font-bold mb-2">Analytics & Reports</h2>
        <p className="text-muted-foreground">View business intelligence and performance metrics.</p>
        <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded inline-block">
            Coming Soon in Phase 3
        </div>
    </div>
);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { signOut, user } = useAuth();
    const [activeTab, setActiveTab] = useState("orders");

    const handleLogout = async () => {
        await signOut();
        toast.success("Logged out successfully");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Top Navigation */}
            <header className="border-b bg-card">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <LayoutDashboard className="h-5 w-5" />
                                Admin Portal
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm text-right hidden md:block">
                            <p className="font-medium">{user?.email}</p>
                            <p className="text-xs text-muted-foreground">Administrator</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 h-auto p-1 bg-muted/50 gap-1 rounded-xl">
                        <TabsTrigger value="orders" className="py-2.5 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <MenuIcon className="w-4 h-4 mr-2" />
                            Orders
                        </TabsTrigger>
                        <TabsTrigger value="menu" className="py-2.5 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <UtensilsCrossed className="w-4 h-4 mr-2" />
                            Menu
                        </TabsTrigger>
                        <TabsTrigger value="staff" className="py-2.5 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <Users className="w-4 h-4 mr-2" />
                            Staff
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="py-2.5 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Analytics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="orders" className="space-y-4 animate-in fade-in-50 duration-500">
                        <AdminOrdersView />
                    </TabsContent>

                    <TabsContent value="menu" className="space-y-4 animate-in fade-in-50 duration-500">
                        <MenuManagement />
                    </TabsContent>

                    <TabsContent value="staff" className="space-y-4 animate-in fade-in-50 duration-500">
                        <StaffManagement />
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-4 animate-in fade-in-50 duration-500">
                        <AnalyticsDashboard />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default AdminDashboard;
