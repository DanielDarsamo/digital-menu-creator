import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Order, OrderService } from "@/services/orderService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut, ChefHat, Clock, CheckCircle2, User, MapPin, Printer } from "lucide-react";
import { toast } from "sonner";
import { printOrder, printMultipleOrders } from "@/utils/printOrder";

const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-MZ").format(price) + " MT";
};

const KitchenDashboard = () => {
    const { user, signOut } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = async () => {
        setLoading(true);
        // Get orders that are confirmed or preparing (kitchen's responsibility)
        const allOrders = await OrderService.getAllOrders();
        const kitchenOrders = allOrders.filter(
            (o) => o.status === 'confirmed' || o.status === 'preparing'
        );
        setOrders(kitchenOrders);
        setLoading(false);
    };

    useEffect(() => {
        loadOrders();

        const sub = OrderService.subscribeToOrders(() => {
            loadOrders();
        });

        return () => {
            OrderService.unsubscribeFromOrders(sub);
        };
    }, []);

    const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
        const res = await OrderService.updateOrderStatus(orderId, status);
        if (res) {
            toast.success(`Order marked as ${status}`);
            loadOrders();
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
                        Kitchen Dashboard
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block text-right text-xs mr-2">
                            <div className="font-bold">{user?.user_metadata?.full_name || 'Kitchen'}</div>
                            <div className="text-muted-foreground">{user?.email}</div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => signOut()}>
                            <LogOut className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 container mx-auto px-4 py-4 max-w-4xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Active Orders ({orders.length})</h2>
                    <div className="flex items-center gap-2">
                        {orders.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    printMultipleOrders(orders);
                                    toast.success("Printing all orders...");
                                }}
                                className="gap-2"
                            >
                                <Printer className="h-4 w-4" />
                                Print All
                            </Button>
                        )}
                        <Badge variant="outline" className="text-sm">
                            <Clock className="h-3 w-3 mr-1" />
                            Real-time
                        </Badge>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-muted-foreground">Loading orders...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No orders to prepare</p>
                    </div>
                ) : (
                    <ScrollArea className="h-[calc(100vh-200px)]">
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <Card key={order.id} className="overflow-hidden border-l-4 border-l-orange-500">
                                    <CardHeader className="pb-3 bg-muted/20">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="flex items-center gap-2 text-lg">
                                                    Order #{order.orderNumber}
                                                    <Badge variant={order.status === 'preparing' ? 'default' : 'secondary'}>
                                                        {order.status.toUpperCase()}
                                                    </Badge>
                                                </CardTitle>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-lg text-primary">{formatPrice(order.totalPrice)}</div>
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
                                        <div className="space-y-2">
                                            <div className="font-semibold text-sm">Items:</div>
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm py-2 px-3 bg-secondary/30 rounded">
                                                    <span>
                                                        <span className="font-bold text-primary mr-2">{item.quantity}x</span>
                                                        {item.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Notes */}
                                        {order.customerInfo?.notes && (
                                            <div className="text-sm bg-yellow-50 text-yellow-800 p-3 rounded border border-yellow-200">
                                                <div className="font-semibold mb-1">Special Instructions:</div>
                                                <div className="italic">{order.customerInfo.notes}</div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="pt-4 border-t flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    printOrder(order);
                                                    toast.success(`Printing order #${order.orderNumber}`);
                                                }}
                                                className="gap-1"
                                            >
                                                <Printer className="w-4 h-4" />
                                                Print
                                            </Button>
                                            {order.status === 'confirmed' && (
                                                <Button
                                                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                                                    onClick={() => handleUpdateStatus(order.id, 'preparing')}
                                                >
                                                    <ChefHat className="w-4 h-4 mr-2" />
                                                    Start Preparing
                                                </Button>
                                            )}
                                            {order.status === 'preparing' && (
                                                <Button
                                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleUpdateStatus(order.id, 'ready')}
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Mark Ready
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </main>
        </div>
    );
};

export default KitchenDashboard;
