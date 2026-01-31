
import { useState, useEffect } from "react";
import { Order, OrderService } from "@/services/orderService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Package,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { OrderCard } from "@/components/shared/OrderCard";

// --- Main Component ---
const AdminOrdersView = () => {
    const { supabase, user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeTab, setActiveTab] = useState<"all" | Order['status']>("all");
    const [isLoading, setIsLoading] = useState(true);

    // Pagination State
    const [page, setPage] = useState(1);
    const LIMIT = 20;

    // Stats State
    const [stats, setStats] = useState({ total: 0, pending: 0, preparing: 0, todayCount: 0 });

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Fetch stats
            const fetchedStats = await OrderService.getOrderStats(supabase);
            setStats(fetchedStats);

            // Fetch Paginated Orders
            const options: any = { limit: LIMIT, page };
            if (activeTab !== "all") {
                options.status = activeTab;
            }

            const fetchedOrders = await OrderService.getAllOrders(options, supabase);
            setOrders(fetchedOrders);
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    };

    // Reload when Tab or Page changes
    useEffect(() => {
        loadData();
    }, [activeTab, page]);

    // Reset page on tab change
    const onTabChange = (val: string) => {
        setActiveTab(val as any);
        setPage(1);
    };

    useEffect(() => {
        const subscription = OrderService.subscribeToOrders((payload) => {
            console.log('Real-time update:', payload);
            loadData();
        }, supabase);
        return () => OrderService.unsubscribeFromOrders(subscription, supabase);
    }, []);

    const handleStatusChange = async (orderId: string, status: Order['status']) => {
        if (!user) return;

        try {
            const actor = {
                role: 'admin' as const,
                name: user.user_metadata?.full_name || 'Administrator',
                userId: user.id
            };

            const updated = await OrderService.updateOrderStatus(orderId, status, actor, supabase);
            if (updated) {
                toast.success(`Order marked as ${status}`);
                loadData();
            } else {
                toast.error("Error updating status");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (orderId: string) => {
        if (confirm("Are you sure you want to delete this order?")) {
            const deleted = await OrderService.deleteOrder(orderId, supabase);
            if (deleted) {
                toast.success("Order deleted");
                loadData();
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Refresh */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-display font-bold">Orders Overview</h2>
                    <p className="text-muted-foreground">Manage ongoing and past orders.</p>
                </div>
                <Button onClick={loadData} variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="font-body">Total Orders</CardDescription>
                        <CardTitle className="text-3xl font-display">{stats.total}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="font-body">Pending</CardDescription>
                        <CardTitle className="text-3xl font-display text-yellow-600">{stats.pending}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="font-body">In Prep</CardDescription>
                        <CardTitle className="text-3xl font-display text-orange-600">{stats.preparing}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="font-body">Today</CardDescription>
                        <CardTitle className="text-3xl font-display">{stats.todayCount}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={onTabChange}>
                <TabsList className="mb-4 flex flex-wrap h-auto gap-2">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                    <TabsTrigger value="preparing">In Prep</TabsTrigger>
                    <TabsTrigger value="ready">Ready</TabsTrigger>
                    <TabsTrigger value="delivered">Delivered</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                    {orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 border rounded-lg border-dashed bg-muted/20 text-muted-foreground">
                            <Package className="h-12 w-12 mb-3 opacity-20" />
                            <p className="font-medium">No orders found</p>
                        </div>
                    ) : (
                        <>
                            <ScrollArea className="h-[calc(100vh-400px)] pr-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                                    {orders.map((order) => (
                                        <OrderCard
                                            key={order.id}
                                            order={order}
                                            userRole="admin"
                                            onStatusChange={(status) => handleStatusChange(order.id, status)}
                                            onDelete={() => handleDelete(order.id)}
                                        />
                                    ))}
                                </div>
                            </ScrollArea>

                            {/* Pagination Controls */}
                            <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                <div className="text-sm text-muted-foreground">
                                    Page {page}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" />
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={orders.length < LIMIT} // Simple check: if less than limit, we are at end
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminOrdersView;
