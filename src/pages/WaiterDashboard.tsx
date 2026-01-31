import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Order, OrderService } from "@/services/orderService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, CheckCircle2, ChefHat, Package } from "lucide-react";
import { toast } from "sonner";
import TableView from "@/components/waiter/TableView";
import { OrderCard } from "@/components/shared/OrderCard";

// Helper for price formatting (kept for stats view)
const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-MZ").format(price) + " MT";
};

const WaiterDashboard = () => {
    const { user, signOut, supabase } = useAuth();
    const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
    const [myOrders, setMyOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [performance, setPerformance] = useState<any>(null);

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        const available = await OrderService.getAvailableOrders(supabase);
        const mine = await OrderService.getWaiterOrders(user.id, supabase);
        const stats = await OrderService.getWaiterStats(user.id, supabase);

        setAvailableOrders(available);
        setMyOrders(mine);
        setPerformance(stats);
        setLoading(false);
    };

    useEffect(() => {
        loadData();

        const sub = OrderService.subscribeToOrders(() => {
            loadData();
        }, supabase);

        return () => {
            OrderService.unsubscribeFromOrders(sub, supabase);
        };
    }, [user]);

    const handleAcceptOrder = async (orderId: string) => {
        if (!user) return;
        try {
            // Create actor context
            const actor = {
                role: 'waiter' as const,
                name: user.user_metadata?.full_name || 'Waiter',
                userId: user.id
            };
            const res = await OrderService.acceptOrder(orderId, actor, supabase);
            if (res) {
                toast.success("Order Accepted", {
                    description: `You are now responsible for Order #${res.orderNumber}`
                });
                loadData();
            }
        } catch (error) {
            toast.error("Failed to accept order");
        }
    };

    const handleRejectOrder = async (orderId: string, reasonInput?: string) => {
        let reason = reasonInput;
        if (!reason) {
            reason = prompt("Please provide a reason for rejection (required):") || "";
        }

        if (!reason || reason.trim() === "") {
            toast.error("Rejection reason is required");
            return;
        }

        try {
            // Create actor context
            const actor = {
                role: 'waiter' as const,
                name: user?.user_metadata?.full_name || 'Waiter',
                userId: user?.id || ''
            };
            const res = await OrderService.cancelOrder(orderId, reason, actor, supabase);
            if (res) {
                toast.success("Order Rejected");
                loadData();
            }
        } catch (error) {
            toast.error("Failed to reject order");
        }
    };

    const handleUpdatePaymentType = async (orderId: string, paymentType: 'cash' | 'card' | 'mobile') => {
        if (!user) return;
        try {
            const actor = {
                role: 'waiter' as const,
                name: user.user_metadata?.full_name || 'Waiter',
                userId: user.id
            };
            await OrderService.updatePaymentType(orderId, paymentType, actor, supabase);
            toast.success(`Payment type set to ${paymentType}`);
            loadData();
        } catch (error) {
            toast.error("Failed to update payment type");
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: Order['status'], currentOrder: Order) => {
        // Validate payment type is set before marking as delivered
        if (newStatus === 'delivered' && !currentOrder.paymentType) {
            toast.error("Please select a payment type before marking as delivered");
            return;
        }

        if (!user) return;

        try {
            const actor = {
                role: 'waiter' as const,
                name: user.user_metadata?.full_name || 'Waiter',
                userId: user.id
            };
            await OrderService.updateOrderStatus(orderId, newStatus, actor, supabase);
            toast.success("Status Updated");
            loadData();
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Failed to update status");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-body">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="font-display text-xl font-bold text-primary flex items-center gap-2">
                        <ChefHat className="h-6 w-6" />
                        Waiter Portal
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block text-right text-xs mr-2">
                            <div className="font-bold">{user?.user_metadata?.full_name || 'Waiter'}</div>
                            <div className="text-muted-foreground">{user?.email}</div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => signOut()}>
                            <LogOut className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 container mx-auto px-4 py-4 max-w-5xl">
                <Tabs defaultValue="tables" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4 h-12">
                        <TabsTrigger value="tables" className="text-base">
                            Tables
                        </TabsTrigger>
                        <TabsTrigger value="my-orders" className="text-base">
                            My Orders
                            {myOrders.length > 0 && (
                                <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground">
                                    {myOrders.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="available" className="text-base">
                            Queue
                            {availableOrders.length > 0 && (
                                <Badge variant="secondary" className="ml-2 bg-yellow-500 text-white">
                                    {availableOrders.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="performance" className="text-base">
                            My Stats
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="tables">
                        <TableView />
                    </TabsContent>

                    <TabsContent value="my-orders" className="space-y-4">
                        {myOrders.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>You have no active orders.</p>
                                <p className="text-sm">Check the queue to pick up new assignments.</p>
                            </div>
                        ) : (
                            myOrders.map(order => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    userRole="waiter"
                                    onPaymentTypeChange={(type) => handleUpdatePaymentType(order.id, type)}
                                    onStatusChange={(status) => handleStatusChange(order.id, status, order)}
                                    onCancel={(reason) => handleRejectOrder(order.id, reason)}
                                />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="available" className="space-y-4">
                        {availableOrders.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No new confirmed orders.</p>
                            </div>
                        ) : (
                            availableOrders.map(order => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    userRole="waiter"
                                    onAccept={() => handleAcceptOrder(order.id)}
                                    onCancel={(reason) => handleRejectOrder(order.id, reason)}
                                />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="performance">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="border-none shadow-premium bg-card/50 backdrop-blur-sm">
                                <CardHeader className="pb-2">
                                    <CardDescription>Lifetime Orders</CardDescription>
                                    <CardTitle className="text-3xl">{performance?.total_orders || 0}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card className="border-none shadow-premium bg-card/50 backdrop-blur-sm">
                                <CardHeader className="pb-2">
                                    <CardDescription>Lifetime Revenue</CardDescription>
                                    <CardTitle className="text-3xl font-display">{formatPrice(performance?.total_revenue || 0)}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card className="border-none shadow-premium bg-card/50 backdrop-blur-sm">
                                <CardHeader className="pb-2">
                                    <CardDescription>Delivered Today</CardDescription>
                                    <CardTitle className="text-3xl text-green-600">{performance?.today_orders || 0}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card className="border-none shadow-premium bg-card/50 backdrop-blur-sm">
                                <CardHeader className="pb-2">
                                    <CardDescription>Today's Revenue</CardDescription>
                                    <CardTitle className="text-3xl font-display text-primary">{formatPrice(performance?.today_revenue || 0)}</CardTitle>
                                </CardHeader>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default WaiterDashboard;
