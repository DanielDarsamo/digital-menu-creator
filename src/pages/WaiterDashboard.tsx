import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Order, OrderService } from "@/services/orderService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut, Bell, CheckCircle2, ChefHat, Package, Clock, MapPin, User, FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import TableView from "@/components/waiter/TableView";

const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-MZ").format(price) + " MT";
};

const WaiterOrderCard = ({
    order,
    actionButton
}: {
    order: Order,
    actionButton: React.ReactNode
}) => {
    return (
        <Card className="mb-4 overflow-hidden border-l-4 border-l-primary">
            <CardHeader className="pb-3 bg-muted/20">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            Order #{order.orderNumber}
                            <Badge variant="outline" className="bg-background">
                                {order.status.toUpperCase()}
                            </Badge>
                        </CardTitle>
                        <CardDescription>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</CardDescription>
                    </div>
                    <div className="text-right font-bold text-lg text-primary">
                        {formatPrice(order.totalPrice)}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
                {/* Customer Info */}
                {(order.customerInfo?.table || order.customerInfo?.name) && (
                    <div className="flex gap-4 text-sm font-medium p-2 bg-accent/20 rounded-md">
                        {order.customerInfo.table && (
                            <div className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>Table {order.customerInfo.table}</span>
                            </div>
                        )}
                        {order.customerInfo.name && (
                            <div className="flex items-center gap-1.5 border-l pl-4 border-muted-foreground/30">
                                <User className="h-4 w-4 text-primary" />
                                <span>{order.customerInfo.name}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Items */}
                <div className="space-y-1">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm py-1 border-b border-dashed last:border-0">
                            <span>
                                <span className="font-bold mr-2">{item.quantity}x</span>
                                {item.name}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Notes */}
                {order.customerInfo?.notes && (
                    <div className="text-sm bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-200 flex gap-2">
                        <FileText className="h-4 w-4 shrink-0 mt-0.5" />
                        <span className="italic">{order.customerInfo.notes}</span>
                    </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t mt-2">
                    {actionButton}
                </div>
            </CardContent>
        </Card>
    );
};

const WaiterDashboard = () => {
    const { user, signOut } = useAuth();
    const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
    const [myOrders, setMyOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        const available = await OrderService.getAvailableOrders();
        const mine = await OrderService.getWaiterOrders(user.id);
        setAvailableOrders(available);
        setMyOrders(mine);
        setLoading(false);
    };

    useEffect(() => {
        loadData();

        const sub = OrderService.subscribeToOrders(() => {
            // Simple approach: reload all on any change
            // Ideally we check payload, but for small scale this is robust entough
            loadData();
        });

        return () => {
            OrderService.unsubscribeFromOrders(sub);
        };
    }, [user]);

    const handleAcceptOrder = async (orderId: string) => {
        if (!user) return;
        const res = await OrderService.assignWaiter(orderId, user.id);
        if (res) {
            toast.success("Order Accepted", {
                description: `You are now responsible for Order #${res.orderNumber}`
            });
            loadData();
        } else {
            toast.error("Failed to accept order");
        }
    };

    const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
        const res = await OrderService.updateOrderStatus(orderId, status);
        if (res) {
            toast.success(`Order marked as ${status}`);
            loadData();
        } else {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
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
                    <TabsList className="grid w-full grid-cols-3 h-12">
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
                                <WaiterOrderCard
                                    key={order.id}
                                    order={order}
                                    actionButton={
                                        <div className="flex gap-2">
                                            {order.status === 'confirmed' && (
                                                <Button
                                                    className="w-full bg-orange-500 hover:bg-orange-600"
                                                    onClick={() => handleUpdateStatus(order.id, 'preparing')}
                                                >
                                                    <ChefHat className="w-4 h-4 mr-2" />
                                                    Start Preparing
                                                </Button>
                                            )}
                                            {order.status === 'preparing' && (
                                                <Button
                                                    className="w-full bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleUpdateStatus(order.id, 'ready')}
                                                >
                                                    <Package className="w-4 h-4 mr-2" />
                                                    Mark Ready
                                                </Button>
                                            )}
                                            {order.status === 'ready' && (
                                                <Button
                                                    className="w-full"
                                                    variant="default"
                                                    onClick={() => handleUpdateStatus(order.id, 'delivered')}
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Mark delivered
                                                </Button>
                                            )}
                                        </div>
                                    }
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
                                <WaiterOrderCard
                                    key={order.id}
                                    order={order}
                                    actionButton={
                                        <Button
                                            className="w-full"
                                            onClick={() => handleAcceptOrder(order.id)}
                                        >
                                            Accept Order
                                        </Button>
                                    }
                                />
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default WaiterDashboard;
