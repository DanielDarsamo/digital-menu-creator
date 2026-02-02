
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { StaffService, StaffProfile } from "@/services/staffService";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, ShieldCheck, User as UserIcon, RefreshCw, AlertCircle, Phone, Power, PowerOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const StaffManagement = () => {
    const { supabase, user: currentUser } = useAuth();
    const [staff, setStaff] = useState<StaffProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadStaff = async () => {
        setIsLoading(true);
        try {
            const data = await StaffService.getAllStaff(supabase);
            setStaff(data);
        } catch (error) {
            toast.error("Failed to load staff list");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadStaff();
    }, []);

    const handleRoleChange = async (staffId: string, newRole: 'admin' | 'waiter' | 'chef') => {
        if (staffId === currentUser?.id) {
            toast.error("You cannot change your own role");
            return;
        }

        try {
            await StaffService.updateStaffRole(staffId, newRole, supabase);
            toast.success(`Role updated to ${newRole}`);
            setStaff(prev => prev.map(s => s.id === staffId ? { ...s, role: newRole } : s));
        } catch (error) {
            toast.error("Failed to update role");
        }
    };

    const handleStatusToggle = async (staffId: string, currentStatus: boolean) => {
        if (staffId === currentUser?.id) {
            toast.error("You cannot deactivate yourself");
            return;
        }

        try {
            const newStatus = !currentStatus;
            await StaffService.updateStaffStatus(staffId, newStatus, supabase);
            toast.success(`Staff member ${newStatus ? 'activated' : 'deactivated'}`);
            setStaff(prev => prev.map(s => s.id === staffId ? { ...s, is_active: newStatus } : s));
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (staffId: string) => {
        if (staffId === currentUser?.id) {
            toast.error("You cannot delete your own profile");
            return;
        }

        if (!confirm("Are you sure? This will revoke their access immediately.")) return;

        try {
            const success = await StaffService.deleteStaff(staffId, supabase);
            if (success) {
                toast.success("Staff profile removed");
                setStaff(prev => prev.filter(s => s.id !== staffId));
            }
        } catch (error) {
            toast.error("Failed to remove staff");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-display font-bold text-foreground">Staff Management</h2>
                    <p className="text-muted-foreground">Manage roles and permissions for your team.</p>
                </div>
                <Button onClick={loadStaff} variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </Button>
            </div>

            <Card className="border-none shadow-premium bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        Team Members
                    </CardTitle>
                    <CardDescription>
                        Administrators have full access, Waiters and Chefs have focused dashboards.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border bg-background/50">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px]">Member</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Last Login</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {staff.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8">
                                            No staff members found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    staff.map((member) => (
                                        <TableRow key={member.id} className="hover:bg-muted/50 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {member.full_name?.[0] || <UserIcon className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium flex items-center gap-2">
                                                            {member.full_name || "Unknown"}
                                                            {member.id === currentUser?.id && (
                                                                <Badge variant="secondary" className="text-[10px] py-0">You</Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground font-mono truncate max-w-[150px]">
                                                            {member.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                                    {member.phone || <span className="text-muted-foreground italic text-xs">No phone</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={member.role}
                                                    onValueChange={(val: any) => handleRoleChange(member.id, val)}
                                                    disabled={member.id === currentUser?.id}
                                                >
                                                    <SelectTrigger className="w-[110px] h-8 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                        <SelectItem value="waiter">Waiter</SelectItem>
                                                        <SelectItem value="chef">Chef</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={member.is_active}
                                                        onCheckedChange={() => handleStatusToggle(member.id, member.is_active)}
                                                        disabled={member.id === currentUser?.id}
                                                    />
                                                    <Badge variant={member.is_active ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                                                        {member.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs">
                                                {member.last_login
                                                    ? new Date(member.last_login).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                                                    : "Never"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    disabled={member.id === currentUser?.id}
                                                    onClick={() => handleDelete(member.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                    <p className="font-bold">Pro Tip</p>
                    <p>New staff members are automatically added as 'Waiters' when they first sign up using the restaurant's registration link.</p>
                </div>
            </div>
        </div>
    );
};

export default StaffManagement;
